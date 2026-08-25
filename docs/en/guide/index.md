---
head:
  - - meta
    - property: og:title
      content: Tools By AI Guide - Free Online Tools for Translation, JSON, Text Processing
description: Tools By AI is a suite of free, AI-assisted online tools covering subtitle translation, Markdown translation, i18n JSON processing, text cleanup, and more. Browser-local processing — your data never leaves your machine.
---

# Tools By AI

:::tip One-line summary
[Tools By AI](https://tools.newzone.top/en) is a **completely free, browser-local** suite of online tools covering translation, JSON processing, and text cleanup. All data stays in your browser — sensitive content never gets uploaded to a server.
:::

## Tool Overview

### 🌍 Translation Tools

Three format-specific translators (subtitle, Markdown, JSON i18n) sharing 9 translation APIs and 26 LLM endpoints across 120+ languages.

- [**Subtitle Translator**](./translation/subtitle-translator/) — SRT / ASS / VTT / LRC with timecode alignment and bilingual output
- [**MD Translator**](./translation/md-translator/) — Markdown that preserves code blocks, LaTeX, and Front Matter
- [**JSON Translate**](./translation/json-translate/) — i18n JSON with selective key translation and key mapping

[→ Enter Translation Tools](./translation/)

### 📝 Text Tools

Seven complementary text utilities covering **format conversion → content cleanup → chunking → joining → diffing → general-purpose ops → spreadsheet batch processing**.

- [**Chinese Conversion**](./text/chinese-conversion.mdx) — Simplified ↔ Traditional, regional variants
- [**Novel Processor**](./text/novel-processor.mdx) — web-novel TXT formatting, ad removal, chapter fixes
- [**Text Splitter**](./text/text-splitter.mdx) — split by symbol / chars / paragraphs
- [**Text Joiner**](./text/text-joiner.mdx) — merge columns by template into CSV / SQL / JSON
- [**Text Diff**](./text/text-diff.mdx) — two-pane diff, first-difference locator, .patch export
- [**Text Toolbox**](./text/text-toolbox.mdx) — regex match, dedupe, batch prefix/suffix, line ops
- [**Data Batch**](https://tools.newzone.top/en/data-batch) — spreadsheet dedupe, column extraction, batch prefixes (no dedicated guide yet)

[→ Enter Text Tools](./text/)

### 🔧 JSON Tools

Seven complementary JSON tools covering **read → edit → add → cross-dataset sync**, all JSONPath-based.

- [**JSON Value Extractor**](./json/json-value-extractor.mdx) — read: pull fields via JSONPath
- [**JSON Node Edit**](./json/json-node-edit.mdx) — edit: batch prefix/suffix, replace, overwrite
- [**JSON Node Inserter**](./json/json-node-inserter.mdx) — add: insert fields after a target node
- [**JSON Match & Update**](./json/json-match-update.mdx) — sync: merge values across datasets by ID

[→ Enter JSON Tools (all 7)](./json/)

## Three Steps to Start

1. **No signup**: every tool is free and runs purely client-side — just open and use
2. **No API key needed** (for translation): the default free GTX engine works out of the box; switch to DeepSeek / Claude / GPT in the top-right settings when you want higher quality
3. **Data stays on your machine**: API keys and translation cache live only in your browser's localStorage / IndexedDB

---

## Philosophy

> The age of AI has arrived, and everyone can now customize their own exclusive tools.

I truly enjoy using AI to write tools or scripts, but to be honest, I still remain cautious about the current capabilities of AI. While it can certainly help us with basic, repetitive tasks, it often falls short of ideal outcomes.

Therefore, I prefer to use AI as an **assistant in tool creation** rather than handing over complete tasks to it. The popular concept of "AI agents" today essentially involves organizing multiple AI tools into a workflow—the core of which still relies on human-defined processes.

My preferred approach is to "toolify" specific tasks. By leveraging AI's abilities, I develop individual, controllable, and practical standalone tools to ensure that every step of the process meets expectations.

[Tools By AI](https://tools.newzone.top/en) is built on this very concept. It uses AI-assisted programming to turn ideas into practical tools. This document, in turn, provides a detailed explanation of the methods and logic behind using these tools.
