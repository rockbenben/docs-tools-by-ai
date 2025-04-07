# JSON Value Extractor

[JSON Value Extractor](https://tools.newzone.top/en/json-value-extractor) enables you to extract specific values from JSON data using JSONPath notation. Simply specify the path to the desired node and, if needed, add prefixes and suffixes to the extracted values. If multiple matching nodes are found, their values will be concatenated, each on a new line.

## How to use

1. Upload a JSON file or paste JSON content in the text area
2. Enter the JSONPath expression (without the leading $) to extract values
   - Example: `data.title` to extract all title values under data
   - Example: `messages[*].text` to extract text from all messages
3. Optionally add prefix and suffix text for each extracted value
   - Use {value} as a placeholder to include the extracted value in your prefix/suffix
4. Click "Start Process" to extract values

The tool supports extracting strings, numbers, and boolean values. If you attempt to extract an object or array, the tool will show an error message and skip that node.

For large JSON files, enable "Large Mode" to work with bigger datasets more efficiently.
