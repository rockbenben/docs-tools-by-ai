import Api from '../api.md';
import Info from '../info.md';

# Markdown Translator

Markdown is the text format I use most frequently in my daily work, but existing translation tools often struggle to preserve its original formatting. That's why I developed [md-translator](https://tools.newzone.top/en/md-translator), a translation tool optimized specifically for Markdown. It is designed to **accurately translate content while fully preserving the original format**.

## Supported Markdown Elements

md-translator currently supports parsing the following Markdown syntax and retains their formatting during translation:

- **FrontMatter metadata (`---`)**  
- **Headings (`#`)**  
- **Links (`[text](url)`)**  
- **Unordered lists (`-` / `*` / `+`)**  
- **Ordered lists (`1. 2. 3.`)**  
- **Emphasis (`**bold**`, `_italic_`)**  
- **Code blocks (```)**  
- **Inline code (\`code\`)**  
- **Blockquotes (`> quote`)**

Additionally, md-translator can **extract plain text content**, stripping away Markdown syntax and optionally hiding elements like links and code blocks, making it suitable for other purposes.

<Api />

<Info />
