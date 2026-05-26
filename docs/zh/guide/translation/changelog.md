---
head:
  - - meta
    - property: og:title
      content: 翻译工具更新日志 - 功能迭代与修复记录 | Tools By AI
description: 查看翻译工具的完整更新历史。本页记录了从最初版本至今的所有功能新增、性能优化和问题修复，包括 AI 上下文翻译、多语言支持扩展等重要里程碑。
---

# 更新日志

待更新功能：本地客户端化；对翻译后的字幕内容进行 ai 润色。

- 2026.05.26: 翻译引擎深度调优。
  - Claude API 自动启用 prompt caching（`cache_control`）——同一 system prompt 多次复用时，输入 token 享受 ~90% 折扣
  - Custom (OpenAI-compatible) 新增可选 maxTokens 上限，防止本地小模型陷入重复输出循环；Claude / Gemini / OpenAI-compat 同步加上 `finish_reason=length` 截断检测
  - Custom 本地 LLM 默认 contextWindow 从 100 降到 30，适配 14B 以下的小模型
  - 失败处理升级：单行失败自动回填原文（保证输出可用）；多语言批量翻译中整语言失败聚合到独立面板，可一键复制语言代码重试
  - SRT / VTT 双语模式新增 **ASS 输出** 选项，原文 / 译文走独立样式（Default / Secondary），方便后期独立调整字体颜色大小
  - 友好错误提示：NetworkError / 超时 / 级联中止给出可读文案，不再 "Failed to fetch" 一刀切
  - Thinking 模式按模型独立保存开关状态；UI 自动区分三档（off/low/med/high）/ 二档（off/on）/ 仅 low-high 三种 effort 形态；intrinsic-thinking SKU 不再误显示 toggle
  - 语言选择器升级：122 种语言按地理 + 使用人数分组；多语言模式新增 "Top 10 / 欧洲 / 东亚 / 印度次大陆" 4 个预设，单语言场景记忆最近 5 个选过的语言；移动端单列布局
  - DeepLX 在服务下拉中下移到 DeepL 后面（品牌成组，稳定版在前）
- 2026.05.06: 服务目录 v2 大版本更新。
  - 新增 MT 服务 **TranslateGemma**（Google 翻译专用 Gemma 衍生模型，本地自托管）
  - 新增 LLM 提供商：MiniMax、Tencent Hunyuan（混元）、Baidu ERNIE（千帆）、Cohere
  - 各提供商支持区域端点快速切换（Mainland CN / International / US 等）
  - DeepSeek、NVIDIA NIM、Claude 等支持 Thinking 模式 + 推理强度（low / medium / high）
  - Custom (OpenAI-compatible) 新增不发送 system 消息开关，兼容 Gemma 系列 chat template
  - URL 字段 onBlur 自动补全 `/v1/chat/completions`，避免误用 Responses / 旧 completions API
  - 新增独立的 Prompt 预设管理（与 LLM API 预设解耦，可自由组合）
  - 主页面新增 API Status 状态徽章 + 一键源/目标语言互换
  - 修复：关闭缓存时仍在写入 IndexedDB；LLM-backed MT (Qwen-MT / TranslateGemma) retry 行为对齐 LLM
- 2025.07.29: 支持ai模式下的上下文关联翻译。
- 2025.03.20：完成 i18n 化；修复缓存 key 等已知 bug；项目开源。
- 2025.02.28：LLM 模型翻译时支持自定义系统提示词和用户提示词。
- 2025.02.27: 增强双语字幕的时间轴兼容性，支持省略默认小时、超过 100 小时的时间格式，以及 1 至 3 位数的毫秒显示。
- 2025.02.21: 支持一次性批量翻译成多种语言。
- 2025.02.08：修复多文件模式下的编码识别问题；新增 OpenAI 和 Groq 的 接口（有其他接口可反馈）。
- 2025.02.06：新增 Siliconflow API；为 LLM 模型添加 temperature 设置，控制 AI 翻译随机性。
- 2025.02.05: 修复分块翻译时忽略空行和 DeeplX 换行符错误的问题；为不同 API 单独设置分块翻译参数。
- 2025.01.18: 支持自动识别上传文件的编码；可以设置翻译内容显示在原字幕的上一行或下一行。
- 2025.01.13：新增 DeepLX 自部署接口；将翻译 API 设置改为独立组件，简化前端设置逻辑。
- 2025.01.10：新增 DeepSeek 翻译接口。修复 DeepLX 字幕换行问题；优化翻译语言搜索识别（中英搜索支持）。
- 2024.12.19：自动识别单文件与多文件模式；新增自动识别源语言；优化单文件翻译后的文件导出命名规则。
- 2024.12.12: 使用 pLimit 限制并发模式，大幅减少免费 API 的报错问题。
- 2024.10.12：为 GTX API 添加了自定义延迟设置。（根据反馈，原设置在超过 150 次后容易达到上限，数量较低时则无需调整）
- 2024.09.08：增加 GTX API 的分批翻译限制，确保翻译的稳定性。新增繁体中文支持。
- 2024.09.07：优化对 webvtt 格式的识别；默认双语字幕格式为 .ass，并兼容多行字幕的双语处理。
- 2024.09.06：为翻译结果添加本地缓存，提升重复内容的翻译速度。
- 2024.09.05：跳过纯数字或字符内容，避免不必要的翻译。
- 2024.08.13：新增双语字幕输出功能。
- 2024.07.11：在单文件模式下，自动匹配字幕格式。
- 2024.07.06：新增对 vtt 和 ass 格式字幕的支持。
- 2024.07.05：字幕翻译语言支持扩展至 35 种。
- 2024.06.26：新增仅提取字幕内容的功能。
