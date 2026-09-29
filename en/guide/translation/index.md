> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# Translation Tools

A free translation suite for developers and content creators, split into three format-specific tools — each optimized for the quirks of its file type:

- [**Subtitle Translator**](/en/guide/translation/subtitle-translator.md) — subtitles (SRT / ASS / VTT / LRC), supports bilingual output and time-aligned tracks
- [**MD Translator**](/en/guide/translation/md-translator.md) — Markdown that preserves code blocks, LaTeX, and FrontMatter
- [**JSON Translate**](/en/guide/translation/json-translate.md) — JSON i18n with selective key translation and key mapping

## Shared Capabilities

The three tools share one translation engine and settings panel — your config moves between them:

- **Wide API choice**: classic translation APIs plus LLM endpoints covering free, commercial, and self-hosted use cases ([compare them here](/en/guide/translation/api.md))
- **120+ languages** with one-pass multi-language output: translate one English subtitle into Chinese, Japanese, German, and French at once
- **Local cache**: cached results return instantly, persist across refreshes, and sync across tabs
- **Context-aware translation**: surrounding lines accompany each request, keeping flow and terminology consistent
- **Failed-line retry**: when an LLM glitches, only the failed lines are reissued — no double-billing
- **Privacy first**: API keys and all settings stay in your browser; nothing is uploaded to a server
- **Command line too**: `yarn cli` runs the exact same pipeline as the web app across subtitles, Markdown and JSON ([CLI guide](/en/guide/translation/cli.md))

## Pick the Right Tool

| Translating…                | Use                                               |
| :-------------------------- | :------------------------------------------------ |
| YouTube / video subtitles   | Subtitle Translator                               |
| GitHub READMEs, tech blogs  | MD Translator                                     |
| `i18n.json` / `locale.json` | JSON Translate                                    |
| Any plain text              | MD Translator's Format Mode → "Ignore Formatting" |

## Three Steps to Start

1. Pick a translation API and enter its key (or use the free GTX)
2. Set your source and target languages
3. Upload a file or paste text, then click Translate

For full feature details and tuning, see the [Feature Guide](/en/guide/translation/info.md).
