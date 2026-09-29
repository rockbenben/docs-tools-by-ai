> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# Tools By AI

:::tip One-line summary
[Tools By AI](https://tools.newzone.top/en) is a **completely free, browser-local** suite of online tools covering translation, JSON processing, and text cleanup. All data stays in your browser — sensitive content never gets uploaded to a server.
:::

## Tool Overview

### 🌍 Translation Tools

Three format-specific translators (subtitle, Markdown, JSON i18n) sharing one endpoint pool (classic MT APIs plus LLMs) across 120+ languages.

- [**Subtitle Translator**](/en/guide/translation/subtitle-translator.md) — SRT / ASS / VTT / LRC with timecode alignment and bilingual output
- [**MD Translator**](/en/guide/translation/md-translator.md) — Markdown that preserves code blocks, LaTeX, and Front Matter
- [**JSON Translate**](/en/guide/translation/json-translate.md) — i18n JSON with selective key translation and key mapping

[→ Enter Translation Tools](/en/guide/translation.md)

### 📝 Text Tools

Seven complementary text utilities covering **format conversion → content cleanup → chunking → joining → diffing → general-purpose ops → spreadsheet batch processing**.

- [**Chinese Conversion**](/en/guide/text/chinese-conversion.md) — Simplified ↔ Traditional, regional variants
- [**Novel Processor**](/en/guide/text/novel-processor.md) — web-novel TXT formatting, ad removal, chapter fixes
- [**Text Splitter**](/en/guide/text/text-splitter.md) — split by symbol / chars / paragraphs
- [**Text Joiner**](/en/guide/text/text-joiner.md) — merge columns by template into CSV / SQL / JSON
- [**Text Diff**](/en/guide/text/text-diff.md) — two-pane diff, first-difference locator, .patch export
- [**Multi-Function Text Processor**](/en/guide/text/text-toolbox.md) — regex match, dedupe, batch prefix/suffix, line ops
- [**Data Batch**](https://tools.newzone.top/en/data-batch) — spreadsheet dedupe, column extraction, batch prefixes (no dedicated guide yet)

[→ Enter Text Tools](/en/guide/text.md)

### 🔧 JSON Tools

Seven complementary JSON tools covering **read → edit → add → cross-dataset sync**, all JSONPath-based.

- [**JSON Value Extractor**](/en/guide/json/json-value-extractor.md) — read: pull fields via JSONPath
- [**JSON Node Edit**](/en/guide/json/json-node-edit.md) — edit: batch prefix/suffix, replace, overwrite
- [**JSON Node Inserter**](/en/guide/json/json-node-inserter.md) — add: insert fields after a target node
- [**JSON Match & Update**](/en/guide/json/json-match-update.md) — sync: merge values across datasets by ID

[→ Enter JSON Tools (all 7)](/en/guide/json.md)

## Three Steps to Start

1. **No signup**: every tool is free and runs purely client-side — just open and use
2. **No API key needed** (for translation): the default free GTX engine works out of the box; switch to DeepSeek / Claude / GPT in the top-right settings when you want higher quality
3. **Data stays on your machine**: API keys and translation cache live only in your browser's localStorage / IndexedDB

***

## Philosophy

> The age of AI has arrived, and everyone can now customize their own exclusive tools.

I truly enjoy using AI to write tools or scripts, but to be honest, I still remain cautious about the current capabilities of AI. While it can certainly help us with basic, repetitive tasks, it often falls short of ideal outcomes.

Therefore, I prefer to use AI as an **assistant in tool creation** rather than handing over complete tasks to it. The popular concept of "AI agents" today essentially involves organizing multiple AI tools into a workflow—the core of which still relies on human-defined processes.

My preferred approach is to "toolify" specific tasks. By leveraging AI's abilities, I develop individual, controllable, and practical standalone tools to ensure that every step of the process meets expectations.

[Tools By AI](https://tools.newzone.top/en) is built on this very concept. It uses AI-assisted programming to turn ideas into practical tools. This document, in turn, provides a detailed explanation of the methods and logic behind using these tools.
