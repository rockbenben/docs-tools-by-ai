# Changelog

Upcoming features: Create a local desktop client; add AI polishing for translated subtitles.

- 2025.07.29: Added context-aware translation for AI mode.
- 2025.03.20: Completed i18n (internationalization); fixed known bugs including cache key issues; project open-sourced.
- 2025.02.28: Added support for custom system and user prompts for LLM model translations.
- 2025.02.27: Enhanced timeline compatibility for bilingual subtitles, supporting formats that omit the default hour, exceed 100 hours, and display 1 to 3 millisecond digits.
- 2025.02.21: Added support for batch translating into multiple languages at once.
- 2025.02.08: Fixed encoding detection issue in multi-file mode; added interfaces for OpenAI and Groq (feedback for other interfaces is welcome).
- 2025.02.06: Added Siliconflow API; added `temperature` setting for LLM models to control AI translation randomness.
- 2025.02.05: Fixed an issue where blank lines and DeepLX line breaks were ignored during chunked translation; added separate chunk translation parameters for different APIs.
- 2025.01.18: Added support for automatic encoding detection for uploaded files; added an option to display translated content above or below the original subtitle line.
- 2025.01.13: Added a self-hosted DeepLX interface; refactored translation API settings into a separate component to simplify frontend logic.
- 2025.01.10: Added DeepSeek translation interface. Fixed DeepLX subtitle line break issue; improved translation language search and detection (added support for searching in Chinese/English).
- 2024.12.19: Added automatic detection for single-file vs. multi-file mode; added automatic source language detection; improved file export naming convention for single-file translations.
- 2024.12.12: Used p-limit to restrict concurrency, significantly reducing errors with free APIs.
- 2024.10.12: Added a custom delay setting for the GTX API. (Based on feedback, the previous setting could easily hit the limit after 150 requests, while lower numbers didn't require adjustment).
- 2024.09.08: Added batch translation limits for the GTX API to ensure stability. Added support for Traditional Chinese.
- 2024.09.07: Improved recognition of WebVTT format; set `.ass` as the default format for bilingual subtitles and added compatibility for multi-line bilingual processing.
- 2024.09.06: Added local caching for translation results to speed up the translation of repeated content.
- 2024.09.05: Added functionality to skip purely numeric or character-based content to avoid unnecessary translations.
- 2024.08.13: Added bilingual subtitle output feature.
- 2024.07.11: Added automatic subtitle format matching in single-file mode.
- 2024.07.06: Added support for `.vtt` and `.ass` subtitle formats.
- 2024.07.05: Expanded supported languages for subtitle translation to 35.
- 2024.06.26: Added a feature to extract only the subtitle content.
