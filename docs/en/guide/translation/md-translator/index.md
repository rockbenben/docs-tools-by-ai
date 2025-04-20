import Api from '../api.md';
import Parameters from '../api-parameters.md';
import Info from '../info.md';

# Markdown Translator

In domains such as technical documentation, open-source projects, and blog creation, Markdown has become the most widely used text markup language. However, most existing translation tools tend to break the original formatting when handling Markdown content—especially around code blocks, LaTeX formulas, or structured metadata—often resulting in garbled layouts and lost semantics.

[md-translator](https://tools.newzone.top/en/md-translator) is an intelligent translation tool designed specifically to address this issue. It delivers high‑quality translations while preserving the Markdown structure, and also offers a “Plain Text Translation Mode” that lets you translate any text document, combining format retention with free‑form translation.

## Core Feature 1: Native Support for Markdown Elements

md-translator is deeply optimized for Markdown documents and can recognize and preserve the following common syntax elements:

- FrontMatter metadata (---)  
- Headings (#)  
- Blockquotes (> quote)  
- Links (\[text](url))  
- Unordered lists (- / * / +)  
- Ordered lists (1. 2. 3.)  
- Emphasis (**bold**, _italic_)  
- Code blocks (``` )  
- Inline code (\`code`)  
- Inline LaTeX formulas ($formula$)  
- Block-level LaTeX formulas ($$formula$$)

FrontMatter, code blocks, and LaTeX formulas can each be optionally translated, so you can choose whether to process them based on your needs.

## Core Feature 2: Plain Text Translation for Any Document

Beyond structured Markdown support, md-translator provides a **“Plain Text Translation Mode,”** which skips format detection and translates any text content directly. Whether it’s Markdown, TXT, HTML, log files, or unformatted technical notes, this mode delivers accurate, efficient language conversion.

Additionally, users can supply custom AI prompts to further enhance terminology consistency, contextual coherence, and uniform translation style.

## Extended Functionality: Extracting Clean Text

md-translator can also convert Markdown content into plain text for secondary processing or semantic analysis:

- Automatically strips all Markdown markers  
- Hides code blocks, links, and other technical elements  
- Outputs plain text optimized for summarization, search indexing, or NLP processing

This feature is ideal for automated workflows such as content summarization, semantic analysis, and knowledge graph construction.

## Applicable Scenarios

- Batch translation of multilingual technical documentation  
- Internationalization of open-source project READMEs  
- Synchronized bilingual (Chinese-English) Markdown blog content  
- Format-preserving translation of mixed documents with code comments and formula explanations  
- Semantic translation and extraction of any structured or unstructured text

<Api />

<Parameters />

## Feature Description

<Info />
