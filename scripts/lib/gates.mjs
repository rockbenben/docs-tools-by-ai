/**
 * 六条防漂移判据。全部纯函数：数据与文件内容由调用方注入，便于夹具测试。
 * check-data.mjs 负责装载真实仓库。
 *
 * 判据只管【会随源码漂的目录事实】。星级评分、推荐语、厂商自述的能力上限
 * （Qwen-MT 92 种、MiLMMT 47 种）是编辑判断，不在射程内 —— 抓它们会把人逼去
 * 改对的东西。
 */
import { renderFragment } from "./render.mjs";

/**
 * 聚合口径白名单。只收「整站接口总数」这一类句式：
 *  · `N 种翻译 API / 大模型接口 / 引擎`（zh）、`N translation APIs / LLM endpoints / engines`（en）
 *  · `共 N 个`（zh）、`N in total`（en）
 * 刻意不收 `N 种语言`（与厂商自述同形，无法区分）与 `N 个接口`（实测零命中，空转规则只会增加误伤面）。
 */
const AGG_ZH = [
  /\d+ ?种 ?(?:经典|机器|AI ?)?(?:翻译 ?API|大模型接口|大模型|翻译引擎|引擎)/g,
  /共 \d+ 个/g,
];
const AGG_EN = [
  /\d+ (?:classic |free )?(?:translation APIs|machine-translation APIs|LLM endpoints|LLM interfaces|AI LLM interfaces|translation engines|engines|LLMs)/g,
  /\d+ in total/g,
];

export function aggregatePhrases(text, locale) {
  const out = [];
  for (const re of locale === "zh" ? AGG_ZH : AGG_EN) {
    for (const m of text.matchAll(re)) out.push({ text: m[0], index: m.index });
  }
  return out;
}

/** 判据 1：生成物逐字节新鲜。行尾不参与比较（仓库 text=auto 会让克隆后的工作树变 CRLF）。 */
export function fragmentIsFresh({ onDisk, rendered }) {
  const norm = (t) => t.replace(/\r\n/g, "\n");
  return norm(onDisk) === norm(rendered) ? [] : [{ detail: "与 docs/data 重渲染结果不一致（手改过生成物？）" }];
}

/** 判据 3：精确语言总数只许出现在生成物与 changelog 里。 */
export function exactLanguageTotal(text, total) {
  const hits = [];
  for (const re of [new RegExp(`${total} ?种语言`, "g"), new RegExp(`${total} languages`, "g")]) {
    for (const m of text.matchAll(re)) hits.push({ text: m[0] });
  }
  return hits;
}

/** 判据 4：zh/en 相对文件集合与 _meta.json 条目顺序一致。 */
export function localeParity({ zhFiles, enFiles, metas = [] }) {
  const problems = [];
  const onlyIn = (a, b, side) =>
    a.filter((f) => !b.includes(f)).forEach((f) => problems.push({ rel: f, detail: `${side} 独有文件` }));
  onlyIn(zhFiles, enFiles, "zh");
  onlyIn(enFiles, zhFiles, "en");
  for (const { rel, zh, en } of metas) {
    if (JSON.stringify(zh) !== JSON.stringify(en)) problems.push({ rel, detail: "_meta.json 条目顺序不一致" });
  }
  return problems;
}

/** 判据 5：声明了 appUrl 的页面必须命中 tools.json（没声明的跳过）。 */
export function appUrlTraceable({ files, tools }) {
  const known = new Set(tools.flatMap((t) => [t.appUrlZh, t.appUrlEn]));
  const problems = [];
  for (const f of files) {
    for (const [, url] of (f.text || "").matchAll(/^appUrl:\s*(\S+)/gm)) {
      if (!known.has(url.replace(/\/$/, ""))) problems.push({ rel: f.rel, detail: `appUrl 不在 tools.json 里: ${url}` });
    }
  }
  return problems;
}

/** 判据 6：「经典翻译 API」表首列名单 == providers 的 MT 集合（顺序不限）。 */
export function mtMembership({ tableText, data }) {
  const expected = data.providers.filter((p) => p.category === "machine-translation").map((p) => p.label);
  const rows = tableText
    .split("\n")
    .filter((l) => l.trim().startsWith("|"))
    .filter((l) => !/^\|[\s-:|]+\|$/.test(l.trim())); // 分隔行 | --- | --- |
  // 表格第一行是表头（zh「接口」/ en「Translation API」，措辞会变），按位置剔除而不是按文字匹配。
  const found = rows.slice(1).map((l) => l.split("|")[1]?.trim()).filter(Boolean);

  const problems = [];
  const missing = expected.filter((x) => !found.includes(x));
  const extra = found.filter((x) => !expected.includes(x));
  if (missing.length) problems.push({ detail: `MT 表缺少源码在用的接口: ${missing.join(", ")}` });
  if (extra.length) problems.push({ detail: `MT 表首列与源码 label 不符（多出或写法不一致）: ${extra.join(", ")}` });
  return problems;
}

/** 五条在文件维度上跑的判据（parity 由 CLI 单独组装，它需要两个 locale 的清单）。 */
export function gates({ data, files, mtTables, configText }) {
  const problems = [];
  const push = (gate, list) => problems.push(...list.map((p) => ({ gate, ...p })));
  const targetTotal = data.languages.items.filter((l) => l.value !== "auto").length;

  for (const { rel, locale, text } of files) {
    const frag = rel.match(/_gen\/(.+)\.mdx$/);
    if (frag) {
      const name = frag[1];
      push("fragment", fragmentIsFresh({ onDisk: text, rendered: renderFragment(name, data, locale) }).map((p) => ({ rel, ...p })));
      continue;
    }
    // changelog 记的是当时的真事实，历史条目里的数字不改写、也不受聚合判据约束。
    if (/\/changelog\.md$/.test(rel)) continue;
    const zh = aggregatePhrases(text, "zh").map((h) => ({ rel, detail: `硬编码聚合计数: ${h.text}` }));
    const en = aggregatePhrases(text, "en").map((h) => ({ rel, detail: `硬编码聚合计数: ${h.text}` }));
    push("aggregate", [...zh, ...en]);
    push("total", exactLanguageTotal(text, targetTotal).map((h) => ({ rel, detail: `精确语言总数写进了正文: ${h.text}` })));
  }

  for (const { rel, tableText } of mtTables) {
    push("mtMembership", mtMembership({ tableText, data }).map((p) => ({ rel, ...p })));
  }

  const cfg = [...aggregatePhrases(configText, "zh"), ...aggregatePhrases(configText, "en")];
  push("aggregate", cfg.map((h) => ({ rel: "rspress.config.ts", detail: `站点元数据硬编码计数: ${h.text}` })));

  push("appUrl", appUrlTraceable({ files, tools: data.tools }));
  return problems;
}
