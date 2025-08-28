public class JsonUiLocalizer : IUiLocalizer
{
    private readonly IWebHostEnvironment _env;
    private readonly IMemoryCache _cache;
    private readonly ILogger<JsonUiLocalizer> _logger;
    private static readonly JsonSerializerOptions _json = new(JsonSerializerDefaults.Web);

    public JsonUiLocalizer(IWebHostEnvironment env, IMemoryCache cache, ILogger<JsonUiLocalizer> logger)
    {
        _env = env; _cache = cache; _logger = logger;
    }

    public string T(string key, string? ns = null, string? culture = null)
    {
        var cul = string.IsNullOrWhiteSpace(culture)
            ? CultureInfo.CurrentUICulture.TwoLetterISOLanguageName
            : culture.Split('-')[0].ToLowerInvariant();

        // namespace default para o header
        ns ??= "components/navbar";

        var dict = LoadDictionary(cul, ns);
        if (dict != null && dict.TryGetValue(key, out var val) && !string.IsNullOrEmpty(val)) return val;

        // fallback para EN
        if (!cul.Equals("en", StringComparison.OrdinalIgnoreCase))
        {
            dict = LoadDictionary("en", ns);
            if (dict != null && dict.TryGetValue(key, out val) && !string.IsNullOrEmpty(val)) return val;
        }

        _logger.LogDebug("Missing i18n key '{Key}' in {Culture}/{Ns}", key, cul, ns);
        return key; // mostra a chave se faltar
    }

    private Dictionary<string,string>? LoadDictionary(string culture, string ns)
    {
        var cacheKey = $"i18n:{culture}:{ns}";
        if (_cache.TryGetValue(cacheKey, out Dictionary<string,string>? hit)) return hit;

        var path = Path.Combine(_env.ContentRootPath, "Resources", "i18n", culture, $"{ns}.json");
        if (!File.Exists(path)) return null;

        var text = File.ReadAllText(path);
        var map = JsonSerializer.Deserialize<Dictionary<string,string>>(text, _json) ?? new();
        _cache.Set(cacheKey, map, TimeSpan.FromMinutes(10));
        return map;
        }
}
