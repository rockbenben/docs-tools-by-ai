> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# Chinese Converter

[Chinese Converter](https://tools.newzone.top/en/chinese-conversion) is a fully-local Chinese text converter supporting Simplified, Traditional (Taiwan / Hong Kong, each with a character-form-only and a regional-vocabulary variant / OpenCC mode), and Japanese Shinjitai — any direction. It exposes two quick buttons (Trad→Simp, Simp→Trad), a Custom Language card for arbitrary pairs, a user-editable custom replacement rules, and batch file processing.

![Chinese Converter interface](/img/chinese-conversion-en.webp "Chinese Converter interface")

## Supported language codes

The tool uses 7 internal codes:

| Code  | Meaning                                                               |
| ----- | --------------------------------------------------------------------- |
| `cn`  | Simplified Chinese                                                    |
| `tw`  | Traditional Chinese (Taiwan) — character form only                    |
| `twp` | Traditional Chinese (Taiwan) + regional vocabulary swaps (e.g. 视频↔影片) |
| `hk`  | Traditional Chinese (Hong Kong) — HK-specific forms                   |
| `hkp` | Traditional Chinese (Hong Kong) + regional vocabulary swaps           |
| `t`   | OpenCC-mode Traditional — standard form conversion                    |
| `jp`  | Japanese Shinjitai (modern kanji forms)                               |

## Page layout

Two columns:

- **Left**: input area (upload + textarea) + two quick buttons + result card
- **Right**: Conversion Settings + Custom Language + Custom Replacement Rules panel

## Quick conversion (left column)

Two primary action buttons:

- **Trad → Simp**: from some Traditional form to Simplified
- **Simp → Trad**: from Simplified to some Traditional form

Which Traditional variant is used depends on the **Convert Regional Terms** toggle on the right:

| Vocabulary toggle | Trad → Simp (t2s) actual | Simp → Trad (s2t) actual |
| ----------------- | ------------------------ | ------------------------ |
| ON                | `twp → cn`               | `cn → twp`               |
| OFF               | `t → cn`                 | `cn → t`                 |

## Custom Language (right column)

For other combinations (tw↔hk, t↔jp, etc.):

1. Pick the **Source Language** from the dropdown
2. Pick the **Target Language** from the dropdown
3. Click **Custom Convert**

⚠️ Note: when a custom pair **doesn't touch Simplified** (e.g. tw↔hk), the custom replacement rules doesn't apply. If you have rules defined, the tool shows a "rules inactive" hint.

## Conversion Settings (right column)

Four toggles:

- **Convert Regional Terms**: controls the Traditional variant used by quick buttons (see table above). The Custom Language card is unaffected.
- **Smart Line Break**: re-merge wrap-broken lines based on Chinese end-of-sentence punctuation (OCR cleanup helper)
- **Single File Mode**: process one file at a time; uploading a new file replaces the current one
- **Auto Export After Conversion**: skip the preview and directly download the result — useful for batch runs

## Custom Replacement Rules

The tool's power feature — a user-editable list of terms that should NOT be converted.

### How it works

- **s2t rules**: applied during Simp→Trad (`from` is Simplified word, `to` is the Traditional form to preserve)
- **t2s rules**: applied during Trad→Simp
- The two rule sets are stored and managed independently

### When it's applied

The custom replacement rules **only applies when one side is Simplified**:

- ✅ `cn → tw/twp/hk/t/jp` → applies **s2t rules**
- ✅ `tw/twp/hk/t/jp → cn` → applies **t2s rules**
- ❌ `tw ↔ hk`, `t ↔ jp` and other pure-Traditional pairs → dictionary skipped
- ❌ When the master toggle is off → no rules applied

### Managing rules

Click "Manage Rules" on the Custom Replacement Rules panel (bottom-right) to open the drawer:

- Switch between s2t / t2s direction tabs
- Add, edit, delete individual rules (from → to)
- Batch import / export (the dictionary is shared with the Novel Processor tool)

### Typical use cases

- Force the Simplified "机器人" (robot — a common tech term where the Simplified character is preferred) to stay as "机器人" during Simp→Trad instead of becoming "機器人"
- Preserve Simplified forms of brand names regardless of conversion direction
- Add Traditional-form proper names to t2s rules to prevent incorrect simplification

## File upload

- Drag-and-drop or click; supports `.txt`, `.csv`, `.json`, `.md` and other rich-text formats
- Multi-file by default — drop a batch and process them all at once
- In multi-file mode the textarea is hidden; each file exports under its original name

## Result card

After single-file conversion, the result card appears with:

- **Copy**: one-click clipboard
- **Export**: download under the original filename (or `jianfan.txt`)
- **Edit in place**: modify the result text directly

With "Auto Export" enabled, the preview is skipped and the result downloads immediately.

## Use cases

- **Document localization**: sync content across Mainland / Taiwan / Hong Kong audiences
- **OCR cleanup**: pair with Smart Line Break to repair scanned text
- **Academic / classical texts**: use the custom replacement rules to preserve proper names and technical terms
- **Content creation**: publish blogs and novels in both Simplified and Traditional versions
- **Batch data**: process `.json` / `.csv` / multiple TXT files containing Chinese fields

## Why local-only?

Built on [js-opencc](https://github.com/rockbenben/js-opencc) (a JavaScript port of [OpenCC](https://github.com/BYVoid/OpenCC)) with dictionaries synced from upstream. Runs entirely in your browser — **files never leave your machine**, safe for sensitive material.
