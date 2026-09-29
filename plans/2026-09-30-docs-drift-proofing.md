# 文档站防漂移重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 docs-tools-by-ai 的工具/服务商/语言事实收成单一数据源并生成片段，同时补上与 web-tools-by-ai v3.2.0 滞后的内容。

**Architecture:** 本地 `yarn sync` 借源码仓自己的 tsx 求值 registry → 写 `docs/data/*.json` → `scripts/lib/render.mjs` 渲染 `docs/{zh,en}/guide/_gen/*.mdx` → 页面 import 片段；CI 只跑 `scripts/check-data.mjs`（六条判据，不需要源码仓）。

**Tech Stack:** Rspress 2.0.18、Node 24（`node --test` 内置测试，零新增依赖）、ESM `.mjs`、tsx（由源码仓提供，仅 sync 时用）。

**Spec:** `specs/2026-09-30-docs-drift-proofing-design.md` —— 本计划逐节论证于该 spec，执行时两份一起读。

## Global Constraints

- 在**当前分支 `main`** 上实施（用户 2026-09-30 明确指定），不建分支、不建 worktree。
- **不 push**、不打 tag、不发 Release——push 需用户单独批准。
- **不新增运行时依赖**；测试只用 Node 内置 `node:test` + `node:assert`。
- 不升级 Rspress / React / 任何包版本。
- **不改任何现网 URL**、不改目录树、不改 `_meta.json` 结构。
- 界面名一律逐字取 `web-tools-by-ai/messages/zh.json`（en 页取 `en.json`）的真实标签，禁止编造控件名。
- 生成物（`docs/{zh,en}/guide/_gen/*.mdx`、`docs/data/*.json`）**禁止手改**；要改内容改 `scripts/lib/render.mjs` 的模板。
- changelog 历史条目不改写，只追加。
- 不动 B 类厂商自述数字（Qwen-MT 92、TranslateGemma 53、MiLMMT 47、中文转换 7 个语言代号）。
- 提交信息用英文 Conventional Commits，按功能域合并成组，不带署名。
- 每个 Task 结束时 `yarn build` 必须能过；`yarn check:data` 自 Task 6 起必须绿。

**实测基准数（本计划所有断言的出处，已用源码仓 tsx 实跑求得）**：
providers 38（MT 9 / llm 18 / aggregator 11，hidden 2：`volcengine` `alibaba`）；可见 LLM+聚合 **27**；
带 `defaultUseRelay` 的 **23** 家（其中可见 **21** 家，`true` 五家：opencodeZen / opencodeGo / tokenhub / volcengine / alibaba）；
无该字段的可见六家：claude / gemini / yandex / nvidia / azureopenai / llm；
`languages` 123 条含 `auto`（目标语言 **122**）、`LANGUAGE_GROUPS` 8 组、`LANGUAGE_PRESETS` 4 个；
`TOOL_REGISTRY` 19 个工具、4 组（translate / textParser / jsonParser / dataParser）；
Custom(`llm`) 快捷地址 **9** 个，TranslateGemma 与 MiLMMT 各 **3** 个；
`messages` 19 个界面语种。

---

## File Structure

| 文件 | 职责 |
| --- | --- |
| Create `scripts/lib/source-eval.mts` | 唯一知道源码仓结构的地方：import registry 并 dump JSON（由源码仓的 tsx 执行） |
| Create `scripts/sync-from-source.mjs` | CLI：定位源码仓 → 跑 source-eval → 写 `docs/data/*.json` → 调 render 写片段 |
| Create `scripts/lib/render.mjs` | 唯一模板层：`renderFragment(name, data, locale)`，sync 与 check 共用 |
| Create `scripts/lib/gates.mjs` | 六条判据的纯函数实现（可注入 root/data/files，便于夹具测试） |
| Create `scripts/check-data.mjs` | CLI：装载数据、跑 gates、打印、退出码 |
| Create `scripts/__tests__/render.test.mjs`、`gates.test.mjs` | `node --test` 夹具测试（含每条判据的正/反用例） |
| Create `docs/data/{providers,languages,tools,coverage}.json` | 派生数据 + 文档覆盖策略（coverage 人工维护） |
| Create `docs/{zh,en}/guide/_gen/{provider-list,relay-list,language-table}.mdx` | 生成片段（6 个文件） |
| Modify `docs/{zh,en}/guide/translation/api.mdx` | 接入三个片段、删手抄名单、Azure/温度/OpenCode Go 补正 |
| Delete `docs/{zh,en}/guide/translation/_supported-languages.mdx` | 被 `_gen/language-table.mdx` 取代 |
| Modify `docs/{zh,en}/guide/index.md` → 改名 `index.mdx` | `.md` 不支持 import；去聚合计数 |
| Modify 其余 A 类计数所在页 | 见 Task 5 清单 |
| Modify `docs/{zh,en}/guide/translation/changelog.md` | 追加 9 月条目 + 排正日期 |
| Modify `docs/{zh,en}/guide/text/text-toolbox.mdx` | 按新界面重写 |
| Modify `rspress.config.ts`、`package.json`、`.github/workflows/main.yml` | 数据同源、脚本入口、CI 闸门 |
| Delete `i18n.json` | 孤儿配置 |
| Modify `docs/public/img/text-toolbox-{zh,en}.webp` | 重拍 |

---

## Task 1: 模板层 `scripts/lib/render.mjs`

**Files:**
- Create: `scripts/lib/render.mjs`
- Create: `scripts/__tests__/render.test.mjs`

**Interfaces:**
- Consumes: 无（本 Task 是地基）
- Produces:
  - `MARKER: string` —— 片段首行生成标记
  - `FRAGMENT_NAMES: readonly string[]` —— `["provider-list", "relay-list", "language-table"]`
  - `renderFragment(name: string, data: DocData, locale: "zh" | "en"): string` —— 返回含首行 MARKER 与结尾换行的完整文件内容
  - `DocData = { providers: Provider[], languages: { groups: Group[], items: Item[] }, tools: Tool[] }`
  - `Provider = { key, label, category: "machine-translation"|"llm"|"aggregator", hidden?: true, defaultUseRelay?: boolean|null, models?: {label,value,thinking?}[]|null }`
  - `Group = { key, label: { zh: string, en: string }, codes: string[] }`
  - `Item = { value, name, nativelabel, zh, group }`
  - `Tool = { key, path, group, nameZh, nameEn }`
  - `counts(data): { mt, llmVisible, llmDirect, llmAggregator, relayVisible, targetLanguages }`

- [ ] **Step 1: 写失败测试**

Create `scripts/__tests__/render.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import { renderFragment, counts, MARKER, FRAGMENT_NAMES } from "../lib/render.mjs";

// 夹具刻意只放 3 家 provider / 2 组语言，断言逐字输出，不依赖真实数据量。
const FIXTURE = {
  providers: [
    { key: "gtxFreeAPI", label: "GTX API (Free)", category: "machine-translation" },
    { key: "deepseek", label: "DeepSeek", category: "llm", defaultUseRelay: false },
    { key: "opencodeGo", label: "OpenCode Go", category: "aggregator", defaultUseRelay: true },
    { key: "volcengine", label: "Volcengine Coding Plan", category: "llm", hidden: true, defaultUseRelay: true },
    { key: "claude", label: "Claude", category: "llm" },
  ],
  languages: {
    groups: [
      { key: "common", label: { zh: "常用", en: "Common" }, codes: ["en", "zh"] },
      { key: "europe", label: { zh: "欧洲", en: "Europe" }, codes: ["de"] },
    ],
    items: [
      { value: "auto", name: "Auto", nativelabel: "Auto", zh: "自动检测", group: null },
      { value: "en", name: "English", nativelabel: "English", zh: "英语", group: "common" },
      { value: "zh", name: "Simplified Chinese", nativelabel: "简体", zh: "中文", group: "common" },
      { value: "de", name: "German", nativelabel: "Deutsch", zh: "德语", group: "europe" },
    ],
  },
  tools: [],
};

test("counts 排除 hidden 与 auto", () => {
  assert.deepEqual(counts(FIXTURE), {
    mt: 1, llmVisible: 3, llmDirect: 2, llmAggregator: 1,
    relayVisible: 2, targetLanguages: 3,
  });
});

test("provider-list zh 逐字输出", () => {
  const out = renderFragment("provider-list", FIXTURE, "zh");
  assert.ok(out.startsWith(MARKER), "首行必须是生成标记");
  assert.match(out, /支持的 LLM 接口共 3 个，分两组：/);
  assert.match(out, /厂商直连（2 家）\*\*：DeepSeek、Claude/);
  assert.match(out, /聚合网关与自托管（1 家）\*\*：OpenCode Go/);
  assert.doesNotMatch(out, /Volcengine/, "hidden 家不得出现");
});

test("relay-list 列出默认开启的家且排除无字段者", () => {
  const out = renderFragment("relay-list", FIXTURE, "zh");
  assert.match(out, /共 2 个：DeepSeek、OpenCode Go/);
  assert.doesNotMatch(out, /Claude/, "无 defaultUseRelay 字段的不在清单内");
  assert.match(out, /OpenCode Go/);
  assert.match(out, /默认开启/);
});

test("language-table 双语同结构：四列 + 分组标题本地化", () => {
  const zh = renderFragment("language-table", FIXTURE, "zh");
  const en = renderFragment("language-table", FIXTURE, "en");
  assert.match(zh, /### 常用/);
  assert.match(en, /### Common/);
  for (const out of [zh, en]) {
    assert.match(out, /\| Code \| Native \| English \| 中文 \|/);
    assert.match(out, /\| `de` \| Deutsch \| German \| 德语 \|/);
    assert.doesNotMatch(out, /auto/, "auto 不进对照表");
  }
});

test("未知片段名直接抛错，不静默产出空文件", () => {
  assert.throws(() => renderFragment("nope", FIXTURE, "zh"), /未知片段/);
  assert.deepEqual([...FRAGMENT_NAMES], ["provider-list", "relay-list", "language-table"]);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test scripts/__tests__/render.test.mjs`
Expected: FAIL —— `Cannot find module '../lib/render.mjs'`

- [ ] **Step 3: 写实现**

Create `scripts/lib/render.mjs`：

```js
/**
 * 文档站唯一的模板层。
 *
 * 只渲染【会漂的目录事实】（名单与计数），编辑判断（星级、推荐语、免费额度）留给人写。
 * sync 写盘与 check-data 重渲染比对都调用本模块 —— 有第二套模板，闸门自己就成了漂移源。
 */

export const MARKER =
  "<!-- ⚠ 由 yarn sync 生成，请勿手改 —— 手改会在下次同步时被整份覆盖 -->\n";

export const FRAGMENT_NAMES = ["provider-list", "relay-list", "language-table"];

const isLlm = (p) => p.category === "llm" || p.category === "aggregator";
const isVisible = (p) => isLlm(p) && !p.hidden;
const hasRelay = (p) => p.defaultUseRelay === true || p.defaultUseRelay === false;

export function counts(data) {
  const { providers, languages } = data;
  const visible = providers.filter(isVisible);
  return {
    mt: providers.filter((p) => p.category === "machine-translation").length,
    llmVisible: visible.length,
    llmDirect: visible.filter((p) => p.category === "llm").length,
    llmAggregator: visible.filter((p) => p.category === "aggregator").length,
    relayVisible: visible.filter(hasRelay).length,
    targetLanguages: languages.items.filter((l) => l.value !== "auto").length,
  };
}

// 中文注释名是编辑加的稳定标注，不是数据；新增家不标注也不会报错。
const ANNOTATE = {
  zh: { stepfun: "（阶跃星辰）", tokenhub: "（腾讯）", qianfan: "（千帆）" },
  en: {},
};

const named = (p, locale) => p.label + (ANNOTATE[locale]?.[p.key] ?? "");
const list = (items, locale) => items.map((p) => named(p, locale)).join("、");

function providerList(data, locale) {
  const visible = data.providers.filter(isVisible);
  const direct = visible.filter((p) => p.category === "llm");
  const agg = visible.filter((p) => p.category === "aggregator" && p.key !== "llm");
  const custom = visible.find((p) => p.key === "llm");
  const n = counts(data);
  if (locale === "zh") {
    return [
      `支持的 LLM 接口共 ${n.llmVisible} 个，分两组：`,
      "",
      `- **厂商直连（${n.llmDirect} 家）**：${list(direct, "zh")}`,
      `- **聚合网关与自托管（${agg.length} 家）**：${list(agg, "zh")}${custom ? `，以及 **${custom.label}**` : ""}`,
    ].join("\n");
  }
  return [
    `${n.llmVisible} LLM endpoints are supported, in two groups:`,
    "",
    `- **Direct vendors (${n.llmDirect})**: ${list(direct, "en")}`,
    `- **Aggregators & self-hosted (${agg.length})**: ${list(agg, "en")}${custom ? `, plus **${custom.label}**` : ""}`,
  ].join("\n");
}

function relayList(data, locale) {
  const visible = data.providers.filter(isVisible);
  const withRelay = visible.filter(hasRelay);
  const without = visible.filter((p) => !hasRelay(p));
  const onByDefault = withRelay.filter((p) => p.defaultUseRelay === true);
  if (locale === "zh") {
    const lines = [
      `除 ${list(without, "zh")} 之外的每个 LLM 接口（共 ${withRelay.length} 个：${list(withRelay, "zh")}）都在 API 设置里提供「**中转 API**」开关，开启后请求经由内置的 Cloudflare 转发（只转发请求本体与鉴权头）：`,
    ];
    if (onByDefault.length) {
      lines.push("", `${list(onByDefault, "zh")} 的上游不发 CORS 头或预检失败，**默认开启**。`);
    }
    return lines.join("\n");
  }
  const lines = [
    `Every LLM provider except ${list(without, "en")} — ${withRelay.length} in total: ${list(withRelay, "en")} — offers an **API relay** toggle in settings. When enabled, requests are forwarded through the built-in Cloudflare worker (request body and auth headers only):`,
  ];
  if (onByDefault.length) {
    lines.push("", `${list(onByDefault, "en")} **default to ON** because upstream sends no CORS headers or fails preflight.`);
  }
  return lines.join("\n");
}

function languageTable(data, locale) {
  const { groups, items } = data.languages;
  const byCode = new Map(items.map((l) => [l.value, l]));
  const blocks = groups.map((g) => {
    const rows = g.codes
      .map((code) => byCode.get(code))
      .filter((l) => l && l.value !== "auto")
      .map((l) => `| \`${l.value}\` | ${l.nativelabel} | ${l.name} | ${l.zh} |`);
    return [`### ${g.label[locale]}`, "", "| Code | Native | English | 中文 |", "| --- | --- | --- | --- |", ...rows].join("\n");
  });
  return blocks.join("\n\n");
}

export function renderFragment(name, data, locale) {
  const body = name === "provider-list" ? providerList(data, locale)
    : name === "relay-list" ? relayList(data, locale)
    : name === "language-table" ? languageTable(data, locale)
    : (() => { throw new Error(`未知片段: ${name}`); })();
  return `${MARKER}\n${body}\n`;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `node --test scripts/__tests__/render.test.mjs`
Expected: PASS（6 个 test 全绿）

- [ ] **Step 5: 破坏一次夹具，确认测试真的在管事**

在 `scripts/lib/render.mjs` 的 `counts()` 里把 `llmVisible` 临时改成 `providers.length`，重跑：
Run: `node --test scripts/__tests__/render.test.mjs`
Expected: FAIL（counts 断言与 provider-list 断言都红）——确认这两条断言不是空转。**改回后再跑一次必须全绿**，然后 `git diff` 确认只剩原始实现。

- [ ] **Step 6: 提交**

```bash
git add scripts/lib/render.mjs scripts/__tests__/render.test.mjs
git commit -m "feat(docs-data): add the single template layer for generated fragments"
```

---

## Task 2: 取数层与 `yarn sync`

**Files:**
- Create: `scripts/lib/source-eval.mts`
- Create: `scripts/sync-from-source.mjs`
- Create: `docs/data/providers.json`、`languages.json`、`tools.json`、`coverage.json`（由脚本产出 + coverage 手写）

**Interfaces:**
- Consumes: `renderFragment` / `FRAGMENT_NAMES`（Task 1）
- Produces:
  - CLI：`node scripts/sync-from-source.mjs <web-tools 路径>`，成功时写 `docs/data/*.json` 与 6 个片段文件，并打印摘要行 `providers=38 mt=9 llmVisible=27 relayVisible=21 languages=122 tools=19`
  - `docs/data/providers.json` 数组，元素字段：`key,label,category,kind,hidden,defaultModel,defaultUseRelay,models,endpoints,docs`（无值者记 `null`）
  - `docs/data/languages.json`：`{ groups: [{key,label:{zh,en},codes}], items: [{value,name,nativelabel,zh,group}] }`
  - `docs/data/tools.json` 数组：`{key,path,group,nameZh,nameEn,appUrlZh,appUrlEn}`
  - `docs/data/coverage.json`（**人工维护**）：`{ dataBatch: "link", dataParserFlare: "hidden", dataParserImgPrompt: "hidden" }`

- [ ] **Step 1: 写求值器**

Create `scripts/lib/source-eval.mts`（由**源码仓自己的 tsx** 执行，stdout 输出一个 JSON）：

```ts
/**
 * 唯一知道源码仓结构的地方。只 import 求值，不解析源码文本 ——
 * 与上游 scripts/sync-provider-catalog.ts 同一原则（正则解析对嵌套结构不可靠）。
 * 实测事实：models 一律在 provider 顶层（31/38 家有，缺的是 6 家经典 MT + Custom）；
 * 中转字段真名 defaultUseRelay（useRelay 是用户配置项名，provider 上没有）；
 * messages/*.json 是 JSON，Node ESM 直接 import 会报 ERR_IMPORT_ATTRIBUTE_MISSING，用 fs 读。
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ROOT = process.env.SRC_ROOT!;
const s = (p: string) => pathToFileURL(`${ROOT}/${p}`).href;

const { PROVIDERS } = await import(s("src/app/lib/translation/registry.ts"));
const { TOOL_REGISTRY } = await import(s("src/app/lib/toolRegistry.ts"));
const { languages, LANGUAGE_GROUPS } = await import(s("src/app/lib/translation/languages-data.ts"));

const readMessages = (locale: string) =>
  JSON.parse(readFileSync(`${ROOT}/messages/${locale}.json`, "utf8"));
const mzh = readMessages("zh");
const men = readMessages("en");

const providers = Object.entries(PROVIDERS).map(([key, p]: [string, any]) => ({
  key,
  label: p.label ?? null,
  category: p.category ?? null,
  kind: p.kind ?? null,
  hidden: p.hidden === true,
  docs: p.docs ?? null,
  defaultModel: p.defaultModel ?? p.defaults?.model ?? null,
  defaultUseRelay: "defaultUseRelay" in p ? p.defaultUseRelay : null,
  models: Array.isArray(p.models) ? p.models.map((m: any) => ({
    label: m.label ?? m.value, value: m.value, thinking: m.thinking === true ? true : null,
  })) : null,
  endpoints: Array.isArray(p.endpoints) ? p.endpoints.map((e: any) => ({
    label: e.label ?? null, url: e.url ?? null, docs: e.docs ?? null,
  })) : null,
}));

const groups = LANGUAGE_GROUPS.map((g: any) => ({
  key: g.key,
  label: { zh: mzh.common[g.labelKey], en: men.common[g.labelKey] },
  codes: [...g.codes],
}));
const groupOf = (code: string) => LANGUAGE_GROUPS.find((g: any) => g.codes.includes(code))?.key ?? null;

const items = (languages as any[]).map((l) => ({
  value: l.value, name: l.name ?? null, nativelabel: l.nativelabel ?? null,
  zh: mzh.languages?.[l.value] ?? null, group: groupOf(l.value),
}));

const APP = "https://tools.newzone.top";
const tools = Object.entries(TOOL_REGISTRY).map(([key, t]: [string, any]) => ({
  key, path: t.path, group: t.group,
  nameZh: mzh.tools?.[key]?.title ?? null,
  nameEn: men.tools?.[key]?.title ?? null,
  appUrlZh: `${APP}/zh/${t.path}`, appUrlEn: `${APP}/en/${t.path}`,
}));

process.stdout.write(JSON.stringify({ providers, languages: { groups, items }, tools }));
```

- [ ] **Step 2: 写 CLI**

Create `scripts/sync-from-source.mjs`：

```js
/**
 * 把 web-tools-by-ai 的 registry 投影成文档站的派生数据，再渲染生成片段。
 *
 * 只在本地跑（CI 上没有源码仓，也永远不该有）。产物全部提交进仓，
 * CI 用 scripts/check-data.mjs 校验「产物自洽 + 正文不重新硬编码」。
 *
 * 用法：node scripts/sync-from-source.mjs ../web-tools-by-ai    （yarn sync）
 * 失败时不写任何文件 —— 半份产物比没有产物更危险。
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderFragment, FRAGMENT_NAMES } from "./lib/render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv[2];
const die = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };

if (!arg) die("用法：yarn sync <web-tools-by-ai 路径>");
const srcRoot = path.resolve(ROOT, arg);
if (!fs.existsSync(path.join(srcRoot, "src/app/lib/translation/registry.ts"))) {
  die(`在 ${srcRoot} 没找到源码仓的 registry.ts —— 文档站与 web-tools-by-ai 需同级 checkout`);
}
const tsxBin = path.join(srcRoot, "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
if (!fs.existsSync(tsxBin)) die(`${tsxBin} 不存在 —— 先在源码仓跑 yarn install`);

const evalScript = path.join(ROOT, "scripts/lib/source-eval.mts");
const run = spawnSync(tsxBin, [evalScript], {
  cwd: srcRoot, encoding: "utf8", env: { ...process.env, SRC_ROOT: srcRoot.replace(/\\/g, "/") },
  shell: process.platform === "win32",
});
if (run.status !== 0) die(`在源码仓求值失败（exit ${run.status}）：\n${run.stderr?.slice(0, 800)}`);

let data;
try { data = JSON.parse(run.stdout); } catch { die("求值输出不是合法 JSON，未写入任何文件"); }
if (!Array.isArray(data.providers) || !data.providers.length) die("providers 为空，未写入任何文件");

const c = countOf(data);
function countOf(d) {
  const vis = d.providers.filter((p) => (p.category === "llm" || p.category === "aggregator") && !p.hidden);
  return {
    providers: d.providers.length,
    mt: d.providers.filter((p) => p.category === "machine-translation").length,
    llmVisible: vis.length,
    relayVisible: vis.filter((p) => typeof p.defaultUseRelay === "boolean").length,
    languages: d.languages.items.filter((l) => l.value !== "auto").length,
    tools: d.tools.length,
  };
}

const DATA = path.join(ROOT, "docs/data");
fs.mkdirSync(DATA, { recursive: true });
const write = (p, text) => fs.writeFileSync(p, text, "utf8");
write(path.join(DATA, "providers.json"), JSON.stringify(data.providers, null, 2) + "\n");
write(path.join(DATA, "languages.json"), JSON.stringify(data.languages, null, 2) + "\n");
write(path.join(DATA, "tools.json"), JSON.stringify(data.tools, null, 2) + "\n");
if (!fs.existsSync(path.join(DATA, "coverage.json"))) {
  write(path.join(DATA, "coverage.json"), JSON.stringify({
    dataBatch: "link", dataParserFlare: "hidden", dataParserImgPrompt: "hidden",
  }, null, 2) + "\n");
}

for (const name of FRAGMENT_NAMES) {
  for (const locale of ["zh", "en"]) {
    const dir = path.join(ROOT, `docs/${locale}/guide/_gen`);
    fs.mkdirSync(dir, { recursive: true });
    write(path.join(dir, `${name}.mdx`), renderFragment(name, data, locale));
  }
}
console.log(`✓ ${Object.entries(c).map(([k, v]) => `${k}=${v}`).join(" ")}`);
```

- [ ] **Step 3: 跑一次，核数**

Run: `node scripts/sync-from-source.mjs ../web-tools-by-ai`
Expected：一行 `✓ providers=38 mt=9 llmVisible=27 relayVisible=21 languages=122 tools=19`
任何一项对不上本计划开头的实测基准数就停下排查，不要往下走。

- [ ] **Step 4: 眼过生成片段**

Run: `cat docs/zh/guide/_gen/provider-list.mdx docs/zh/guide/_gen/relay-list.mdx && head -20 docs/zh/guide/_gen/language-table.mdx`
Expected：`provider-list` 两组名单含 **OpenCode Go**、无 Volcengine/Alibaba；`relay-list` 首列例外名单是 Claude、Gemini、YandexGPT、Nvidia NIM、Azure OpenAI、Custom，计数 21；`language-table` 每组四列表头齐全。

- [ ] **Step 5: 幂等验证**

Run: `node scripts/sync-from-source.mjs ../web-tools-by-ai && git diff --stat docs/data docs/*/guide/_gen`
Expected：第二次跑完 `git diff` 无输出（只有首次产物落盘）——同输入必得同输出。

- [ ] **Step 6: 失败路径验证（不留半成品）**

Run: `node scripts/sync-from-source.mjs /tmp/definitely-not-here; echo "exit=$?"`
Expected：`✗ 在 ... 没找到源码仓的 registry.ts` + `exit=1`，且 `git status` 无新改动。

- [ ] **Step 7: 提交**

```bash
git add scripts/lib/source-eval.mts scripts/sync-from-source.mjs docs/data docs/zh/guide/_gen docs/en/guide/_gen
git commit -m "feat(docs-data): project the tool/provider/language catalog from source"
```

---

## Task 3: `scripts/lib/gates.mjs` 六条判据

**Files:**
- Create: `scripts/lib/gates.mjs`
- Create: `scripts/check-data.mjs`
- Create: `scripts/__tests__/gates.test.mjs`
- Modify: `package.json`（加 `check:data` / `sync` / `check`）

**Interfaces:**
- Consumes: `renderFragment` / `FRAGMENT_NAMES` / `MARKER`（Task 1）、`docs/data/*.json`（Task 2）
- Produces:
  - `gates( ctx ): Problem[]`，`ctx = { root, data, files: {rel, abs, text}[], configText }`
  - `Problem = { gate: string, rel: string, detail: string }`
  - CLI `node scripts/check-data.mjs` —— 有问题打印并 exit 1

- [ ] **Step 1: 写失败测试**

Create `scripts/__tests__/gates.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import { aggregatePhrases, mtMembership, appUrlTraceable, localeParity, exactLanguageTotal, fragmentIsFresh } from "../lib/gates.mjs";

const DATA = {
  providers: [
    { key: "gtxFreeAPI", label: "GTX API (Free)", category: "machine-translation", hidden: false },
    { key: "qwenMt", label: "Qwen-MT", category: "machine-translation", hidden: false },
    { key: "deepseek", label: "DeepSeek", category: "llm", hidden: false, defaultUseRelay: false },
  ],
  languages: { groups: [], items: [{ value: "auto" }, { value: "en" }, { value: "de" }] },
};

// 1) 聚合口径白名单：抓 A 类，放 B/C 类
test("aggregatePhrases 抓聚合口径，放过厂商数字", () => {
  const hits = (t) => aggregatePhrases({ text: t, locale: "zh" }).map((h) => h.text);
  assert.deepEqual(hits("工具集成了 9 种翻译 API"), ["9 种翻译 API"]);
  assert.deepEqual(hits("支持的 LLM 接口共 26 个，分两组"), ["共 26 个"]);
  assert.deepEqual(hits("26 LLM endpoints are supported", "en").length, 0); // locale 见下条
  // B 类必须放过：这三句是编辑/厂商事实，不是目录聚合
  assert.deepEqual(hits("小米，47 种语言"), []);
  assert.deepEqual(hits("Qwen-MT 官方约 92 种语言"), []);
  assert.deepEqual(hits("7 种语言两两互转"), []);
  assert.deepEqual(hits("120+ 种语言"), []); // 稳定表述不限
});

test("aggregatePhrases 的 en 分支", () => {
  const hits = (t) => aggregatePhrases({ text: t, locale: "en" }).map((h) => h.text);
  assert.deepEqual(hits("9 translation APIs and 26 LLM endpoints"), ["9 translation APIs", "26 LLM endpoints"]);
  assert.deepEqual(hits("22 in total: DeepSeek"), ["22 in total"]);
  assert.deepEqual(hits("47 languages"), []);
});

// 2) 生成物新鲜度
test("fragmentIsFresh 手改即红", () => {
  const good = "<!-- ⚠ 由 yarn sync 生成，请勿手改 —— 手改会在下次同步时被整份覆盖 -->\nbody\n";
  assert.deepEqual(fragmentIsFresh({ onDisk: good, rendered: good }), []);
  assert.equal(fragmentIsFresh({ onDisk: good.replace("body", "bOdY"), rendered: good }).length, 1);
});

// 3) 精确语言总数
test("exactLanguageTotal 只认 122", () => {
  assert.equal(exactLanguageTotal({ text: "122 种语言按地理分组", total: 122 }).length, 1);
  assert.equal(exactLanguageTotal({ text: "覆盖 120+ 语言", total: 122 }).length, 0);
  assert.equal(exactLanguageTotal({ text: "小米，47 种语言", total: 122 }).length, 0);
});

// 4) MT 成员名单
test("mtMembership 双向抓差异", () => {
  const table = "| GTX API (Free) | ★ |\n| Qwen-MT | ★ |";
  assert.deepEqual(mtMembership({ tableText: table, data: DATA, locale: "zh" }), []);
  assert.equal(mtMembership({ tableText: "| GTX API (Free) | ★ |", data: DATA, locale: "zh" }).length, 1);
  assert.equal(mtMembership({ tableText: table + "\n| Baidu MT | ★ |", data: DATA, locale: "zh" }).length, 1);
});

// 5) appUrl 可追 / 6) parity
test("appUrlTraceable 未声明 appUrl 的文件跳过", () => {
  const files = [{ rel: "a.mdx", text: "appUrl: https://x.dev/zh/text-diff" }, { rel: "b.mdx", text: "无 appUrl" }];
  const tools = [{ appUrlZh: "https://x.dev/zh/text-diff", appUrlEn: "https://x.dev/en/text-diff" }];
  assert.deepEqual(appUrlTraceable({ files, tools }), []);
  assert.equal(appUrlTraceable({ files: [{ rel: "a.mdx", text: "appUrl: https://x.dev/zh/ghost" }], tools }).length, 1);
});

test("localeParity 抓文件集合与 _meta 顺序", () => {
  const ok = { zhFiles: ["guide/index.mdx"], enFiles: ["guide/index.mdx"], metas: [] };
  assert.deepEqual(localeParity(ok), []);
  assert.equal(localeParity({ ...ok, enFiles: [] }).length, 1);
  assert.equal(localeParity({ ...ok, zhFiles: ["a.mdx", "b.mdx"], enFiles: ["b.mdx", "a.mdx"] }).length, 1);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test scripts/__tests__/gates.test.mjs`
Expected: FAIL —— `Cannot find module '../lib/gates.mjs'`

- [ ] **Step 3: 写实现**

Create `scripts/lib/gates.mjs`：

```js
/**
 * 六条防漂移判据。全部纯函数：数据与文件内容由调用方注入，便于夹具测试。
 * check-data.mjs 负责装载真实仓库。
 */
import { renderFragment, MARKER } from "./render.mjs";

/** 判据 2 的白名单 —— 只收【目录聚合口径】。 */
const AGG_ZH = [
  /(?<n>\d+) ?种(?:经典|机器)?(?:翻译 ?API|大模型接口|AI 大模型接口|大模型|翻译引擎|引擎)/g,
  /共 (?<n>\d+) 个/g,
];
const AGG_EN = [
  /(?<n>\d+) (?:classic |free )?(?:translation APIs|machine-translation APIs|LLM endpoints|LLM interfaces|AI LLM interfaces|translation engines|engines|LLMs)/g,
  /(?<n>\d+) in total/g,
];

export function aggregatePhrases({ text, locale }) {
  const out = [];
  for (const re of locale === "zh" ? AGG_ZH : AGG_EN) {
    for (const m of text.matchAll(re)) out.push({ text: m[0], index: m.index });
  }
  return out;
}

/** 判据 1：生成物逐字节新鲜。 */
export function fragmentIsFresh({ onDisk, rendered }) {
  return onDisk === rendered ? [] : [{ detail: "与 docs/data 重渲染结果不一致（手改过生成物？）" }];
}

/** 判据 3：精确语言总数只许出现在生成物与 changelog。 */
export function exactLanguageTotal({ text, total }) {
  const hits = [];
  for (const re of [new RegExp(`${total} ?种语言`, "g"), new RegExp(`${total} languages`, "g")]) {
    for (const m of text.matchAll(re)) hits.push({ text: m[0] });
  }
  return hits;
}

/** 判据 4：zh/en 文件集合与 _meta 顺序一致（忽略 _gen 之外的一切）。 */
export function localeParity({ zhFiles, enFiles, metas = [] }) {
  const problems = [];
  const only = (a, b, side) => a.filter((f) => !b.includes(f)).forEach((f) => problems.push({ detail: `${side} 独有: ${f}` }));
  only(zhFiles, enFiles, "zh");
  only(enFiles, zhFiles, "en");
  for (const { rel, zh, en } of metas) {
    if (JSON.stringify(zh) !== JSON.stringify(en)) problems.push({ rel, detail: "_meta.json 条目顺序不一致" });
  }
  return problems;
}

/** 判据 5：声明了 appUrl 的页面必须命中 tools.json。 */
export function appUrlTraceable({ files, tools }) {
  const known = new Set(tools.flatMap((t) => [t.appUrlZh, t.appUrlEn]));
  const problems = [];
  for (const f of files) {
    for (const [, url] of (f.text || "").matchAll(/^appUrl:\s*(\S+)/gm)) {
      if (!known.has(url.replace(/\/$/, ""))) problems.push({ rel: f.rel, detail: `appUrl 不在 tools.json: ${url}` });
    }
  }
  return problems;
}

/** 判据 6：经典 MT 表首列名单 == providers 的 MT 集合。 */
export function mtMembership({ tableText, data, locale }) {
  const expected = data.providers.filter((p) => p.category === "machine-translation").map((p) => p.label);
  const rows = tableText.split("\n")
    .filter((l) => l.trim().startsWith("|"))
    .filter((l) => !/^\|\s*[-: ]+\s*\|/.test(l))
    .filter((l) => !/^\|\s*(接口|Provider)\s*\|/i.test(l));
  const found = rows.map((l) => l.split("|")[1]?.trim()).filter(Boolean);
  const missing = expected.filter((x) => !found.includes(x));
  const extra = found.filter((x) => !expected.includes(x));
  const problems = [];
  if (missing.length) problems.push({ detail: `MT 表缺少: ${missing.join(", ")}` });
  if (extra.length) problems.push({ detail: `MT 表多出（源码已无此家）: ${extra.join(", ")}` });
  return problems;
}

/** 顶层：装载好的仓库快照 → 问题清单。 */
export function gates({ data, files, mtTables, configText }) {
  const problems = [];
  const push = (gate, p) => problems.push({ gate, ...p });
  const targetTotal = data.languages.items.filter((l) => l.value !== "auto").length;

  for (const { rel, locale, text } of files) {
    if (rel.includes("/_gen/")) {
      const rendered = renderFragment(rel.match(/_gen\/(.+)\.mdx$/)[1], data, locale);
      push("fragment", ...fragmentIsFresh({ onDisk: text, rendered }).map((x) => ({ rel, ...x })));
    } else if (!/\/changelog\.md$/.test(rel)) {
      push("aggregate", ...aggregatePhrases({ text, locale }).map((x) => ({ rel, detail: `硬编码聚合计数: ${x.text}` })));
      push("total", ...exactLanguageTotal({ text, total: targetTotal }).map((x) => ({ rel, detail: `精确语言总数: ${x.text}（应由生成片段给出）` })));
    }
  }
  for (const { rel, locale, tableText } of mtTables) {
    push("mtMembership", ...mtMembership({ tableText, data, locale }).map((x) => ({ rel, ...x })));
  }
  push("aggregate", ...aggregatePhrases({ text: configText, locale: "en" }).map((x) => ({ rel: "rspress.config.ts", detail: `config 硬编码计数: ${x.text}` })));
  push("appUrl", ...appUrlTraceable({ files, tools: data.tools }));
  return problems;
}
```

Create `scripts/check-data.mjs`：

```js
/**
 * 防漂移闸门（CI 用，不需要源码仓）：六条判据，只读 docs/data/*.json 与 docs/**。
 * 用法：node scripts/check-data.mjs   （yarn check:data）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gates } from "./lib/gates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "docs/data");
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const data = {
  providers: read(path.join(DATA, "providers.json")),
  languages: read(path.join(DATA, "languages.json")),
  tools: read(path.join(DATA, "tools.json")),
};

const walk = (dir, locale, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "public") walk(p, locale, out); }
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
};

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");
const files = [];
const byLocale = { zh: [], en: [] };
for (const locale of ["zh", "en"]) {
  for (const p of walk(path.join(ROOT, "docs", locale), locale)) {
    const text = fs.readFileSync(p, "utf8");
    files.push({ rel: rel(p), abs: p, locale, text });
    byLocale[locale].push(rel(p));
  }
}

// _meta.json 顺序对照
const metas = [];
for (const m of fs.readdirSync(path.join(ROOT, "docs/zh/guide"))) {
  const zp = path.join(ROOT, `docs/zh/guide/${m}/_meta.json`);
  const ep = path.join(ROOT, `docs/en/guide/${m}/_meta.json`);
  if (fs.existsSync(zp) && fs.existsSync(ep)) {
    const key = (arr) => arr.map((x) => (typeof x === "string" ? x : x.name));
    metas.push({ rel: `${m}/_meta.json`, zh: key(read(zp)), en: key(read(ep)) });
  }
}

// 经典 MT 表 = 「经典翻译 API」小节的第一个 markdown 表格块
const mtTables = [];
for (const f of files.filter((f) => /translation\/api\.mdx$/.test(f.rel))) {
  const start = f.text.search(/^## .*经典翻译 API|^## .*Classic translation APIs/m);
  if (start === -1) { console.error(`✗ ${f.rel} 找不到「经典翻译 API」小节标题 —— 判据 6 失效`); process.exit(1); }
  const rest = f.text.slice(start).split("\n## ")[0];
  const rows = rest.split("\n").filter((l) => l.trim().startsWith("|")).join("\n");
  mtTables.push({ rel: f.rel, locale: f.locale, tableText: rows });
}

const problems = [
  ...gates({ root: ROOT, data, files, mtTables, configText: fs.readFileSync(path.join(ROOT, "rspress.config.ts"), "utf8") }),
  ...localeParity({ zhFiles: byLocale.zh, enFiles: byLocale.en, metas }).map((p) => ({ gate: "parity", ...p })),
];

if (!problems.length) {
  console.log(`✓ 防漂移六条判据全过（${files.length} 个文档文件，providers=${data.providers.length}）`);
  process.exit(0);
}
console.error(`✗ 防漂移检查发现 ${problems.length} 处问题：\n`);
for (const p of problems) console.error(`  [${p.gate}] ${p.rel ?? ""}  ${p.detail}`);
process.exit(1);
```

CLI 顶部还需要一行装载（放在 `gates` import 同处）：

```js
import { gates, localeParity } from "./lib/gates.mjs";
```

`gates()` 内部不调 `localeParity`——它需要的是「两 locale 的文件清单」这种跨仓库视图，
放在 CLI 组装更直白；判据语义不变，`gates.test.mjs` 直接测 `localeParity`。

- [ ] **Step 4: 跑测试确认通过**

Run: `node --test scripts/__tests__/gates.test.mjs`
Expected: PASS

- [ ] **Step 5: 先干跑，看真实仓库命中面**

Run: `node scripts/check-data.mjs 2>&1 | head -40`
Expected: **红**，且命中清单应当**只有**本计划 Task 4/5 列出的 A 类位置。逐条核对：若出现 `47 种语言` / `92 种语言` / `7 种语言` / changelog 里的句子，说明白名单写宽了，**先收紧判据再继续**，不要为了变绿去改那些正文。

- [ ] **Step 6: 接上脚本入口**

Modify `package.json` 的 `scripts`：

```json
    "check:links": "node scripts/check-links.mjs",
    "check:data": "node scripts/check-data.mjs",
    "check": "node scripts/check-links.mjs && node scripts/check-data.mjs",
    "test": "node --test scripts/__tests__/",
    "sync": "node scripts/sync-from-source.mjs"
```

Run: `yarn test && yarn check:links`
Expected: test 全绿；links 仍绿（生成片段里的链接本就指向 public 下真实文件）。

- [ ] **Step 7: 提交**

```bash
git add scripts/lib/gates.mjs scripts/check-data.mjs scripts/__tests__/gates.test.mjs package.json
git commit -m "feat(ci): add six drift gates with fixture-tested judges"
```

---

## Task 4: api.mdx 接入生成片段（zh + en）

**Files:**
- Modify: `docs/zh/guide/translation/api.mdx`
- Modify: `docs/en/guide/translation/api.mdx`
- Delete: `docs/zh/guide/translation/_supported-languages.mdx`、`docs/en/guide/translation/_supported-languages.mdx`

**Interfaces:**
- Consumes: `docs/{zh,en}/guide/_gen/{provider-list,relay-list,language-table}.mdx`（Task 2）
- Produces: api.mdx 不再含任何目录聚合计数手抄；判据 2 在 api.mdx 上零命中

- [ ] **Step 1: 换 import**

`docs/zh/guide/translation/api.mdx:9` 现为：

```mdx
import SupportedLanguages from './_supported-languages.mdx';
```

改为两行（en 同理）：

```mdx
import ProviderList from '../_gen/provider-list.mdx';
import RelayList from '../_gen/relay-list.mdx';
import SupportedLanguages from '../_gen/language-table.mdx';
```

- [ ] **Step 2: 删掉导语里的计数句**

zh `:13` `工具集成了 **9 种经典翻译 API** 和 **26 种大模型接口**，可按文本类型…` →
`工具集成了经典机器翻译 API 与大语言模型接口两类服务，可按文本类型、预算与隐私需求自由选择。具体名单与数量见下方两节。`

en `:13` 同位置 → `The tool integrates both classic machine-translation APIs and LLM endpoints; pick by text type, budget and privacy needs. The exact rosters and counts are in the two sections below.`

- [ ] **Step 3: LLM 一节改用片段**

zh `:54` 的 `## 大语言模型（LLM）` 小节：删掉 `:56`「支持的 LLM 接口共 26 个，分两组：」及其后两个 bullet（16 家 / 10 家那两行），替换为：

```mdx
<ProviderList />
```

en 同位置（`:54` 起）替换 `26 LLM endpoints are supported, in two groups:` 与其下两个 bullet 为 `<ProviderList />`。
片段本身是 markdown 表格/列表，放进 MDX 直接渲染，无需组件包装。

- [ ] **Step 4: 中转清单改用片段**

zh `:175` 那一整段（`除 Gemini、Nvidia NIM、Azure OpenAI、Custom 之外的每个 LLM 接口（共 22 个：…长名单…）都在 API 设置里提供「中转 API」开关…`）整段替换为：

```mdx
<RelayList />
```

en `:175`（`Every LLM provider except … — 22 in total: …`）同样整段替换为 `<RelayList />`。

- [ ] **Step 5: 语言表指向新片段**

Run: `grep -n "SupportedLanguages" docs/zh/guide/translation/api.mdx docs/en/guide/translation/api.mdx`
Expected：只有 import 行（Step 1 已改指 `_gen/language-table.mdx`），使用处 `<SupportedLanguages />` 不动。

删旧文件：

```bash
git rm docs/zh/guide/translation/_supported-languages.mdx docs/en/guide/translation/_supported-languages.mdx
```

- [ ] **Step 6: 核对新片段的名单与源码一致**

Run: `grep -c '^|' docs/zh/guide/_gen/language-table.mdx`
Expected：122 行数据 + 8×2 表头/分隔 = **138**（`auto` 不在表内）。若不等，说明有语言没落进 8 组之一，排查 `source-eval.mts` 的 `groupOf()`，不要手改片段。

Run: `grep -o 'OpenCode Go' docs/zh/guide/_gen/provider-list.mdx | wc -l`
Expected：`1`（新增家自动进名单，无需人工补）

- [ ] **Step 7: 构建 + 链接检查**

Run: `yarn build 2>&1 | tail -15 && yarn check:links`
Expected：build 成功；links 绿。若 build 报 `Can't resolve './_supported-languages.mdx'`，说明还有页面在 import 旧文件，`grep -rn "_supported-languages" docs` 找出来一并改。

- [ ] **Step 8: 提交**

```bash
git add docs/zh/guide/translation/api.mdx docs/en/guide/translation/api.mdx
git commit -m "refactor(docs): source the provider roster, relay list and language table from generated fragments"
```

---

## Task 5: 清掉其余 A 类聚合计数

**Files:**
- Rename: `docs/zh/guide/index.md` → `docs/zh/guide/index.mdx`、`docs/en/guide/index.md` → `docs/en/guide/index.mdx`
- Modify: `docs/{zh,en}/guide/translation/index.mdx`、`info.mdx`、`subtitle-translator/index.mdx`、`md-translator/index.mdx`、`json-translate/index.mdx`
- Modify: `docs/{zh,en}/guide/json/json-value-transformer.mdx`、`docs/en/guide/json/json-node-edit.mdx`
- Modify: `rspress.config.ts`

**Interfaces:**
- Consumes: `docs/data/*.json`
- Produces: `yarn check:data` 在全部正文上零命中（判据 2 / 判据 3）

- [ ] **Step 1: 改名的原因与操作**

`.md` 在 Rspress 里不走 MDX，`import` 片段无效；需要引片段的 `guide/index` 必须换成 `.mdx`。URL 不变（都编译成 `index.html`），`_meta.json` 写的是无扩展名的 `"index"`，不受影响。

```bash
git mv docs/zh/guide/index.md docs/zh/guide/index.mdx
git mv docs/en/guide/index.md docs/en/guide/index.mdx
```

Run: `grep -rn "index\.md[^x]" docs --include=*.md --include=*.mdx | grep -v doc_build`
Expected：无输出（没有链接显式指向 `.md`）；若有，改成 `.mdx`。

- [ ] **Step 2: 逐处改写**

每处只给目标文案，改写时保持各文件其余内容不动。

| 文件:行 | 原文（节选） | 改为 |
| --- | --- | --- |
| `docs/zh/guide/index.mdx:19` | `共享 9 种翻译 API + 26 种大模型接口，覆盖 120+ 语言` | `共享同一套翻译接口：经典机器翻译 API 加大语言模型，覆盖 120+ 语言` |
| `docs/en/guide/index.mdx:19` | `sharing 9 translation APIs and 26 LLM endpoints, covering 120+ languages` | `sharing one endpoint pool — classic translation APIs plus LLMs — across 120+ languages` |
| `docs/zh/guide/index.mdx:29` | `七款互补的纯文本处理工具` | `一组互补的纯文本处理工具`（「七款」相对源码 8 款已陈旧，且计数本身会漂） |
| `docs/en/guide/index.mdx:29` | `Seven complementary text utilities` | `A set of complementary text utilities` |
| `docs/{zh,en}/guide/text/index.mdx` 导语 | 同类「七款/Seven」 | 同上口径 |
| `docs/zh/guide/translation/index.mdx:6` | frontmatter `支持 26 种大模型接口与 9 种翻译 API` | `支持经典机器翻译 API 与大语言模型接口`（frontmatter 不能渲染片段，一律去计数） |
| `docs/zh/guide/translation/index.mdx:21` | `9 种翻译 API + 26 种大模型接口` | `翻译 API + 大模型接口双轨`（en 同） |
| `docs/zh/guide/translation/api.mdx:6` | frontmatter `集成了 9 种机器翻译 API 与 26 种大模型接口` | `集成经典机器翻译 API 与大语言模型接口` |
| `docs/en/guide/translation/api.mdx:6` | `integrates 9 machine-translation APIs and 26 LLM endpoints` | `integrates classic machine-translation APIs and LLM endpoints` |
| `docs/{zh,en}/guide/translation/info.mdx:111` | `122 种语言按地理 + 使用人数分组` | `所有目标语言按地理 + 使用人数分组`（精确总数交给 `_gen/language-table.mdx`） |
| `docs/zh/guide/translation/subtitle-translator/index.mdx:123` | `内置 9 种免费 / 商用翻译 API 以及 26 种 AI 大模型接口` | `内置免费与商用翻译 API，以及 AI 大模型接口` |
| `docs/zh/guide/translation/md-translator/index.mdx:24`、`:165` | `35 种引擎` | `全部翻译接口`（en :25 `35 engines total`、:173 同） |
| `docs/zh/guide/translation/json-translate/index.mdx:7`、`:25`、`:245` | `35 种引擎` | `全部翻译接口`（en :26、:254 同） |
| `docs/zh/guide/json/json-value-transformer.mdx:42` | `配合 DeepSeek、Claude、GPT 等 35 种引擎` | `配合 DeepSeek、Claude、GPT 等大模型接口` |
| `docs/en/guide/json/json-node-edit.mdx:48` | `it supports 35 engines` | `it supports every translation endpoint` |
| `docs/en/guide/json/json-value-transformer.mdx:48` | `with any of 35 engines` | `with any LLM or MT endpoint` |
| `docs/en/guide/translation/subtitle-translator/index.mdx:7` | frontmatter `with 35 engines` | `with MT APIs and LLMs` |

`docs/zh/guide/index.mdx:37` 的 `数据批处理 …（暂无独立指南）` 保持不动（用户决定：不建页）。

- [ ] **Step 3: rspress.config.ts 读同源数据**

config 里的计数写死（`7 种翻译 API + 23 种 AI 大模型`）就是实测漂移最严重的一处。改为读数据 + 稳定表述：

```ts
import { readFileSync } from "node:fs";
// config 由 rspress 用加载器求值，JSON import 在部分加载路径下不稳，直读文件更省心。
const catalog = JSON.parse(readFileSync(path.join(__dirname, "docs/data/providers.json"), "utf8"));
const languageCount = JSON.parse(readFileSync(path.join(__dirname, "docs/data/languages.json"), "utf8")).items.filter((l) => l.value !== "auto").length;
```

`locales[].description`、`pluginGeo` 的 `siteDescription` / `appDescription` 四处（`:50 :56 :104 :106`）统一改成不含接口计数的表述，语言数用 `${languageCount}`：

```ts
description: `免费的字幕翻译（SRT / ASS / VTT）、保留代码块与 LaTeX 的 Markdown 翻译、JSON i18n 本地化工具。机器翻译 API 与大语言模型双轨，覆盖 ${languageCount} 种目标语言。完整使用文档与 API 配置指南。`,
```

en 侧同构。**不要在 config 里渲染 provider 家数**——判据 2 会抓 `N translation APIs` 这类句式，写了就红。

- [ ] **Step 4: 全量跑闸门，应零命中**

Run: `yarn check:data`
Expected：`✓ 防漂移六条判据全过`。若仍红，按打印的 `[gate] 文件 详情` 逐条回到 Step 2 的表补改；**不许**通过放宽正则或给文件加豁免来变绿。

Run: `yarn build 2>&1 | tail -8`
Expected：成功。

- [ ] **Step 5: 提交**

```bash
git add -A docs rspress.config.ts
git commit -m "docs: drop hand-copied catalog counts from prose and site metadata"
```

---

## Task 6: 事实补正（OpenCode Go / Azure v1 / 快捷地址 / 温度名单 / 界面名）

**Files:**
- Modify: `docs/{zh,en}/guide/translation/api.mdx`
- Modify: `docs/{zh,en}/guide/translation/info.mdx`（单文件模式、指定下载目录）
- Modify: `docs/{zh,en}/guide/translation/_interface.mdx`（界面名逐字对照）

**Interfaces:**
- Consumes: `docs/data/providers.json`（Task 2）—— 本 Task 的每条断言都要能在 providers.json 或源码里指回出处
- Produces: 文档描述与 web-tools v3.2.0 的界面与配置项一致

- [ ] **Step 1: 「部分接口的特别说明」补 OpenCode Go 一条**

在 zh `api.mdx` 的 `### 部分接口的特别说明` 里，紧挨 OpenCode Zen 那条之后加（en 同步）：

```md
- **OpenCode Go**：与 OpenCode Zen **同 host、同账号、同一把 API Key**，只有三处不同——请求路径（`/zen/go/v1` 与 `/zen/v1`）、在售 SKU 集合、计费形态。Go 是 **$10/月的订阅额度**（官方按每模型月限额换算：5 小时 = 20%、周 = 50%、月 = 100%），Zen 是充值余额，**两者文案不可混用**（别把 Go 写成「充值即用」）。官方限定一个 workspace 只能有一人订阅 Go。「中转 API」默认开启。
```

出处：`providers.json` 的 `opencodeGo` 条目 + 源码 `registry.ts:1158-1175` 的注释（commit `f8c1ae0c3`）。

- [ ] **Step 2: Azure OpenAI 一节改写为 v1 GA**

zh `api.mdx` 里所有 Azure OpenAI 相关句子按以下事实改写（en 同步）：

- 请求地址 = 用户在 URL 栏填的**资源根** + 固定 `/openai/v1` 后缀，官方没有可直接照抄的完整端点；
- 设置表单**不再有 apiVersion / 部署版本输入项**（`5ab1ac3bb` 删字段），旧文档若提到该字段一律删；
- 模型栏填**部署名**；
- `reasoning_effort` 走 OpenAI 兼容形态正常下发（`fd5402bc9` 并入工厂）。

Run: `grep -rn "apiVersion\|部署版本" docs | grep -v doc_build`
Expected：无输出（确认历史句子已清干净）。

- [ ] **Step 3: 本地运行时快捷地址改为同源**

zh `api.mdx:199` 的「默认接口地址」与 `:56` 段里「URL 输入框上方直接列出 LM Studio / Ollama / llama.cpp / koboldcpp / LiteLLM / Together AI / Fireworks AI **七个**快捷地址」——按实测改为：

- Custom (OpenAI-compatible)：**9 个**快捷地址（LM Studio / Ollama / llama.cpp / koboldcpp / LiteLLM / 9Router / OmniRoute / Together AI / Fireworks AI）
- TranslateGemma、MiLMMT：各 **3 个**（LM Studio / llama.cpp / koboldcpp）

出处：`providers.json` 里 `llm.endpoints`（9 条）、`translategemma.endpoints`、`milmmt.endpoints`（各 3 条）。
「七个」「四个快捷项完全一致」这类旧表述全部改掉。

Run: `grep -rn "七个快捷\|四个快捷" docs | grep -v doc_build | grep -v changelog`
Expected：无输出。

- [ ] **Step 4: 温度参数缺席名单按源码重核**

zh `api.mdx:71`「五个接口没有这个控件：OpenAI（GPT-5.x 全系…）、Claude、Gemini、Kimi、Azure OpenAI」——逐家回 `providers.json` 核 `defaultTemperature` / 是否发 temperature 的真实情况，只保留源码支持的说法，并把「GPT-5.x」这种写死代际的措辞改成不随版本失效的说法（如「OpenAI 的在售全系」）。名单本身若与源码不符，以源码为准重写；拿不准的接口在本步**标为待核**并在提交信息里说明，不要凭印象编。

- [ ] **Step 5: 界面名逐字校准**

对 Task 6 触碰的每个文件，把正文里出现的按钮/标签/抽屉名与 `web-tools-by-ai/messages/zh.json` 对应命名空间逐字比对（翻译设置在 `TranslationSettings`，术语表在 `TranslationGlossary`，字幕 `SubtitleTranslator`，JSON `JSON` / `JSONTranslate`）。

Run: `node -e "const m=require('../web-tools-by-ai/messages/zh.json');console.log(Object.keys(m.TranslationSettings).filter(k=>/relay|single|download|folder/i.test(k)).map(k=>k+'='+m.TranslationSettings[k]).join('\n'))"`
Expected：打印出「中转 API」等控件的真实标签，用它校正正文。

- [ ] **Step 6: 单文件模式 / 指定下载目录**

`65b5dab84`（单文件模式与缓存设置自由配置）、`f3c78ddad`（指定下载目录）两个能力在 `info.mdx` 的导出/缓存小节补说明，界面名走 Step 5 的真实标签。写清楚：浏览器下载目录权限按环境而异（源码 `79fa474b6` 的教训是提示语必须「环境诚实」，不要承诺所有浏览器都能选目录）。

- [ ] **Step 7: 检查 + 提交**

Run: `yarn check && yarn build 2>&1 | tail -5`
Expected：全绿。

```bash
git add docs
git commit -m "docs: correct provider details against web-tools v3.2.0 (OpenCode Go, Azure v1, local endpoints, temperature roster)"
```

---

## Task 7: text-toolbox 页重写

**Files:**
- Modify: `docs/{zh,en}/guide/text/text-toolbox.mdx`
- Modify: `docs/public/img/text-toolbox-zh.webp`、`text-toolbox-en.webp`

**Interfaces:**
- Consumes: `web-tools-by-ai/src/app/[locale]/(text)/text-toolbox/{TextToolbox.tsx,ops.ts,chain.ts,presets.ts,StepParamsForm.tsx}`、`messages/{zh,en}.json` 的 `TextToolbox` 命名空间
- Produces: 正文描述的界面结构 = 当前真实界面；截图为工作中态

- [ ] **Step 1: 先读源码，列出界面事实清单**

Run: `cd ../web-tools-by-ai && git show --stat 8c22f20bb | tail -20 && sed -n '1,60p' "src/app/[locale]/(text)/text-toolbox/presets.ts"`

再从 `messages/zh.json` 的 `TextToolbox` 命名空间打印全部标签：

```bash
node -e "const m=require('../web-tools-by-ai/messages/zh.json');const t=m.TextToolbox;const walk=(o,p='')=>Object.entries(o).forEach(([k,v])=>typeof v==='object'?walk(v,p+k+'.'):console.log(p+k+'='+v));walk(t)" | head -60
```

**产出一张「界面名清单」**（band 分区名、按钮名、步骤链/预设相关控件名），文档里每个界面词都必须能在这张表里逐字找到；表里没有的名词不许写。

- [ ] **Step 2: 重写主章节**

按真实结构改写（保留 frontmatter 的 SEO 字段，只把 description 里过时的能力描述换掉）：

1. `## 操作目录` —— 有哪些操作、按什么带（band）分区；用 Step 1 的分区真实名
2. `## 步骤链` —— 多个操作串联成一条链的执行语义（上一步输出即下一步输入）、参数表单在哪填
3. `## 预设` —— 保存/载入步骤链为预设，预设存在哪（localStorage / 导出）
4. 保留原有仍成立的「正则匹配 / 去重 / 批量加前后缀」等内容，但归入上面三节，不再罗列成散按钮
5. 默认值说明同步 `08ac7ed57`：出厂默认值收敛到唯一来源、「每行加字」默认改用前缀

`faq` frontmatter 里若仍引用旧界面名（如某条说「点顶部 XX 按钮」），一并校正为真实标签。

- [ ] **Step 3: 重拍两张截图（工作中态）**

```bash
cd ../web-tools-by-ai && yarn dev > /tmp/webtools-dev.log 2>&1 &
```
等端口起来（默认 3000），用本机已实测可用的 chrome-devtools CLI 截图，**先填入示例文本并选中一条步骤链再拍**，不要拍空页面：

```bash
# 具体子命令以本机 chrome-devtools CLI 为准；关键是 filePath 必须绝对路径
chrome-devtools screenshot --url http://localhost:3000/zh/text-toolbox --filePath <绝对路径>/text-toolbox-zh.png
chrome-devtools screenshot --url http://localhost:3000/en/text-toolbox --filePath <绝对路径>/text-toolbox-en.png
```

裁切 + 转 WebP，尺寸/体积口径对齐现有图（同目录其它 webp 在 25–82 KB 区间）：

```bash
cwebp -q 80 -mt text-toolbox-zh.png -o docs/public/img/text-toolbox-zh.webp
```

- [ ] **Step 4: 目检新图**

用 Read 工具看两张 webp，确认「操作目录 / 步骤链 / 预设」的界面元素确实出现，且新图与 Step 2 正文描述的分区名对得上。看不清就先 `zoom=2` 截局部，不要凭缩略图下结论。

**通路不通时的处置**：CDP 起不来或截不到图 → 保留旧图，正文照常按新界面改，并在最终报告里**明确写出「text-toolbox 截图仍是旧布局」这个缺口**。不许拿无关截图或生成图凑数。

- [ ] **Step 5: 关闭 dev server + 检查 + 提交**

```bash
# 记下 dev server 进程并按 pid 关，避免 serve 僵尸
yarn check && yarn build 2>&1 | tail -5
git add docs/zh/guide/text/text-toolbox.mdx docs/en/guide/text/text-toolbox.mdx docs/public/img/text-toolbox-zh.webp docs/public/img/text-toolbox-en.webp
git commit -m "docs(text-toolbox): describe the operation-catalog / chain / preset UI"
```

---

## Task 8: changelog 追加（zh + en）

**Files:**
- Modify: `docs/zh/guide/translation/changelog.md`、`docs/en/guide/translation/changelog.md`

**Interfaces:**
- Consumes: `web-tools-by-ai` 的 git 历史（日期以 commit 实际日期为准，不猜）
- Produces: 两边新增同内容条目，历史条目零改写

- [ ] **Step 1: 取每条的真实日期**

```bash
cd ../web-tools-by-ai && for h in 65b5dab84 f3c78ddad f8c1ae0c3 5ab1ac3bb fd5402bc9 8c22f20bb e469c3d9f e86de3e27 6174e69b3 0abead85e 98a33f6fd 7b6309aa8 7b4760594 3996d32d2 5c88256a8 04ab91d8e 785bf107a 3f0ee1bc4; do git log -1 --format='%cd %h %s' --date=short $h; done
```

Expected：18 行日期+摘要。**条目日期用这里的 %cd**，不要用本计划的转述。

- [ ] **Step 2: 按日期倒序插入新条目**

在 `# 更新日志` 之后、现有 `2026.08.24` 之前插入（同日期合并成一条，用户视角写「界面/能力发生了什么变化」，不写内部重构名）：

- **单文件模式与缓存设置自由配置**、**指定下载目录**（08-31 两条）
- **收录 OpenCode Go**（09-17）——一句说清与 Zen 的关系与计费差异
- **Azure OpenAI 迁移 v1 GA**（09-26）——配置项减少 apiVersion
- **text-toolbox 改版**（09-17）——操作目录 + 步骤链 + 预设
- **新增 9Router / OmniRoute 快捷地址**（09 月两条）
- **新增匈牙利语，界面语种增至 19**（09-24）
- **首屏瘦身**（09-11/09-18：抽屉弹窗按需挂载、第三方脚本延后、懒加载翻译耗时/复核/多语面板）
- **Design QA 无障碍修正**（09-28：焦点环、空表头、BackTop 直角等，用户可见项写清楚）

- [ ] **Step 3: 排正顶部日期顺序**

现有 `2026.08.21` 条目在 `2026.08.22` 之前（zh/en 同问题，各 `:17` 与 `:24`）。只**移动整块**调整顺序，条目文字一字不改。

- [ ] **Step 4: 双语一致性核对**

Run: `grep -c '^- 2026' docs/zh/guide/translation/changelog.md docs/en/guide/translation/changelog.md`
Expected：两边条目数相同。不同就是有漏译。

Run: `yarn check && yarn build 2>&1 | tail -5`
Expected：全绿（changelog 是判据 2 / 3 的豁免路径，新条目里写计数不会红——但仍应避免写目录聚合数）。

- [ ] **Step 5: 提交**

```bash
git add docs/zh/guide/translation/changelog.md docs/en/guide/translation/changelog.md
git commit -m "docs(changelog): record the September–October provider and UI changes"
```

---

## Task 9: 收尾——CI、README、孤儿文件、全量验收

**Files:**
- Modify: `.github/workflows/main.yml`
- Delete: `i18n.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: 前八个 Task 的全部产物
- Produces: CI 与本地一致的同源校验；仓库文档说明 sync 用法

- [ ] **Step 1: 接上 CI**

Modify `.github/workflows/main.yml`：把现有 `yarn check:links`（约 `:35`）改为：

```yaml
        run: |
          yarn test
          yarn check
```

`check` = links + data（Task 3 已串好）。**不**在 CI 里调用 sync（CI 上没有源码仓，也不该有）。

- [ ] **Step 2: README 写清机制**

在 `README.md` 的 `## Get Started` 之后加一节（这是本仓唯一需要新文档说明的东西）：

```md
## 内容从哪里来

本文档描述 [web-tools-by-ai](https://github.com/rockbenben/web-tools-by-ai) 的工具。
工具清单、翻译接口、语言列表这些**会随源码变的**事实不在正文里手抄：

​```bash
# 两仓需同级 checkout，且源码仓已 yarn install
yarn sync ../web-tools-by-ai
​```

`yarn sync` 借源码仓自己的 tsx 求值 registry，重写 `docs/data/*.json`，再由 `scripts/lib/render.mjs`
渲染 `docs/{zh,en}/guide/_gen/*.mdx`。**`_gen/` 下的文件与 `docs/data/` 都不要手改**，
改内容去改模板或改源码侧 registry。CI 跑 `yarn check` 校验产物自洽、正文没重新硬编码。
```

- [ ] **Step 3: 删孤儿 i18n.json**

理由已在 spec §10 落实：全仓 ts/tsx/mjs/js/json/yml/md 零代码引用；两处 grep 命中是正文在举例 app 侧的输入文件名；内容是导航标签，职责已被 `docs/{zh,en}/_nav.json` 取代；2025-04-08 后再未改动。

```bash
git rm i18n.json
```

- [ ] **Step 4: 全量验收**

Run: `yarn test && yarn check && yarn build`
Expected：三条全绿，build 产出 `doc_build/`。

- [ ] **Step 5: 闸门自证（必须做，否则闸门等于没写）**

1. 手改 `docs/zh/guide/_gen/provider-list.mdx` 里的一个数字（27 → 26）
   Run: `yarn check:data` → Expected: 红，`[fragment] ... 与 docs/data 重渲染结果不一致`
   恢复：`git checkout docs/zh/guide/_gen/provider-list.mdx`
2. 在 `docs/zh/guide/translation/index.mdx` 随手加一句 `支持 26 种大模型接口`
   Run: `yarn check:data` → Expected: 红，`[aggregate]`
   恢复该文件
3. 往 `docs/zh/guide/translation/api.mdx` 的 MT 表加一行 `| Baidu MT | ★ |`
   Run: `yarn check:data` → Expected: 红，`[mtMembership] MT 表多出（源码已无此家）: Baidu MT`
   恢复
4. 删掉 `docs/en/guide/text/text-diff.mdx`（临时）
   Run: `yarn check:data` → Expected: 红，`[parity]`
   恢复

全部恢复后再跑一次 `yarn check:data`，Expected: 绿。

- [ ] **Step 6: 目检三页**

Run: `yarn preview`（或 `yarn dev`），打开 `/zh/guide/translation/api`、`/zh/guide/text/text-toolbox`、`/zh/guide/`，用 chrome-devtools CLI 截图后用 Read 看：清单与 `_gen/` 片段渲染一致、text-toolbox 图文相符、首页不再有「七款 / 9 种 + 26 种」这类残留。en 侧同走一遍。

- [ ] **Step 7: 提交**

```bash
git add .github/workflows/main.yml README.md
git commit -m "chore(ci): gate docs on the drift checks and document the sync workflow"
```

- [ ] **Step 8: 汇报（不 push）**

打印 `git log --oneline` 的本轮提交清单 + `yarn check` 输出，向用户汇报并等 push 批准。

---

## Self-Review 记录

写完本计划后按 spec 逐节回查的结果：

- **spec §2 目标 1–4** 分别由 Task 2/3（数据同源 + 闸门）、Task 4–8（补正）、Task 7（截图）覆盖；§3 非目标在 Task 5 Step 2（data-batch 维持外链）与 Task 7 Step 4（只动 text-toolbox 两张图）落实。
- **spec §5 数据字段**与 Task 2 Step 1 的 `source-eval.mts` 逐字段对应；spec 里写 `defaultUseRelay`（不是 `useRelay`）——已在 spec 内修正。
- **spec §6 三个片段** == `FRAGMENT_NAMES`（Task 1）；spec 已删去 `model-list` / `tools-list` 两行并说明理由。
- **spec §8 六条判据** == `gates()` 覆盖五条（fragment / aggregate / total / mtMembership / appUrl）+ CLI 组装时补一次 `localeParity`。parity 需要「两 locale 文件清单」这种跨仓库视图，故不进 `gates()`；判据语义不变，`gates.test.mjs` 直接测 `localeParity`。
- **spec §9.1 清单**逐行落到 Task 4/5 的改写表；`api.mdx:175` 与 `:56` 由片段承担，其余为文字改写。
- **占位符扫描**：Task 7 Step 3 的 `chrome-devtools screenshot --url … --filePath <绝对路径>` 保留尖括号，是因为本机 CLI 的确切子命令名需现场 `chrome-devtools --help` 确认（spec §12 已把截图通路列为风险）。执行时先确认命令形态，不可照抄猜测。
- **类型一致性**：`DocData` / `counts()` / `renderFragment(name, data, locale)` 在 Task 1 定义，Task 2 CLI 与 Task 3 `gates()` 使用同名签名；`Provider.defaultUseRelay` 三态（`true` / `false` / `null`）在 Task 1 的 `hasRelay()` 与 Task 2 的摘要统计里口径一致（`typeof === "boolean"`）。
