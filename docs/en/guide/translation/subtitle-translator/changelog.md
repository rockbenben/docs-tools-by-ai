# Changelog

Upcoming Features: Local clientization; AI refinement of translated subtitles.

- 2025.03.20: Completed i18n; fixed known bugs such as cache key issues; project open-sourced.
- 2025.02.28: Added support for custom system prompts and user prompts for LLM model translations.
- 2025.02.27: Enhanced timeline compatibility for bilingual subtitles, supporting omission of default hours, time formats exceeding 100 hours, and millisecond displays with 1 to 3 digits.
- 2025.02.21: Added support for batch translation into multiple languages simultaneously.
- 2025.03.20: Completed i18n; fixed known bugs such as cache key issues; project open-sourced.
- 2025.02.08: Fixed encoding recognition issues in multi-file mode; added interfaces for OpenAI and Groq (feedback for additional interfaces is welcome).
- 2025.02.06: Added Siliconflow API; introduced temperature settings for LLM models to control AI translation randomness.
- 2025.02.05: Fixed issues with ignoring blank lines and DeeplX newline errors during segmented translation; set segmented translation parameters individually for different APIs.
- 2025.01.18: Added automatic encoding recognition for uploaded files; allows translated text to be displayed either above or below the original subtitles.
- 2025.01.13: Added DeepLX self-deployment interface; separated translation API settings into an independent component to simplify front-end configuration.
- 2025.01.10: Added DeepSeek translation interface; fixed DeepLX subtitle newline issues; optimized language search recognition for translations (supports Chinese-English searches).
- 2024.12.19: Added automatic recognition for single-file and multi-file modes; introduced automatic source language detection; optimized export naming rules for single-file translations.
- 2024.12.12: Employed pLimit to restrict concurrency, significantly reducing error reports from free APIs.
- 2024.10.12: Added custom delay settings for GTX API. (Based on feedback, the original setting tends to hit limits after more than 150 calls; no adjustment is needed for lower volumes.)
- 2024.09.08: Added batch translation limits for GTX API to ensure translation stability; introduced Traditional Chinese support.
- 2024.09.07: Optimized recognition of webvtt format; set default bilingual subtitle format to .ass with support for multi-line bilingual processing.
- 2024.09.06: Implemented local caching for translation results to speed up repeated translations.
- 2024.09.05: Skips purely numeric or character content to avoid unnecessary translations.
- 2024.08.13: Added bilingual subtitle output functionality.
- 2024.07.11: Automatically matches subtitle formats in single file mode.
- 2024.07.06: Added support for vtt and ass subtitle formats.
- 2024.07.05: Expanded subtitle translation language support to 35 languages.
- 2024.06.26: Added functionality to extract only subtitle content.
