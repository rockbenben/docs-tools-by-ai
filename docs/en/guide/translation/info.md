### Translation Cache

This tool introduces an optional local translation cache to improve translation efficiency and reduce resource consumption:

- Cache rules: Each translation result is stored with a unique key formatted as `source text_target language_source language_translation API_model settings`.
- Cache hit condition: The local cache result is used only when the parameters match exactly, ensuring accuracy.
- Cache purpose: Avoid repeated translations, reduce API calls, and improve translation speed.

To disable the use of translation cache, you can uncheck "Use translation cache" or click "Clear translation cache" in the API settings.

### Multilingual Translation

Supports translating the same file into multiple languages at once, which is especially suitable for international video content:

- For example: Translate an English file simultaneously into Chinese, Japanese, German, and French for the convenience of global users.
- Supports 35 mainstream languages and will continue to expand.

## Usage Notice

When using this tool, please note the following:

- DeepL support: Since the DeepL API does not support direct calls from the web, a server-side forwarding interface is provided solely for data transmission, and **it will not collect user data**. For better stability, users can also choose to deploy this interface themselves.
- Using the DeepLX free interface may sometimes return null. Please wait a moment and try again, or use your own API KEY or deploy your own forwarding interface.
- API Key security: This tool does not store your API key; all configuration data is saved in your local browser.
- GTX Web interface: This interface places considerable load on the server, so it is recommended to enable it manually only when deploying locally. Please avoid using it in networks with a global proxy enabled to prevent translation errors.
