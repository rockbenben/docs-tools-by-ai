import test from "node:test";
import assert from "node:assert/strict";
import { renderFragment, counts, MARKER, FRAGMENT_NAMES } from "../lib/render.mjs";

// 夹具刻意只放 5 家 provider / 2 组语言，断言逐字输出，不依赖真实数据量。
const FIXTURE = {
  providers: [
    { key: "gtxFreeAPI", label: "GTX API (Free)", category: "machine-translation" },
    { key: "deepseek", label: "DeepSeek", category: "llm", defaultUseRelay: false },
    { key: "opencodeGo", label: "OpenCode Go", category: "aggregator", defaultUseRelay: true },
    { key: "volcengine", label: "Volcengine Coding Plan", category: "llm", hidden: true, defaultUseRelay: true },
    { key: "claude", label: "Claude", category: "llm", defaultUseRelay: null },
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

test("counts 排除 hidden 与 auto，中转数只认布尔值", () => {
  assert.deepEqual(counts(FIXTURE), {
    mt: 1,
    llmVisible: 3,
    llmDirect: 2,
    llmAggregator: 1,
    relayVisible: 2,
    targetLanguages: 3,
  });
});

test("provider-list zh 逐字输出，hidden 家不出现", () => {
  const out = renderFragment("provider-list", FIXTURE, "zh");
  assert.ok(out.startsWith(MARKER), "首行必须是生成标记");
  assert.match(out, /支持的 LLM 接口共 3 个，分两组：/);
  assert.match(out, /\*\*厂商直连（2 家）\*\*：DeepSeek、Claude/);
  assert.match(out, /\*\*聚合网关与自托管（1 家）\*\*：OpenCode Go/);
  assert.doesNotMatch(out, /Volcengine/);
});

test("provider-list en 同结构", () => {
  const out = renderFragment("provider-list", FIXTURE, "en");
  assert.match(out, /3 LLM endpoints are supported, in two groups:/);
  assert.match(out, /\*\*Direct vendors \(2\)\*\*: DeepSeek, Claude/);
});

test("provider-list 把 Custom 计入聚合组家数，但单列在名单末尾", () => {
  const data = { ...FIXTURE, providers: [...FIXTURE.providers, { key: "llm", label: "Custom (OpenAI-compatible)", category: "aggregator", defaultUseRelay: null }] };
  const out = renderFragment("provider-list", data, "zh");
  // 口径：两组家数相加必须等于总数（2 直连 + 2 聚合 = 4），Custom 算聚合组的一员
  assert.match(out, /支持的 LLM 接口共 4 个/);
  assert.match(out, /\*\*聚合网关与自托管（2 家）\*\*：OpenCode Go，以及 \*\*Custom \(OpenAI-compatible\)\*\*/);
});

test("relay-list 名单只含有中转字段的家，无字段的列在例外里", () => {
  const out = renderFragment("relay-list", FIXTURE, "zh");
  assert.match(out, /除 Claude 之外的每个 LLM 接口（共 2 个：DeepSeek、OpenCode Go）/);
  assert.doesNotMatch(out, /Volcengine/, "hidden 家不得出现在任何一处");
  assert.match(out, /OpenCode Go[^。]*默认开启/s);
});

test("relay-list en 同结构", () => {
  const out = renderFragment("relay-list", FIXTURE, "en");
  assert.match(out, /Every LLM provider except Claude — 2 in total: DeepSeek, OpenCode Go/);
});

test("language-table 双语同结构：四列 + 分组标题本地化 + auto 不入表", () => {
  const zh = renderFragment("language-table", FIXTURE, "zh");
  const en = renderFragment("language-table", FIXTURE, "en");
  assert.match(zh, /### 常用/);
  assert.match(en, /### Common/);
  for (const out of [zh, en]) {
    assert.match(out, /\| Code \| Native \| English \| 中文 \|/);
    assert.match(out, /\| `de` \| Deutsch \| German \| 德语 \|/);
    assert.doesNotMatch(out, /\| `auto` \|/);
  }
});

test("label 自带别名时不再叠标注，避免渲染出「（阶跃星辰）（阶跃星辰）」", () => {
  const data = {
    ...FIXTURE,
    providers: [{ key: "stepfun", label: "StepFun (阶跃星辰)", category: "llm", defaultUseRelay: false }, ...FIXTURE.providers],
  };
  const out = renderFragment("provider-list", data, "zh");
  assert.match(out, /StepFun \(阶跃星辰\)/);
  assert.doesNotMatch(out, /）（/, "括号不得连续重复");
});

test("未知片段名直接抛错，不静默产出空文件", () => {
  assert.throws(() => renderFragment("nope", FIXTURE, "zh"), /未知片段/);
  assert.deepEqual([...FRAGMENT_NAMES], ["provider-list", "relay-list", "language-table"]);
});
