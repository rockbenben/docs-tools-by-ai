import Api from '../api.md';
import Parameters from '../api-parameters.md';
import Info from '../info.md';

# Markdown Translator

Markdown is the text format I use most frequently in my daily work, but existing translation tools often struggle to preserve its original formatting. That's why I developed [md-translator](https://tools.newzone.top/en/md-translator), a translation tool optimized specifically for Markdown. It is designed to **accurately translate content while fully preserving the original format**.

## Supported Markdown Elements

md-translator currently supports parsing the following Markdown syntax and retains formatting during translation:

- FrontMatter metadata (`---`)  
- Headings (`#`)  
- Blockquotes (`> quote`)  
- Links (`[text](url)`)  
- Unordered lists (`-` / `*` / `+`)  
- Ordered lists (`1.` `2.` `3.`)  
- Emphasized text (`**bold**`, `_italic_`)  
- Code blocks (```)  
- Inline code (`\`code\``)  
- Inline LaTeX formulas (`$formula$`)  
- Block-level LaTeX formulas (`$$formula$$`)

Additionally, md-translator can extract plain text content by removing Markdown syntax, while hiding elements such as links and code blocks for alternative uses.

<Api />

<Parameters />

## Feature Description

<Info />
