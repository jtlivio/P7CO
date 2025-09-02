// Implements a remote UI localizer that fetches localization resources from HTTP endpoints,
// caches them, and provides translation lookup with negative caching for missing keys/files.

using System.Collections.Concurrent;
using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

public sealed class RemoteUiLocalizer : IUiLocalizer
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RemoteUiLocalizer> _log;

    private readonly string _staticBase;      
    private readonly string _ghRawBase;       
    private readonly string _defaultCulture;  // e.g., "pt"
    private readonly TimeSpan _ttl;
    private readonly string _missingFmt;      // e.g., "[[{cul}:{ns}:{key}]]"

    private static readonly JsonSerializerOptions _json = new(JsonSerializerDefaults.Web);
    private static readonly TimeSpan _negFileTtl = TimeSpan.FromSeconds(30);   // negative cache for missing file
    private static readonly TimeSpan _negKeyTtl  = TimeSpan.FromSeconds(30);   // negative cache for missing key

    // Single-flight per (culture, namespace) — coalescing concurrent loads
    private static readonly ConcurrentDictionary<string, Lazy<Task<Dictionary<string,string>?>>> _inflight = new();

    public RemoteUiLocalizer(
        IHttpClientFactory httpFactory,
        IMemoryCache cache,
        ILogger<RemoteUiLocalizer> log,
        IConfiguration cfg)
    {
        _httpFactory = httpFactory;
        _cache = cache;
        _log = log;

        var lc = cfg.GetSection("Localization");
        _staticBase     = lc["StaticBaseUrl"]  ?? throw new ArgumentException("Localization:StaticBaseUrl missing");
        _ghRawBase      = lc["GitHubRawBase"]  ?? throw new ArgumentException("Localization:GitHubRawBase missing");
        _defaultCulture = (lc["DefaultCulture"] ?? "en").Split('-')[0].ToLowerInvariant();
        _ttl            = TimeSpan.FromSeconds(int.TryParse(lc["CacheSeconds"], out var s) ? s : 300);
        _missingFmt     = lc["MissingFormat"] ?? "[[{cul}:{ns}:{key}]]";
    }

    public string T(string key, string ns, string culture) => T(key, ns, culture, null);

    public string T(string key, string ns, string culture, string? def)
    {
        var cul = NormalizeCulture(culture);
        ns = SanitizeNs(ns);

        // Prevent repeated misses for the same key in a short period
        if (IsKeyNegCached(cul, ns, key))
            return def ?? FormatMissing(key, ns, cul);

        // Try to get the map for the requested culture
        var map = GetMapSync(cul, ns)
               ?? (_defaultCulture != cul ? GetMapSync(_defaultCulture, ns) : null)
               ?? (cul != "en" ? GetMapSync("en", ns) : null);

        if (map != null && map.TryGetValue(key, out var val) && !string.IsNullOrEmpty(val))
            return val;

        // If not found: mark miss for key (short negative cache) and return default or missing marker
        NegCacheKey(cul, ns, key);

        if (!string.IsNullOrEmpty(def))
            return def!;

        _log.LogDebug("i18n miss key='{Key}' ns='{Ns}' culture='{Culture}'", key, ns, cul);
        return FormatMissing(key, ns, cul);
    }

    // ---------- Map retrieval by (culture, namespace) ----------

    private Dictionary<string, string>? GetMapSync(string culture, string ns)
        => GetMapAsync(culture, ns).GetAwaiter().GetResult();

    private async Task<Dictionary<string,string>?> GetMapAsync(string culture, string ns)
    {
        var cul = culture.Split('-')[0].ToLowerInvariant();
        var cacheKey = $"i18n:{cul}:{ns}";
        if (_cache.TryGetValue(cacheKey, out Dictionary<string,string>? hit)) return hit;

        var negFileKey = $"i18n:negfile:{cul}:{ns}";
        if (_cache.TryGetValue(negFileKey, out _)) return null;

        // Single-flight: only one concurrent load per (culture, namespace)
        var loader = _inflight.GetOrAdd(cacheKey, _ =>
            new Lazy<Task<Dictionary<string,string>?>>(async () =>
        {
            var urls = new[]
            {
                $"{TrimSlash(_staticBase)}/ui/{cul}/{ns}.json",
                $"{TrimSlash(_ghRawBase)}/ui/{cul}/{ns}.json"
            };

            foreach (var url in urls)
            {
                var map = await TryFetch(url);
                if (map is { Count: > 0 })
                {
                    _cache.Set(cacheKey, map, _ttl);
                    return map;
                }
            }

            // File missing → short negative cache
            _cache.Set(negFileKey, true, _negFileTtl);
            return null;
        }));

        try
        {
            return await loader.Value;
        }
        finally
        {
            _inflight.TryRemove(cacheKey, out _);
        }
    }

    // ---------- HTTP fetch + parsing (single request) ----------

    private async Task<Dictionary<string,string>?> TryFetch(string url)
    {
        try
        {
            var http = _httpFactory.CreateClient();
            using var resp = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            if (!resp.IsSuccessStatusCode)
            {
                _log.LogDebug("i18n fetch {Status} {Url}", (int)resp.StatusCode, url);
                return null;
            }

            // Read the content once
            await using var stream = await resp.Content.ReadAsStreamAsync();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            ms.Position = 0;

            // 1) Try to deserialize as a flat map
            try
            {
                var flat = await JsonSerializer.DeserializeAsync<Dictionary<string,string>>(ms, _json);
                if (flat is { Count: > 0 }) return flat;
            }
            catch
            {
                // May not be flat — proceed to flatten
            }

            // 2) If not flat, read as string and flatten
            ms.Position = 0;
            using var sr = new StreamReader(ms, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: true);
            var json = await sr.ReadToEndAsync();
            var map  = FlattenJson(json);
            return map.Count > 0 ? map : null;
        }
        catch (Exception ex)
        {
            _log.LogDebug(ex, "i18n fetch failed: {Url}", url);
            return null;
        }
    }

    private static Dictionary<string,string> FlattenJson(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var dict = new Dictionary<string,string>(StringComparer.OrdinalIgnoreCase);

        void Walk(JsonElement el, string prefix)
        {
            switch (el.ValueKind)
            {
                case JsonValueKind.Object:
                    foreach (var p in el.EnumerateObject())
                        Walk(p.Value, string.IsNullOrEmpty(prefix) ? p.Name : $"{prefix}.{p.Name}");
                    break;
                case JsonValueKind.Array:
                    var i = 0;
                    foreach (var v in el.EnumerateArray())
                        Walk(v, $"{prefix}[{i++}]");
                    break;
                default:
                    if (!string.IsNullOrEmpty(prefix)) dict[prefix] = el.ToString();
                    break;
            }
        }

        Walk(doc.RootElement, "");
        return dict;
    }

    // ---------- Negative cache for missing keys ----------

    private bool IsKeyNegCached(string cul, string ns, string key)
        => _cache.TryGetValue($"i18n:negkey:{cul}:{ns}:{key}", out _);

    private void NegCacheKey(string cul, string ns, string key)
        => _cache.Set($"i18n:negkey:{cul}:{ns}:{key}", true, _negKeyTtl);

    // ---------- Utilities ----------

    private string FormatMissing(string key, string ns, string cul)
        => _missingFmt.Replace("{key}", key).Replace("{ns}", ns).Replace("{cul}", cul);

    private static string NormalizeCulture(string? c)
    {
        if (string.IsNullOrWhiteSpace(c))
            c = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
        var two = c.Split('-')[0].ToLowerInvariant();
        return string.IsNullOrWhiteSpace(two) ? "en" : two;
    }

    private static string SanitizeNs(string ns)
    {
        ns = (ns ?? "").Trim().TrimStart('/');
        if (ns.StartsWith("ui/", StringComparison.OrdinalIgnoreCase)) ns = ns[3..];
        return ns.TrimEnd('.');
    }

    private static string TrimSlash(string s) => s.Trim().TrimEnd('/').TrimStart('/');
}
