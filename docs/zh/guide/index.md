---
head:
  - - meta
    - property: og:title
      content: Tools By AI 指南 - 免费在线工具集，翻译 / JSON / 文本处理
description: Tools By AI 是一套 AI 辅助开发的免费在线工具集，覆盖字幕翻译、Markdown 翻译、i18n JSON 处理、文本清洗等开发与办公场景，浏览器本地运行，原文不上传服务器。
---

# Tools By AI

:::tip 一句话介绍
[Tools By AI](https://tools.newzone.top/zh) 是一套**完全免费、浏览器本地运行**的在线工具集，覆盖翻译、JSON 处理、文本清洗三大场景。所有数据在你的浏览器里完成处理——敏感内容不会上传到服务器。
:::

## 工具一览

### 🌍 翻译工具

字幕、Markdown、JSON i18n 三种格式专用翻译，共享 8 种翻译 API + 21 种 AI 大模型，覆盖 120+ 语言。

- [**Subtitle Translator**](./translation/subtitle-translator/) — SRT / ASS / VTT / LRC 字幕，时间轴对齐、双语输出
- [**MD Translator**](./translation/md-translator/) — Markdown 翻译，保留代码块、LaTeX、Front Matter
- [**JSON Translate**](./translation/json-translate/) — i18n JSON，按 key 选择性翻译、key 映射

[→ 进入翻译工具集](./translation/)

### 📝 文本工具

四款互补的纯文本处理工具，覆盖**格式转换 → 内容清洗 → 分段切片 → 通用文本操作**。

- [**中文转换**](./text/chinese-conversion.mdx) — 简繁体、台湾 / 香港地区词
- [**小说处理**](./text/novel-processor.mdx) — 网文 TXT 排版、去广告、章节修复
- [**文本分割**](./text/text-splitter.mdx) — 按字数 / 段落 / 分隔符切分
- [**多功能文本处理**](./text/text-toolbox.mdx) — 正则匹配、去重、批量加前后缀、行操作

[→ 进入文本工具集](./text/)

### 🔧 JSON 工具

七款互补的 JSON 处理工具，覆盖**读取 → 改值 → 加字段 → 跨数据集**，全部基于 JSONPath。

- [**JSON Value Extractor**](./json/json-value-extractor.mdx) — 读取：用 JSONPath 提取字段
- [**JSON Node Edit**](./json/json-node-edit.mdx) — 改值：批量加前后缀、替换、覆盖
- [**JSON Node Inserter**](./json/json-node-inserter.mdx) — 加字段：在指定节点后插入新字段
- [**JSON Match & Update**](./json/json-match-update.mdx) — 跨集同步：按 ID 字段合并两份数据

[→ 进入 JSON 工具集（共 7 款）](./json/)

## 三步上手

1. **不需要注册**：所有工具都是免费 + 纯前端，打开就能用
2. **不需要 API Key**（翻译工具）：默认走免费的 GTX 接口，想要高质量可在右上角填入 DeepSeek / Claude / GPT 的 Key
3. **数据不出本机**：API Key 和翻译缓存都只存在浏览器 localStorage / IndexedDB

---

## 设计理念

> AI 时代已经来临，每个人都能定制属于自己的专属工具。

我非常喜欢用 AI 来编写工具或脚本，但老实说，我对目前 AI 的能力仍持保留态度。它确实能够协助我们完成一些基础、重复性的任务，但要达到理想效果，往往还差一截。

因此，我更倾向于将 AI 作为**构建工具的辅助角色**，而不是完全交由它独立完成任务。如今流行的"AI 智能体"概念，本质上也是将多个 AI 工具组织成一个工作流，其核心仍然是人为设定明确的流程。

我更喜欢的方式是：将具体任务"工具化"。借助 AI 的能力，开发出一个个可控、可用的独立工具，确保每一步流程都符合预期。

[Tools By AI](https://tools.newzone.top/zh) 正是基于这一理念而构建的。它利用 AI 辅助编程的方式，把灵感变成可以落地的实用工具。而本文档，正是对这些工具的使用方法与实现逻辑的详细说明。
