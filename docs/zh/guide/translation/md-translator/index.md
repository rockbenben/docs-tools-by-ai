# md-translator

Markdown 是我日常使用最频繁的文本格式，但现有的翻译工具往往难以保持其原有格式。因此，我开发了 [md-translator](https://tools.newzone.top/md-translator)，一个专为 Markdown 优化的翻译工具，旨在 **精准翻译文本的同时保持格式完整**。其翻译机制类似于字幕翻译器，详细参数说明可参考 [subtitle-translator 说明](../subtitle-translator/index.md)。  

## 为什么开发 md-translator？

在开发 md-translator 之前，我测试过以下工具，但由于各自的局限性，未能满足我的需求，这里简单记录它们的特点，供参考。  

- **[GT4T](https://www.gt4t.cn/)**：支持 Markdown 批量翻译，用户可将整个文件夹拖入 GT4T 文件翻译器，自动翻译其中的所有 Markdown 文件。然而，该工具只能商用，即使添加自定义 API，仍要求付费，因此对个人用户不太友好。
- **[Markdown Docs Translator](https://github.com/ilyachch/md_docs-trans-app)**：一款开源免费的 Markdown 翻译工具，基于网页版接口进行翻译。然而，翻译速度较慢，且在长文本处理中容易发生中断。  

## 使用说明

### 本地缓存机制

所有翻译内容都会缓存在本地，以提高重复翻译时的速度。如果需要重新翻译，可以点击 **“重置翻译缓存”** 按钮。  

### Markdown 元素支持

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

## 目录翻译

如果你需要记录文件的目录结构，则必须使用目录上传方式（例如设置 directory 属性），这样才能通过文件的 webkitRelativePath 获取相对路径信息。你可以在 beforeUpload 钩子中利用这个属性，将文件的路径信息传递给后端。比如，你可以把文件的 name 属性修改为 file.webkitRelativePath，这样在上传时就能携带完整的目录结构信息。
