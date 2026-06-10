---
head:
  - - meta
    - property: og:title
      content: Translation Tools Changelog - Feature Updates & Bug Fixes | Tools By AI
description: See the complete update history for our translation tools. This page logs all new features, optimizations, and bug fixes, including major milestones like AI context translation.
---

# Changelog

Upcoming features: add AI polishing for translated subtitles.

- 2026.06.10: New **Glossary** feature.
  - Pin fixed translations for names and domain terms, applied per target language; multiple presets (one per show / project), TSV bulk import/export (optional third column for a target language code — one file imports terms for several languages), editor with search / duplicate warnings / pagination
  - Multi-layer enforcement: LLMs get only the terms hit by the current text injected per request (no token waste); Qwen-MT uses the official native `translation_options.terms` parameter; lines that ignore a required term are retried once with a stricter instruction; a post-hoc replacement net guarantees terms land on every service
  - Coverage: all LLM services + Qwen-MT; plain MT APIs (GTX / Google / DeepL / Azure / TranslateGemma) have no in-model term channel, so the glossary card is hidden there
  - New glossary status chip next to the API status badge showing on/off state and term count — click to jump to settings
- 2026.06.09: Stability and accessibility hardening.
  - An adversarial-review hardening pass across the translation engine and the subtitle / Markdown / JSON / text tool groups: placeholder and code-fence protection, format edge cases, and explicit errors for invalid paths / regexes instead of silent no-ops
  - Subtitle alignment fix: when batch markers go missing, lines are no longer guessed by position — no more shifted translations
  - Accessibility: skip-to-content link and navigation landmarks added; all tool controls are now keyboard-operable
- 2026.06.06: Added YandexGPT (AI Studio).
  - New LLM provider **YandexGPT (AI Studio)**: authenticates with API key + Folder ID; ships YandexGPT 5.1 / Alice AI / Qwen3 / DeepSeek / GPT-OSS SKUs, or paste a full `gpt://` model URI; the official API sends no CORS headers, so requests route through the built-in proxy
  - TranslateGemma gains an **optional API key** for gated deployments (LM Studio's "require API key", vLLM's `--api-key`, or a reverse-proxy auth layer)
- 2026.06.01: Added GitHub Models; thinking-control overhaul.
  - New LLM provider **GitHub Models**: authenticates with a GitHub PAT (`models:read` scope), with a free tier tiered per model (GPT-4.1 / 4.1 Mini / 4o Mini, Mistral Medium 3, Phi-4, Llama 3.3 70B) — a good no-cost entry point for users without a paid key. The gateway doesn't support reasoning params, so no thinking toggle is shown.
  - Thinking-control overhaul: Mistral (Medium 3.5 / Small 4) and Cohere Command A Reasoning move from always-on to an **off / on** toggle; Perplexity Sonar Deep Research gains **off / low / medium / high**.
  - Custom (unlisted) models on a thinking-capable provider get a new **three-state off / on / auto** control: off explicitly disables, on enables, auto omits the param to follow the model's default (a fallback for strict providers that error on non-thinking models); defaults to off.
  - Fix: provider selection guard is now purely derived, so a stale bundle no longer silently overrides the user's choice.
- 2026.05.26: Translation engine deep-tuning.
  - New opt-in `maxTokens` cap for Custom (OpenAI-compatible) to prevent local small-model repetition loops; `finish_reason=length` truncation detection added to Claude / Gemini / OpenAI-compat
  - Default `contextWindow` for Custom local LLM lowered from 100 to 30 to match the behavior of models under 14B
  - Failure handling: failed lines now auto-fill with original text (output always usable); whole-language failures in multi-language mode aggregate into a dedicated panel with one-click copy-target-language for retry
  - SRT / VTT bilingual mode adds an **ASS output** option with separate Default / Secondary styles for original and translation — independent font/color/size tweaks in any subtitle editor
  - Friendly error messages for NetworkError / timeout / cascaded abort — no more raw "Failed to fetch"
  - Thinking mode toggle now stored per model; UI auto-distinguishes three-level (off/low/med/high) / binary (off/on) / low-high-only effort variants; intrinsic-thinking SKUs no longer show a useless toggle
  - Language picker overhaul: 122 languages grouped by geography + speaker count; multi-language mode adds Top 10 / Europe / East Asia / Indian Subcontinent presets; single-language mode remembers the last 5 picks; mobile collapses to a single column
  - DeepLX moved below DeepL in the service dropdown (brand-grouped, stable version first)
- 2026.05.06: Service catalog v2 — major release.
  - New MT service: **TranslateGemma** (Google's translation-specialized Gemma derivative, self-hosted)
  - New LLM providers: MiniMax, Tencent Hunyuan, Baidu ERNIE (Qianfan), Cohere
  - Quick-pick regional endpoints across providers (Mainland CN / International / US, etc.)
  - Thinking mode + reasoning effort (low / medium / high) for DeepSeek, NVIDIA NIM, Claude, etc.
  - New "skip system message" toggle for Custom (OpenAI-compatible), compatible with Gemma chat templates
  - URL field auto-completes `/v1/chat/completions` on blur — guards against misusing Responses / legacy completions
  - Standalone Prompt preset management (decoupled from LLM API presets, freely combinable)
  - Main page now shows an API Status badge plus a one-click source/target language swap
  - Fixed: cache writes were happening even when caching was disabled; LLM-backed MT (Qwen-MT, TranslateGemma) retry behavior now aligns with LLM
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
