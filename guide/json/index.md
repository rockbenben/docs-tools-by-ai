> For AI agents: the complete documentation index is available at /llms.txt, the full documentation bundle is available at /llms-full.txt.

# JSON 工具集

七款互补的 JSON 处理工具，覆盖从**读取** → **改值** → **加字段** → **跨数据集**的全流程。全部基于 JSONPath，可链式配合使用。

## 如何选择

| 我要做…                 | 用这个                                                                   |
| -------------------- | --------------------------------------------------------------------- |
| 从复杂 JSON 提取特定字段      | [**JSON Value Extractor**](/guide/json/json-value-extractor.md)       |
| 批量加前后缀 / 替换 / 覆盖值    | [**JSON Node Edit**](/guide/json/json-node-edit.md)                   |
| 在指定节点后插入新字段          | [**JSON Node Inserter**](/guide/json/json-node-inserter.md)           |
| 排序 JSON 数组（可按字段分组）   | [**JSON Sort & Classify**](/guide/json/json-sort-classify.md)         |
| 交换两个键的值              | [**JSON Value Swapper**](/guide/json/json-value-swapper.md)           |
| 跨 JSON 字段拷贝 / 键映射重构  | [**JSON Value Transformer**](/guide/json/json-value-transformer.md)   |
| 按 ID 字段同步两份 JSON 数据集 | [**JSON Match & Update**](/guide/json/json-match-update.md)           |
| 把 i18n JSON 翻译成多语言   | [JSON Translate](/guide/translation/json-translate/index.md)（在翻译工具集里） |

## 共同能力

- **浏览器本地处理**：JSON 解析、JSONPath 查询、所有编辑操作都在本地完成，原文不上传服务器
- **JSONPath 通用语法**：`$..title`、`$.products[*].name`、嵌套路径如 `zh.name`，七个工具语法一致
- **大文件友好**：超大 JSON 直接拖文件进上传区，不必粘进文本框，几十 MB 也不卡浏览器
- **链式使用**：先用 Extractor 取出关心的字段，再用 Node Edit 批量改，最后用 Sort & Classify 重排——一条流水线下来无需写脚本

## 典型组合

- **i18n 字典清洗**：Value Extractor 抽出所有 `title` 字段 → 翻译/审校 → Node Edit 覆盖回去
- **产品库重排**：Sort & Classify 按品类分组 + 价格降序 → Node Edit 批量加促销前缀
- **数据集同步**：从主数据库导出 JSON A、从 CRM 导出 JSON B → Match & Update 按 ID 把 B 的最新字段同步到 A
