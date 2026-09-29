> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# JSON Tools

Seven complementary tools that take you from **read** → **edit** → **add** → **cross-dataset sync**. All share the same JSONPath syntax so they chain naturally.

## Pick the Right Tool

| I want to…                                  | Use                                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| Extract specific fields from JSON           | [**JSON Value Extractor**](/en/guide/json/json-value-extractor.md)                     |
| Batch add prefix/suffix, replace, overwrite | [**JSON Node Edit**](/en/guide/json/json-node-edit.md)                                 |
| Insert new fields after a specific node     | [**JSON Node Inserter**](/en/guide/json/json-node-inserter.md)                         |
| Sort JSON arrays (with optional grouping)   | [**JSON Sort & Classify**](/en/guide/json/json-sort-classify.md)                       |
| Swap values of two keys                     | [**JSON Value Swapper**](/en/guide/json/json-value-swapper.md)                         |
| Copy fields across JSON / key remap         | [**JSON Value Transformer**](/en/guide/json/json-value-transformer.md)                 |
| Sync two JSON datasets by ID                | [**JSON Match & Update**](/en/guide/json/json-match-update.md)                         |
| Translate i18n JSON into multiple languages | [JSON Translate](/en/guide/translation/json-translate/index.md) (in Translation Tools) |

## Shared Capabilities

- **Browser-local processing**: JSON parsing, JSONPath queries, and all edit operations run in your browser — source never uploads to a server
- **Unified JSONPath syntax**: `$..title`, `$.products[*].name`, nested paths like `zh.name` — same expressions across all seven tools
- **Large-file friendly**: drop oversized JSON straight into the upload area instead of pasting it, and tens of MB stay smooth
- **Chainable**: pull fields with Extractor, batch-edit with Node Edit, regroup with Sort & Classify — a full pipeline without writing a script

## Common Combinations

- **i18n dictionary cleanup**: Value Extractor pulls every `title` → translate/review → Node Edit overwrites them back
- **Product catalog regroup**: Sort & Classify by category + price descending → Node Edit adds a promo prefix
- **Dataset sync**: Export JSON A from the main DB and JSON B from CRM → Match & Update merges B's fresh fields into A by ID
