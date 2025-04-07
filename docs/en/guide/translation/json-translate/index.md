import Api from '../api.md';
import Info from '../info.md';

# JSON Translate

[JsonTranslate](https://tools.newzone.top/en/json-translate) is a multilingual JSON translation tool designed for developers and content creators. It supports Google Translate, Azure, and DeepL(X) translation APIs to help with project internationalization and localization. Whether you are developing a multilingual website, app, or managing multilingual datasets, JsonTranslate offers a simple solution to easily translate JSON file content into multiple target languages.

![](https://img.newzone.top/2023-12-18-16-09-04.gif?imageMogr2/format/webp "JsonTranslate Usage Example")

## Translation Modes

### Global Translation

Global translation recursively traverses the entire JSON structure, translating all string values while preserving the original hierarchy and structure of the JSON.

**Suitable for:**

- Translating all text in an entire JSON file
- One-click translation without complex configurations

### Specific Node

Using a JSONPath expression, you can precisely target one or more nodes and translate only the string content within those nodes. Multiple paths can be specified, separated by commas.

**Suitable for:**

- JSON data with a clear hierarchy where only specific parts need translation
- Reducing the translation scope for large JSON files to improve efficiency

### Specific Key Names

In this mode, you can specify particular key names to translate. Two input methods are supported:

- **Simple Mode:** Enter the key names to be translated directly in the input box, separated by commas (in either English or Chinese), and the program will translate the content of those keys.
- **Advanced Mode:** Set the mapping between input and output keys using the key mapping component. The translation result will be written to a new field while keeping the original field unchanged.

**Suitable for:**

- Translating only specific fields, such as `title` or `description`
- Outputting translation results to different fields to avoid overwriting the original data

**Notes:**

- Key names are case-sensitive
- If the JSON contains arrays, avoid using pure numbers as key names to prevent them from being interpreted as indices
- The number of input and output keys must match

### Selective Translation

This mode is suitable for flat JSON structures. You can specify a starting node and the field names to be translated. The system will search from the specified node for target fields in all objects and translate them.

**Configuration Options:**

- **Starting Key** (optional): Specify the key from which to begin the search, suitable for scenarios where key order matters
- **Fields to Translate:** The specific field names to translate, separated by commas if there are multiple

**Suitable for:**

- Translating only specific fields in a flat structure, such as the "message" field in logs or error messages
- JSON files with simple structures where fields appear repeatedly but only need selective translation

### i18n Mode

i18n mode is designed for multilingual scenarios, allowing the aggregation of multiple language fields within the original JSON structure. It is ideal for building translation files for multilingual websites or apps, or managing multilingual configurations under a unified structure.

#### How It Works

- Uses the selected source language as the source field. For example, if the source language is `zh`, the source field is `zh`. If the source language is set to `auto`, the default source field is `en`.
- Traverses all objects in the JSON that contain the source language field and adds a target language field (at the same level as the source field) for each object.
- If the target language field already exists, translation is skipped to avoid overwriting existing content.
- When both i18n mode and multilingual mode are enabled, the system generates a unified JSON structure that includes the source language and all target languages. This is especially useful for internationalization projects.

#### Example

```json
{
  "title": {
    "en": "Settings"
  }
}
```

If the target languages are set to `zh` and `fr`, the translation result is:

```json
{
  "title": {
    "en": "Settings",
    "zh": "设置",
    "fr": "Paramètres"
  }
}
```

<Api />

## Feature Description

### Mapped Translation

When using the specified key name mode, you can switch between the single key mode and the mapped translation mode using the toggle button in the result area. In single key mode, the same node is used for both translation input and output. In mapped translation mode, however, translations involve different nodes—for example, the value of node A is translated to node B, and the value of node C is translated to node D.

![](https://img.newzone.top/2023-12-19-11-42-37.png?imageMogr2/format/webp "Mapped Translation Example")

<Info />

### JSON Key Names and Their Limitations

JSON data is stored as key-value pairs, where a "key" (also known as a "name") is a string that uniquely identifies a specific item or element in the data record, forming the basis for data retrieval and manipulation. JsonTranslate leverages the identifying function of JSON key names to achieve precise translation.

Below is an explanation of several key names in the example:

- `downvote.message`: This is a nested key name. `downvote` is the key of the outer object, and `message` is a key within the `downvote` object.
- `提示词.message`: Here, `提示词` is a key that contains an object, which in turn has a key named `message`.
- `share.owner`: This key contains a dot (`.`) and is treated as a single key rather than indicating a nested relationship. In this case, if you want to access the `name` within the `share.owner` object, you cannot use `share.owner.name` because it would be mistakenly interpreted as looking for a `name` key within an `owner` object. In reality, `share.owner` is a complete key name.

```json
{
  "downvote": {
    "message": "Downvote"
  },
  "提示词": {
    "message": "prompt"
  },
  "share.owner": {
    "name": "rabbit"
  },
  "data": {
    "title": {
      "id": "001",
      "name": "cabbages"
    }
  },
  "content": [
    {
      "id": "001",
      "value": "Hello, cabbage."
    },
    {
      "id": "002",
      "value": "Hello, Radish."
    }
  ]
}
```

Currently, JsonTranslate cannot process JSON key names that contain a dot (`.`). This is because the dot in JSONPath is used to distinguish nested object keys, which can lead to keys with dots being misinterpreted as multiple levels of nested objects. To avoid this issue, it is recommended to use key names without dots.
