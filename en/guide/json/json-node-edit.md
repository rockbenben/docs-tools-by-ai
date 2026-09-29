> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# JSON Node Edit Tool

[JSON Node Edit Tool](https://tools.newzone.top/en/json-node-edit) allows you to batch find specific nodes in JSON data and perform editing operations on their values. You can add prefixes, suffixes, replace text, directly replace entire node values, or perform multilingual replacements and other advanced operations.

![JSON Node Edit Interface](/img/json-node-edit-en.webp "JSON Node Edit Interface")

:::tip 30-second quickstart

1. Paste or upload your JSON data
2. Enter node path(s) in **🔍 JSONPaths** (e.g. `title`, `zh.title,en.title` — comma-separated)
3. Pick an operation: **Add Prefix** / **Add Suffix** / **Find Text** / **Replace Node Value**
4. Click **Start processing** — all matching nodes get edited at once

:::

## Features Overview

- **Batch Editing**: Simultaneously find and edit multiple JSON nodes (separated by commas)
- **Complex Paths**: Support for nested key access (e.g., `zh.title`) and JSONPath syntax
- **Multiple Operations**: Add prefix/suffix, find and replace, directly replace node values
- **Multilingual Support**: Automatically recognize language codes and replace with corresponding language names
- **Capitalize First Letter**: Optionally capitalize the first letter of node values
- **File Operations**: Support for file upload, download, and clipboard copying

## How to Use

### 1. Input JSON Data

- Paste JSON data into the left text box, or
- Use the drag-and-drop area to upload JSON or TXT files

### 2. Specify JSONPath

- Enter the node paths you want to find in the "🔍 JSONPaths" input field
- Separate multiple paths with commas, e.g., `title,description` or `zh.name,en.name`

### 3. Configure Editing Operations

You can choose one or more of the following operations:

- **Add Prefix/Suffix**: Add specific text before/after the node value
- **Find and Replace**: Search for specific text within node values and replace it with new text
- **Direct Value Replacement**: Replace the entire node value with a specified new value

### 4. Advanced Settings

- **Capitalize First Letter**: Automatically capitalize the first letter of node values (only applies to strings that begin with lowercase letters)
- **Language code → name**: reads the language code from the node path (e.g. zh, en, ja) and automatically replace search text with corresponding language names
- **Large-file friendly**: upload large JSON instead of pasting it, avoiding a huge textarea render

### 5. Execute and View Results

- Click the "Start Processing" button to apply edits
- Processed JSON data will display on the right side
- Use the "Copy", "Copy Node", or "Export File" buttons to save results

## Tips and Tricks

- When processing multilingual JSON, enable "Language code → name" to automatically replace specified text with language names corresponding to the path
- Use "Replace Node Value" to completely replace found node values, ignoring other editing operations
- Upload the file instead of pasting when processing large JSON — the page stays responsive
- Use commas to separate multiple JSONPaths to edit nodes in different locations simultaneously

## Supported Language Codes

The tool supports the following language codes in multilingual replacement mode: Chinese (zh), English (en), Japanese (ja), Korean (ko), Spanish (es), French (fr), German (de), Italian (it), Russian (ru), Portuguese (pt), Hindi (hi), Arabic (ar), Bengali (bn).
