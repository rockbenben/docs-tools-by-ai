import Api from '../api.md';
import Parameters from '../api-parameters.md';
import Info from '../info.md';

# Markdown 翻译器

Markdown 是我日常使用最频繁的文本格式，但现有的翻译工具往往难以保持其原有格式。因此，我开发了 [md-translator](https://tools.newzone.top/zh/md-translator)，一个专为 Markdown 优化的翻译工具，旨在 **精准翻译文本的同时保持格式完整**。

## Markdown 元素支持

md-translator 目前已支持解析以下 Markdown 语法，并在翻译时保持格式：

- **FrontMatter 元数据（---）**  
- **标题（#）**  
- **链接（\[text](url)）**  
- **无序列表（- / * / +）**  
- **有序列表（1. 2. 3.）**  
- **加重字体（**加粗**，_斜体_）**  
- **代码块（```）**  
- **内联代码（\`code\`）**  
- **引用块（> 引用）**  

此外，md-translator **可提取纯文本内容**，去除 Markdown 标记，同时隐藏链接和代码块等元素，以便用于其他用途。

<Api />

<Parameters />

## 功能说明

<Info />
