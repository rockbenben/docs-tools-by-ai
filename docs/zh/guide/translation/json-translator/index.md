# JsonTranslate

[JsonTranslate](https://tools.newzone.top/json-translate)，一款专为开发者和内容创作者设计的多语言 JSON 翻译工具，支持 Google Translate、Azure 和 DeepL(X) 翻译 API，助力项目国际化和本地化。无论你是在开发多语言网站、应用程序还是处理多语言数据集，JsonTranslate 都能提供简便的解决方案，轻松将 JSON 文件中的内容翻译为多种目标语言。

![](https://img.newzone.top/2023-12-18-19-18-41.png?imageMogr2/format/webp)

该工具的设计理念与市面上其他多语言翻译器不同。常见的翻译器虽然追求一键自动化，但通常配置繁琐，且往往需要付费订阅。JsonTranslate 的设计初衷是为了解决 ChatGPT Shortcut 和 IMGPrompt 等个人或开源项目中的英汉互译问题而设计，特别适合那些翻译文件不多的项目。

相比传统的全站自动化翻译工具，JsonTranslate 更加注重用户需求。它能针对特定节点或键名进行翻译，大大简化了多语言翻译的流程，使得翻译工作更为高效、精准。它已成功测试了 5 万行 JSON 数据，即使使用免费 API 也能确保翻译全部完成。你只需粘贴需要翻译的文本，即可完成项目 i18n。

## 翻译模式

### 全局翻译

全局翻译会遍历 JSON 中的所有键和值，进行整体翻译。对于大多数情况，直接使用全局翻译即可满足需求。

### 指定节点

用户可以通过指定局部节点的 JSONPath 来遍历该节点下的所有键值对，并对其进行翻译。该模式更适合需要分组处理的翻译任务。

### 指定键名

用户可以指定特定的键名，JsonTranslate 会根据所选键名对对应的值进行翻译。该模式适合精确翻译特定部分内容。键名（key）是访问 JSON 结构中特定信息的关键，可以由数字、英文字母、中文等非符号字符组成。在命名时需注意大小写的区别。对于包含数组`[]`的 JSON 数据，建议避免使用数字作为键名，因为这会被认为是数组索引，从而可能引起混淆或错误。

为了同时指定多个键名的翻译，你可以通过逗号进行分隔 (中英文逗号均可)。如果你刚开始接触 JSON 的键名，不妨参考使用问题中的示例说明，可以帮助你更好地理解键名的格式和使用方式。

## 使用说明

![](https://img.newzone.top/2023-12-18-16-09-04.gif?imageMogr2/format/webp "JsonTranslate 使用示例")

点击「开始翻译」按钮后，翻译完成可以选择「复制结果」。

![](https://img.newzone.top/2023-12-19-11-42-37.png?imageMogr2/format/webp "映射翻译示例")

结果界面右侧还设有灰色按钮，用于切换翻译节点模式，包括单一键名模式和映射翻译模式。单一键名模式下，翻译的输入输出使用相同节点，而映射翻译模式则涉及不同节点的翻译。例如，节点 A 的值将翻译至节点 B，节点 C 的值翻译至节点 D。

## 使用问题

### 返回 null

### JSON 键名及其局限性

JSON 数据是以键值对的形式存储的，其中“键”（也称为“名称”）是一个字符串，用于唯一标识数据记录中的特定项目或元素，是数据检索和操作的基础。JsonTranslate 正是利用了 JSON 键名的标识作用来实现精准化识别翻译。

以下是对示例中的几个键名的解释：

- `downvote.message`：这是一个嵌套的键名。`downvote` 是外层对象的键名，而 `message` 是 `downvote` 对象内部的一个键名。
- `提示词.message`：这里 `提示词` 是一个键名，它本身包含一个对象，该对象有一个键 `message`。
- `share.owner`：这个键名包含了一个点（`.`），它是一个单独的键名而不是指示嵌套关系。在这种情况下，如果你想访问 `share.owner` 对象中的 `name`，你不能使用 `share.owner.name`，因为这会被错误解释为查找一个名为 `owner` 的对象内的 `name` 键，而实际上 `share.owner` 是一个完整的键名。

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

目前，JsonTranslate 无法处理包含点（`.`）的 JSON 键名。这是因为点号在 JSONPath 中用于区分嵌套对象的键名，使得含点的键名可能被误解为多层嵌套对象。为避免这一问题，建议使用不含点的键名。
