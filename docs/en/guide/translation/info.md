### Translation Cache

This tool introduces an optional local translation cache to improve translation efficiency and reduce resource consumption:

- Cache rules: Each translation result is stored with a unique key formatted as `source text_target language_source language_translation API_model settings`.
- Cache hit condition: The local cache result is used only when the parameters match exactly, ensuring accuracy.
- Cache purpose: Avoid repeated translations, reduce API calls, and improve translation speed.

To disable the use of translation cache, you can uncheck "Use translation cache" or click "Clear translation cache" in the API settings.

### Multilingual Translation

Supports translating the same file into multiple languages at once, which is especially suitable for international video content:

- For example: Translate an English file simultaneously into Chinese, Japanese, German, and French for the convenience of global users.
- Supports 50 major languages, with more to be added continually.

## FAQ

### Why is the translation result empty or showing as null?

This issue may be caused by one of the following reasons:

- The API Key is incorrect, or your account has run out of credits/tokens;
- There is an error in the API settings, preventing the request from being sent properly;
- The translation rate is set too high, or the API service is temporarily unstable.

You can use your browser's developer tools (press **F12 → switch to the Network tab**) to inspect the API response and further troubleshoot the issue.

If only part of the content failed to translate, try clicking the “Translate” button again. When translation caching is enabled, the system will skip already translated content to avoid duplicate charges or requests.

### Why use a third-party interface to access DeepL?

DeepL's official service does not allow direct access via web pages, so we use an intermediate gateway to send your request.

This relay interface **only transmits data and does not collect any personal information**, so you can use it with confidence. If you require greater stability, you may set up your own gateway.

### Will my API Key be saved?

No! Your API Key and other settings **are stored only in your own browser**. We do not upload or record any of your information.

### Why isn’t the GTX Web interface enabled?

GTX Web puts significant load on the server, so it is disabled by default.

If you're using this tool on your own computer, you can enable it manually. Please avoid using it under a global proxy network, as this may cause translation issues.
