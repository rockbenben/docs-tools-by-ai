# 文档站防漂移重构设计

日期：2026-09-30
仓库：`docs-tools-by-ai`（Rspress 文档站，发布到 docs.newzone.top）
关联仓库：`web-tools-by-ai` v3.2.0（文档所描述的工具站，同级 checkout）

## 1. 背景与问题

文档站描述的工具站已经把「工具清单 / 服务商 / 模型 / 语言」收进单一事实源
（`src/app/lib/toolRegistry.ts` 的 `TOOL_REGISTRY`、`src/app/lib/translation/registry.ts`
的 `PROVIDERS`、`languages-data.ts`），文档站这边却是各处手抄，已经三向漂移。实测证据：

| 事实 | 源码（实跑 tsx import 求得） | 文档正文 | `rspress.config.ts` |
| --- | --- | --- | --- |
| 经典翻译 API | 9（`category: "machine-translation"`） | 9 | **7** |
| 可见大模型接口 | **27**（llm 18 + aggregator 11 − hidden 2） | 26（缺 OpenCode Go） | **23** |
| 中转开关接口数 | 实测 **23** 家 = 顶层 `defaultUseRelay` 的 21 家（openai-compat 工厂成员）**＋** `defaults.useRelay` 的 2 家（手写 service 的 claude / yandex）——两个真源，只看其一必漏 | **22**（`api.mdx` zh/en :175 逐个列名，只缺新加的 OpenCode Go，其余名单是对的） | — |
| Custom 端点快捷项 | 实测 **9** 个：LM Studio / Ollama / llama.cpp / koboldcpp / LiteLLM / 9Router / OmniRoute / Together AI / Fireworks AI；TranslateGemma 与 MiLMMT 各 **3** 个（LM Studio / llama.cpp / koboldcpp） | 「七个快捷地址」；且 changelog 2026-08 记的「三处的四个快捷项完全一致」对 Custom 已不成立 | — |
| 目标语言 | 122 + `auto`（`languages` 共 123 条） | 120+ / 122 并存 | 120+ |
| 引擎合计口径 | — | 「35 种引擎」散见 5 个文件 | — |
| 模型代际 | GPT-6 Astra/Sol/Luna、Claude Opus 5.5 / Sonnet 5 / Haiku 4.5 / Fable 5.1、Qwen3.8 | GPT-5.6 sol/terra/luna、Opus 4.8 / Fable 5、Qwen 3.7 | — |
| Azure OpenAI | 2026-09-26 起 v1 GA，**无 apiVersion 字段**，地址 = 资源根 + 固定 `/openai/v1` | 未反映 | — |
| text-toolbox | 2026-09-17 改成「操作目录 + 步骤链 + 预设」，控制台按功能带重排 | 仍描述旧的散乱按钮 | — |
| 截图 | — | text-toolbox 图摄于 2026-07-23，展示已不存在的布局 | — |

结构性问题：聚合口径（A 类计数）在 zh/en 各约 15 处手抄，分布在 frontmatter
description、正文导语、FAQ 答案、config 字符串四类位置，没有任何机制保证一致。

## 2. 目标

1. 把「会烂的厂商事实」在文档站也收成一份派生数据，正文与 config 引用同源。
2. 补上滞后的事实：OpenCode Go、Azure v1、模型代际、text-toolbox 改版、9 月至今的 changelog 条目。
3. 建立**不需要源码仓**就能跑的 CI 闸门，让人手改生成物、重新引入硬编码计数时立刻红。
4. 重拍 text-toolbox 的两张截图（zh/en），使其与新界面一致。

## 3. 非目标（明确不做）

- **不为 `data-batch` / `data-parser/flare` / `data-parser/img-prompt` 建页面**（用户决定）。
  `data-batch` 维持现有「外链 + 暂无独立指南」写法；flare / img-prompt 不提及。
- 不改目录树、不改任何现网 URL（不做信息架构重组）。
- 不重拍其余 15 个工具的截图：9 月没有全站视觉改版（只有导航布局 CSS 化、BackTop
  直角、单文件模式/指定下载目录等新选项），7 月的图仍代表现状布局。
- 不改写 changelog 历史条目（那是当时的真事实），只追加新条目并排正 08.21→08.22 的日期顺序。
- 不升级 Rspress / React 等运行时依赖。
- 不动 B 类厂商自述数字（Qwen-MT 92、TranslateGemma 53、MiLMMT 47/46、中文转换 7 个语言代号、中转 22 个接口）。

## 4. 架构

```
web-tools-by-ai/src/app/lib/{toolRegistry.ts, translation/registry.ts, languages-data.ts}
web-tools-by-ai/messages/{zh,en}.json
        │  （本地，yarn sync；借源码仓自己的 tsx 运行时 import 求值）
        ▼
docs/data/{providers,languages,tools}.json      ← 提交进仓，CI 只读
        │  scripts/lib/render.mjs（sync 与 check 共用的唯一模板）
        ▼
docs/{zh,en}/guide/_gen/*.mdx                    ← 提交进仓，禁手改（首行生成标记）
        │  页面 MDX import（沿用现有 _deploy.mdx / _privacy.mdx 片段约定）
        ▼
api.mdx / translation index / 各工具页 / guide index
rspress.config.ts ── node:fs 直读 docs/data/*.json（不走 import，避开 config 加载器差异）

CI：yarn check  =  check-links（已有） + check-data（新，不需要源码仓）
```

关键取舍：**生成 Markdown 片段，而不是让页面运行时消费 JSON。** 仓库已有
`_deploy.mdx` / `_interface.mdx` / `_privacy.mdx` / `_supported-languages.mdx` 的
import 片段约定，且实测下划线前缀文件不会生成路由（`doc_build/guide/translation/`
里无 `_deploy.html`），因此零新增依赖、零模块解析风险。

## 5. 数据层：`docs/data/*.json`

三份派生数据，字段只保留文档需要投影的部分：

- **`providers.json`** — 38 条，字段（全部实测确认，非推测）：`key` / `label` / `category` / `kind` / `hidden` / `docs` / `defaultModel` / `models[]`（`label` + `value` + 可选 `thinking`）/ `endpoints[]`（`label` + `url` + 可选 `docs`）/ `defaultUseRelay`。
  实测要点：① `models` **一律在顶层**，31/38 家有；没有的 7 家是 `gtxFreeAPI` `edgeFreeAPI` `google` `deepl` `deeplx` `azure`（经典/免费 MT）+ `llm`（Custom，模型由用户填）——不是位置不一，是本来就没有，取不到记 `null`；② `defaults` 是配置默认值对象（`url` / `apiKey` / `model` / `temperature` / `chunkSize` / `batchSize` / `delayTime` 等），**不含 models**；③ 中转开关有**两个真源**，只看一个必漏（实施时踩过）：openai-compat 工厂成员写顶层 `defaultUseRelay`，手写 service 的 custom-kind（`claude` / `yandex`）写 `defaults.useRelay`；投影时两处都取，都缺席才记 `null`（= UI 不渲染该开关）。可见 23 家有开关，其中默认开启的是 YandexGPT / OpenCode Zen / OpenCode Go / TokenHub。④ 温度参数**不做投影**：判据同样是两处（顶层 `defaultTemperature` 缺席 = 永不发送，但 `yandex` / `nvidia` 在手写 service 里显式传值），单字段推不出可靠结论，正文那句「五个接口没有这个控件」按源码逐家核过即可。
- **`languages.json`** — 123 条：`value` / `name`（英文名）/ `nativelabel` / `zh`（取自 `messages/zh.json` 的 `languages` 命名空间）/ `group`（8 组之一）。`auto` 单独标 `isAutoDetect: true`，聚合计数一律排除它。
- **`tools.json`** — 19 条：`key` / `path` / `group` / `nameZh` / `nameEn`（取自 `messages/{zh,en}.json` 的 `tools.<key>.title`）/ `appUrlZh` / `appUrlEn` / `docPage`（本仓相对路径，无页记 `null`）。

## 6. 渲染层：`scripts/lib/render.mjs`

单一模块，导出 `renderFragment(name, data, locale) → string`。**sync 写盘用它、check 重渲染比对也用它**——否则闸门自己就成了第二个漂移源。

生成三个片段 × 两个 locale，落在 `docs/{zh,en}/guide/_gen/`：

| 片段 | 内容 | 替换掉 |
| --- | --- | --- |
| `provider-list.mdx` | LLM 两组清单（厂商直连 / 聚合网关与自托管）+ 计数句 | `api.mdx` 的「大语言模型（LLM）」一节手抄名单 |
| `language-table.mdx` | 8 组 × 四列语言表（Code / Native / English / 中文；en 版同样保留中文列，与现状一致） | 手抄的 `_supported-languages.mdx`（删除该文件，`api.mdx:9` 的 import 改指新片段） |
| `relay-list.mdx` | 「中转 API」开关覆盖的接口清单 + 计数句 + 结构性例外（Gemini 把模型名拼在 URL 路径、Nvidia NIM 走内置代理、Azure OpenAI 与 Custom 地址由用户填） | `api.mdx` zh :175 / en :175 那段手抄名单（文档 22 家，实测 23 家，缺 OpenCode Go） |

**不做 `model-list.mdx`**（规划时按实测砍掉）：正文里 24 处具体模型名绝大多数是**编辑推荐**
（「DeepSeek 性价比首选」「Claude Sonnet 长文最好」），不是目录事实；生成一张 SKU 速查表属于新增内容，
而给它加闸门会误伤这 24 处。目录类陈述改由 `provider-list.mdx` 承担，个别写死代际的句子
（`api.mdx:71`）按源码重核为稳定表述。

**不做 `tools-list.mdx`**（同上砍掉）：`guide/index.md` 的工具一览是带编辑描述的 bullets
（「SRT / ASS / VTT / LRC 字幕，时间轴对齐、双语输出」），registry 里没有这类句子，生成只会覆盖掉内容。
这里需要的修只是**去掉「七款」这类聚合计数**，属文字改写。`tools.json` 仍然生成——判据 5 的
`appUrl` 校验要靠它。覆盖策略（哪些工具有页 / 只外链 / 不提及）**不落成文件**：
它只有三条例外（`dataBatch` 外链、`dataParserFlare` / `dataParserImgPrompt` 不提及），
写在 `guide/index.md` 的正文里就够了；为三条例外建一份无人消费的 JSON 是死产物
（实施时先造了 `coverage.json`，审计时发现没有消费者，已删）。

片段**不带 frontmatter**（现有 `_supported-languages.mdx` 自带 og:description 却被 import，
不生效但误导；生成物只出表格与句子，页面级 frontmatter 归各页自己写）。
每个片段首行：`<!-- ⚠ 由 yarn sync 生成，请勿手改 —— 手改会在下次同步时被整份覆盖 -->`，
沿用源码仓 `providerCatalog.generated.ts` 的既有措辞规矩。

**经典 MT 那张「质量★ / 稳定性 / 适合场景 / 免费额度」表不生成**（规划时确认）：
星级、适合场景、免费额度都是文档侧的**编辑判断**，`registry.ts` 里根本没有这些字段，
强行生成等于编造。它唯一会漂的是**成员名单**，交给判据 6 校验：表首列的接口名必须与
`providers.json` 里 `category === "machine-translation"` 的集合一一对应（顺序不限），
多了少了都红。编辑内容继续手写，成员名单有闸门兜着。

## 7. 同步脚本：`scripts/sync-from-source.mjs <web-tools 路径>`

- 借源码仓自己的 tsx 运行时求值：`<web-tools>/node_modules/.bin/tsx`，工作目录设为源码仓。
- **Windows 坑（实测）**：ESM import 裸绝对路径报 `ERR_UNSUPPORTED_ESM_URL_SCHEME`（`d:` 被当 scheme），必须 `pathToFileURL()`。
- 只 import 求值，**不解析源码文本**（与上游 `sync-provider-catalog.ts` 同一原则：正则解析对嵌套结构不可靠）。
- 失败行为：源码仓路径不存在、tsx 缺失、任一 import 抛错、或渲染结果为空 → 打印明确原因并退出码 1，**不写任何文件**（不产出半份）。
- 成功后打印本次数字摘要（MT / 可见 LLM / 语言 / 工具），供人工一眼核对。
- 依赖前提：两仓同级 checkout 且源码仓装过依赖；CI 永不执行 sync。

## 8. 闸门：`scripts/check-data.mjs`（CI，不需要源码仓）

六条判据，全部只读 `docs/data/*.json` 与 `docs/**`：

1. **生成物未被手改**：用 `render.mjs` 从 JSON 重渲染，与磁盘上的 `_gen/*.mdx` 逐字节比对，不一致 → 红。
2. **聚合口径零硬编码（白名单不变量）**：正文与 config 中不得出现聚合计数短语。
   - zh 白名单：`数字 + 种 + (翻译 API | 机器翻译 API | 经典翻译 API | 大模型接口 | AI 大模型接口 | 大模型 | 引擎 | 翻译引擎)`；`共 + 数字 + 个`
   - en 白名单：`number + (translation APIs | machine-translation APIs | LLM endpoints | LLM interfaces | AI LLM interfaces | engines | translation engines | LLMs)`；`number + in total`
   - `共 N 个` / `N in total` 这族实测非 changelog 仅 2 处命中（`api.mdx` zh :56 与 :175，en 同行号），两处都转为生成物，所以收进白名单是零误伤的棘轮。
   - 豁免路径：`docs/**/changelog.md`（C 类历史条目）、`docs/**/_gen/**`（生成物本身就是唯一合法出处）
   - 白名单**只收聚合口径**，因此 B 类厂商数字（`47 种语言` / `92 种语言` / `7 种语言`）天然不匹配，不需要例外清单。
   - 刻意**不收** `数字 + 个 + 接口`：实测非 changelog 文件零命中（该句式只出现在 changelog 的历史条目里），空转的规则只会增加误伤面。
   - 已知边界：`122 种语言` 这类「语言总数」与 B 类同形，无法用短语区分，故**不进白名单**；改由第 3 条兜住（正文不再写精确语言总数）。这个局限如实记下，不为此扩规则。
   - 实施纪律：启用前先用 dry-run 打印全量命中，人工确认无误伤再落判据。
3. **精确语言总数不出现在非生成文件**：`122 种语言` / `122 languages` 只允许出现在 `_gen/` 与 changelog。`120+` 属稳定表述，不受限。
4. **zh/en parity**：两 locale 的相对文件集合一致，`_meta.json` 条目顺序一致。
5. **appUrl 可追**：凡 frontmatter 声明了 `appUrl` 的页面，其值必须命中 `tools.json` 里某个工具的 `appUrlZh|En`；未声明 `appUrl` 的页面（如 `guide/index.mdx`、`faq.mdx`）不受此判据约束。
6. **经典 MT 成员名单一致**：`docs/{zh,en}/guide/translation/api.mdx` 的「经典翻译 API」表首列接口名，必须与 `providers.json` 里 `category === "machine-translation"` 的 9 家一一对应（顺序不限）。这张表的星级与适合场景是编辑判断、保持手写，漂的只有成员名单，所以只校验名单集合。

## 9. 正文事实重同步清单

### 9.1 A 类聚合计数（改为引用片段或稳定表述）

frontmatter 里的计数**无法由片段渲染**（frontmatter 是静态文本），一律改成稳定表述，
保留 `120+ 语言` 这类不随版本变的说法，去掉精确数字：

| 文件 | 位置 | 处理 |
| --- | --- | --- |
| `docs/{zh,en}/guide/index.mdx` | :19、:29 | 句子去聚合计数（带编辑描述的工具 bullets 保留手写） |
| `docs/{zh,en}/guide/translation/api.mdx` | :6 frontmatter | 改稳定表述 |
| 同上 | zh :13 :56 / en :13 :56，以及「经典翻译 API」表、「大语言模型（LLM）」两组清单 | 改为 import 片段 |
| 同上 | zh :175 / en :175（中转开关清单，「共 22 个」+ 22 个名字） | 改为 import `relay-list.mdx`；该计数由 `providers.json` 的 `useRelay` 派生 |
| `docs/{zh,en}/guide/translation/index.mdx` | :6 frontmatter、:21 | 同上 |
| `docs/{zh,en}/guide/translation/info.mdx` | :111（122 种语言） | 引用 `language-table.mdx` |
| `docs/{zh,en}/guide/translation/subtitle-translator/index.mdx` | zh :95 :123 / en :7 :120 | 同上 |
| `docs/{zh,en}/guide/translation/md-translator/index.mdx` | zh :24 :165 / en :25 :173 | 同上 |
| `docs/{zh,en}/guide/translation/json-translate/index.mdx` | zh :7 :25 :245 / en :26 :254 | 同上（三处近重复段落各自处理，不做去重重构） |
| `docs/{zh,en}/guide/json/json-value-transformer.mdx` | zh :42 / en :48 | 改稳定表述 |
| `docs/en/guide/json/json-node-edit.mdx` | :48 | 改稳定表述 |
| `rspress.config.ts` | :50 :56 :104 :106 | 改为 `node:fs` 读 `docs/data/*.json` 拼装 |

**实施坑：`docs/{zh,en}/guide/index.md` 是 `.md`，`.md` 不走 MDX，import 片段的语法在里面无效。**
需要引片段的这两个文件必须改名为 `index.mdx`。URL 不变（两者都编译成 `index.html`），
`_meta.json` 里写的是无扩展名的 `"index"`，也不受影响；实测没有任何文件显式链接
`guide/index.md`（显式带扩展名的链接都指向 `*/index.mdx`），`check:links` 会兜住漏改的情况。

### 9.2 事实补正

- **OpenCode Go**：补进 LLM 清单（生成片段自动带上）；正文补一段说明——与 Zen **同 host、同账号、同一把 key**，差在路径（`/zen/go/v1` vs `/zen/v1`）、在售 SKU 集合、计费形态（Go 是 $10/月订阅额度，Zen 是充值余额），**不能写成「充值即用」**；官方限定一个 workspace 只能有一人订阅 Go。
- **Azure OpenAI**：改写为 v1 GA 语义——请求地址 = 用户填的资源根 + 固定 `/openai/v1` 后缀，设置表单**没有 apiVersion 字段**，模型框填部署名，`reasoning_effort` 随工厂正常下发。
- **9Router / OmniRoute**：Custom 的端点快捷项补这两个自托管 OpenAI 兼容网关——**9Router 默认端口 20127，OmniRoute 是 20128**（OmniRoute 是 9Router 的 TypeScript fork，端口不同，别写成一个）。与 LM Studio / Ollama / llama.cpp / koboldcpp / LiteLLM / Together AI / Fireworks AI 并列，共 **9** 个快捷地址（TranslateGemma 与 MiLMMT 各 3 个：LM Studio / llama.cpp / koboldcpp）。
- **hidden 两家**（Volcengine Coding Plan / Alibaba Bailian Token Plan）：默认下拉不显示，属 UI 策略，文档不主动宣传，但在「聚合网关与自托管」清单的计数口径里说明可见数为 27 而非 29。
- **模型代际**：目录类陈述由 `provider-list.mdx` 承担；编辑推荐语（「DeepSeek 性价比首选」等）保留人工，不生成也不加闸门。
- **「不发送温度参数的接口」清单要按源码重核**（自查时新发现的陈旧点）：`docs/zh/guide/translation/api.mdx:71` 写「五个接口没有这个控件：OpenAI（**GPT-5.x** 全系为推理模型…）」——源码在售已是 GPT-6 Astra/Sol/Luna，措辞随代际更新；且这份「哪几家不发 temperature」的名单本身要以 `registry.ts` 逐家核对，不能沿用文档现有的五家。该句里的「五个」是中文数字、属 B 类局部事实，白名单不会误伤，改的是内容不是句式。
- **术语校准**：正文引用的界面名一律回到 `messages/zh.json` 的真实标签（源码仓 2026-09 为匈牙利语说明文专门修过一次同类错误，见 `d5dc6a39e`）。
- **新功能覆盖**：单文件模式 / 缓存设置自由配置、指定下载目录（2026-08-31 两个 commit）在字幕与 JSON 页的设置说明里补上。

### 9.3 changelog（zh + en 同步追加）

追加 2026-09 以来的条目：OpenCode Go、Azure OpenAI v1 迁移并删除 apiVersion、9Router/OmniRoute、匈牙利语（界面语种增至 19）、text-toolbox 改版、面板懒加载与首屏瘦身、单文件模式与指定下载目录、Design QA 无障碍修正。历史条目不改写；顺手把顶部 08.21 与 08.22 的日期顺序排正（两边同样问题）。

### 9.4 text-toolbox 页与截图

- 主章节按「操作目录 → 步骤链 → 预设」重写，替换旧的按钮罗列；同步出厂默认值单一来源、「每行加字」默认改前缀（`08ac7ed57`）。
- 重拍 `docs/public/img/text-toolbox-{zh,en}.webp`：本地起 web-tools dev server，**拍工作中态**（填入样例文本、已选一条步骤链），裁切转 WebP，按现有尺寸口径压缩后替换；替换前后各看一眼，确认旧图里的布局元素确实消失、新元素确实出现。

## 10. 工程化

- `package.json`：加 `sync`（`node scripts/sync-from-source.mjs`）、`check:data`、`check`（串 links + data）。
- `.github/workflows/main.yml`：build 前把 `yarn check:links` 换成 `yarn check`。
- **删 `i18n.json`**：全仓 ts/tsx/mjs/js/json/yml/md 零代码引用（两处 grep 命中是正文举例 app 侧的输入文件名，不是引它），内容是导航标签、职责已被 `docs/{zh,en}/_nav.json` 取代，2025-04-08 后再未改动。
- 删 `docs/{zh,en}/guide/translation/_supported-languages.mdx`（被 `_gen/language-table.mdx` 取代），同步改 `api.mdx` 的 import。

## 11. 验收

1. `yarn check` 绿（links + data 六条判据全过），`yarn build` 成功。
2. **闸门自证**：故意手改一个 `_gen/` 片段里的数字 → `check:data` 必须红；故意在某页正文写回「26 种大模型接口」→ 必须红；改回后必须绿。（证人要因对的理由变红）
3. 抽 api / text-toolbox / guide 首页三页本地 preview，截图目检：清单与计数和 `docs/data/*.json` 一致，text-toolbox 图与文一致。
4. `yarn sync ../web-tools-by-ai` 连跑两次，第二次无 diff（幂等）。
5. zh/en parity：新片段双语齐备，`_meta.json` 无需改（片段不是页面）。

## 12. 风险与回退

| 风险 | 处置 |
| --- | --- |
| 源码仓未同级 checkout / 未装依赖 → sync 跑不了 | 脚本明确报错退出；`docs/data/*.json` 已提交进仓，check 与 build 不受影响 |
| provider 结构里 `models` 位置不一 | 取值两处都试，取不到记 `null`，渲染时跳过而非编造 |
| 生成片段行数大、diff 噪音 | 语言表本来就是一整张手抄表，一次性换成生成物是净收益；提交按功能域拆开 |
| text-toolbox 截图需要起 dev server（本机 CDP 通路曾断过） | 优先 chrome-devtools CLI 绝对路径落盘；不通则退回 MCP 截图，仍不通则该页图暂留旧图并在报告里写明缺口，不硬凑 |
| 白名单误伤 B/C 类数字 | 启用前 dry-run 全量打印命中人工核对；changelog 整目录豁免 |
| 回退 | 全部改动在分支上；数据层与闸门是新增文件，正文改动可单独 revert |
