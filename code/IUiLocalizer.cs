public interface IUiLocalizer
{
    // namespacePath: ex. "components/navbar"
    string T(string key, string? namespacePath = null, string? culture = null);
}
