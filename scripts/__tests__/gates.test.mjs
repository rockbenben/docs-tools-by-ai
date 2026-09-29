import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregatePhrases,
  fragmentIsFresh,
  exactLanguageTotal,
  mtMembership,
  appUrlTraceable,
  localeParity,
} from "../lib/gates.mjs";

const DATA = {
  providers: [
    { key: "gtxFreeAPI", label: "GTX API (Free)", category: "machine-translation", hidden: false },
    { key: "qwenMt", label: "Qwen-MT", category: "machine-translation", hidden: false },
    { key: "deepseek", label: "DeepSeek", category: "llm", hidden: false, defaultUseRelay: false },
  ],
  languages: { groups: [], items: [{ value: "auto" }, { value: "en" }, { value: "de" }] },
  tools: [{ appUrlZh: "https://t.dev/zh/text-diff", appUrlEn: "https://t.dev/en/text-diff" }],
};

const zhHits = (t) => aggregatePhrases(t, "zh").map((h) => h.text);
const enHits = (t) => aggregatePhrases(t, "en").map((h) => h.text);

test("判据 2：抓目录聚合口径", () => {
  assert.deepEqual(zhHits("工具集成了 9 种翻译 API"), ["9 种翻译 API"]);
  assert.deepEqual(zhHits("以及 26 种 AI 大模型接口"), ["26 种 AI 大模型接口"]);
  assert.deepEqual(zhHits("支持的 LLM 接口共 26 个，分两组"), ["共 26 个"]);
  assert.deepEqual(zhHits("配合 DeepSeek、Claude、GPT 等 35 种引擎"), ["35 种引擎"]);
  assert.deepEqual(enHits("9 translation APIs and 26 LLM endpoints"), ["9 translation APIs", "26 LLM endpoints"]);
  assert.deepEqual(enHits("Every provider — 22 in total: DeepSeek"), ["22 in total"]);
});

test("判据 2：放过厂商自述数字、中文数字与稳定表述", () => {
  for (const t of [
    "小米，47 种语言",
    "Qwen-MT 官方约 92 种语言",
    "TranslateGemma（Google，53 种语言）",
    "7 种语言两两互转",
    "覆盖 120+ 种语言",
    "五个接口没有这个控件",
    "18 种界面语言",
    "the tool supports 47 languages",
  ]) {
    assert.deepEqual([...zhHits(t), ...enHits(t)], [], `不该命中: ${t}`);
  }
});

test("判据 1：手改生成物即红，行尾差异不算红", () => {
  const lf = "a\nb\n";
  assert.deepEqual(fragmentIsFresh({ onDisk: lf, rendered: lf }), []);
  assert.deepEqual(fragmentIsFresh({ onDisk: "a\r\nb\r\n", rendered: lf }), []);
  assert.equal(fragmentIsFresh({ onDisk: "a\nB\n", rendered: lf }).length, 1);
});

test("判据 3：只认精确语言总数", () => {
  assert.equal(exactLanguageTotal("122 种语言按地理分组", 122).length, 1);
  assert.equal(exactLanguageTotal("122 languages are grouped", 122).length, 1);
  assert.equal(exactLanguageTotal("覆盖 120+ 语言", 122).length, 0);
  assert.equal(exactLanguageTotal("小米，47 种语言", 122).length, 0);
});

test("判据 6：MT 表名单双向对账", () => {
  const table = "| 接口 | 质量 |\n| --- | --- |\n| GTX API (Free) | ★ |\n| Qwen-MT | ★ |";
  assert.deepEqual(mtMembership({ tableText: table, data: DATA }), []);
  // 表头按位置剔除：单行表格会被当成表头，于是两家都算缺
  assert.match(mtMembership({ tableText: "| 接口 | 质量 |", data: DATA })[0].detail, /缺少/);
  assert.match(mtMembership({ tableText: table + "\n| Baidu MT | ★ |", data: DATA })[0].detail, /不符|多出/);
});

test("判据 5：未声明 appUrl 的文件跳过", () => {
  const ok = [{ rel: "a.mdx", text: "appUrl: https://t.dev/zh/text-diff" }, { rel: "b.mdx", text: "没有 appUrl 字段" }];
  assert.deepEqual(appUrlTraceable({ files: ok, tools: DATA.tools }), []);
  const bad = [{ rel: "a.mdx", text: "appUrl: https://t.dev/zh/ghost" }];
  assert.equal(appUrlTraceable({ files: bad, tools: DATA.tools }).length, 1);
});

test("判据 4：文件集合与 _meta 顺序", () => {
  const base = { zhFiles: ["guide/index.mdx"], enFiles: ["guide/index.mdx"], metas: [] };
  assert.deepEqual(localeParity(base), []);
  assert.equal(localeParity({ ...base, enFiles: [] }).length, 1);
  assert.equal(localeParity({ ...base, zhFiles: [] }).length, 1);
  // 文件清单本身不比顺序（readdir 都是字母序）；侧栏顺序由 _meta.json 那条管。
  assert.deepEqual(localeParity({ zhFiles: ["a.mdx", "b.mdx"], enFiles: ["b.mdx", "a.mdx"], metas: [] }), []);
  assert.equal(
    localeParity({ ...base, metas: [{ rel: "text/_meta.json", zh: ["index", "x"], en: ["x", "index"] }] }).length,
    1,
  );
});
