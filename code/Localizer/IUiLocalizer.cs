public interface IUiLocalizer
{
    string T(string key, string ns, string culture);
    string T(string key, string ns, string culture, string? def);
}
