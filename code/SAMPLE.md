```csharp
// ================================
// JsonUiLocalizer.cs (commented)
// ================================
using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

public class JsonUiLocalizer : IUiLocalizer
{
    private readonly IWebHostEnvironment _env;
    private readonly IMemoryCache _cache;
    private readonly ILogger<JsonUiLocalizer> _logger;

    // Shared JSON serializer options (Web defaults: camelCase, etc.)
    private static readonly JsonSerializerOptions _json = new(JsonSerializerDefaults.Web);

    /// <summary>
    /// Creates a JSON-based UI localizer that reads translation files from
    /// Resources/i18n/{culture}/{namespace}.json and caches them in memory.
    /// </summary>
    public JsonUiLocalizer(IWebHostEnvironment env, IMemoryCache cache, ILogger<JsonUiLocalizer> logger)
    {
        _env = env;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Translates a key using the given namespace and culture.
    /// Falls back to English ("en") if the key is missing for the requested culture.
    /// Returns the key itself when no translation is found (debug-friendly).
    /// </summary>
    /// <param name="key">Translation key to look up.</param>
    /// <param name="ns">Logical namespace (file path under i18n). Defaults to "components/navbar".</param>
    /// <param name="culture">Culture code (e.g., "pt-PT" or "en"). If null, uses CurrentUICulture.</param>
    /// <returns>Localized string if found; otherwise returns the original key.</returns>
    public string T(string key, string? ns = null, string? culture = null)
    {
        // Normalize culture: use current UI culture if not provided,
        // and reduce to the two-letter ISO (e.g., "pt-PT" -> "pt").
        var cul = string.IsNullOrWhiteSpace(culture)
            ? CultureInfo.CurrentUICulture.TwoLetterISOLanguageName
            : culture.Split('-')[0].ToLowerInvariant();

        // Default namespace for header/navigation labels
        ns ??= "components/navbar";

        // Try primary culture first
        var dict = LoadDictionary(cul, ns);
        if (dict != null && dict.TryGetValue(key, out var val) && !string.IsNullOrEmpty(val))
            return val;

        // Fallback to English if the primary culture did not resolve the key
        if (!cul.Equals("en", StringComparison.OrdinalIgnoreCase))
        {
            dict = LoadDictionary("en", ns);
            if (dict != null && dict.TryGetValue(key, out val) && !string.IsNullOrEmpty(val))
                return val;
        }

        // Log for observability: missing key in both primary and fallback cultures
        _logger.LogDebug("Missing i18n key '{Key}' in {Culture}/{Ns}", key, cul, ns);

        // Return the key itself to make missing translations visible in the UI
        return key;
    }

    /// <summary>
    /// Loads a translation dictionary from disk (or cache) for a given culture and namespace.
    /// File path pattern: Resources/i18n/{culture}/{ns}.json
    /// </summary>
    /// <param name="culture">Two-letter culture code (e.g., "pt", "en").</param>
    /// <param name="ns">Logical namespace; maps to a file name under the culture folder.</param>
    /// <returns>Dictionary of translations, or null if the file does not exist.</returns>
    private Dictionary<string, string>? LoadDictionary(string culture, string ns)
    {
        // Memory cache key: one entry per culture/namespace pair
        var cacheKey = $"i18n:{culture}:{ns}";
        if (_cache.TryGetValue(cacheKey, out Dictionary<string, string>? hit))
            return hit;

        // Build absolute file path to the JSON dictionary
        var path = Path.Combine(_env.ContentRootPath, "Resources", "i18n", culture, $"{ns}.json");
        if (!File.Exists(path))
            return null;

        // Read and deserialize the JSON file into a string dictionary
        var text = File.ReadAllText(path);
        var map = JsonSerializer.Deserialize<Dictionary<string, string>>(text, _json) ?? new();

        // Cache the dictionary to avoid repeated disk I/O (short TTL is usually enough)
        _cache.Set(cacheKey, map, TimeSpan.FromMinutes(10));
        return map;
    }
}
```

---

```json
// ===============================================
// Example: Resources/i18n/pt/components/navbar.json
// ===============================================
{
  "home": "Início",
  "about": "Sobre Nós",
  "services": "Serviços",
  "projects": "Projetos",
  "blog": "Blog",
  "contact": "Contactos",
  "login": "Entrar",
  "register": "Registar",
  "logout": "Sair",
  "profile": "Perfil"
}
```

```json
// ===============================================
// Example: Resources/i18n/en/components/navbar.json
// ===============================================
{
  "home": "Home",
  "about": "About Us",
  "services": "Services",
  "projects": "Projects",
  "blog": "Blog",
  "contact": "Contact",
  "login": "Login",
  "register": "Register",
  "logout": "Logout",
  "profile": "Profile"
}
```
