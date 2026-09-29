> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# Text Tools

Seven complementary plain-text utilities covering **format conversion → content cleanup → chunking → joining → diffing → general-purpose ops → spreadsheet batch processing**. All run locally in your browser — sensitive data never leaves your machine.

## Pick the Right Tool

| I want to…                                                                  | Use                                                                                |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Convert Simplified ↔ Traditional Chinese (TW / HK)                          | [**Chinese Conversion**](/en/guide/text/chinese-conversion.md)                     |
| Reformat web novels, fix chapter titles, strip ads                          | [**Novel Processor**](/en/guide/text/novel-processor.md)                           |
| Split long text by symbol / chars / paragraphs                              | [**Text Splitter**](/en/guide/text/text-splitter.md)                               |
| Merge multi-column text into CSV / SQL / JSON                               | [**Text Joiner**](/en/guide/text/text-joiner.md)                                   |
| Compare two texts or files, pinpoint the first diff                         | [**Text Diff**](/en/guide/text/text-diff.md)                                       |
| Regex match, dedupe, batch prefix/suffix, line ops                          | [**Multi-Function Text Processor**](/en/guide/text/text-toolbox.md)                |
| Dedupe a spreadsheet by its first two columns, pull the third, batch-prefix | [**Data Batch**](https://tools.newzone.top/en/data-batch) (no dedicated guide yet) |

## Shared Capabilities

- **Browser-local**: file reading, parsing, and processing happen locally — sensitive data stays on your machine
- **Batch input**: multi-document paste and multi-file upload throughout
- **Custom Replacement Rules**: Chinese Conversion and Novel Processor let you mark "do-not-process" terms (iPhone, OpenAI, custom names)
- **Chainable**: split a huge doc → run regex cleanup → convert to Traditional

## Common Combinations

- **Web-novel reading prep**: Novel Processor strips ads + fixes chapter headings → Chinese Conversion to TW Traditional → export
- **Machine-translation prep**: Text Splitter chunks a long doc at 5000 characters (the Google / DeepL free-tier cap) → Multi-Function Text Processor regex-cleans each chunk → export segment files
- **Multilingual archive cleanup**: Multi-Function Text Processor filters out Japanese lines → Chinese Conversion to Simplified → Text Splitter by paragraph
- **Spreadsheet data into a database**: paste Excel columns into Text Joiner → SQL VALUES preset builds the INSERT → verify against production with Text Diff
- **Revision review**: drop the before/after drafts into Text Diff → export a `.patch` for the record
