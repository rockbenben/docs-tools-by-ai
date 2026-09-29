/**
 * 唯一知道源码仓结构的地方 —— 由【源码仓自己的 tsx】执行，stdout 输出一个 JSON。
 *
 * 只 import 求值，不解析源码文本，与上游 scripts/sync-provider-catalog.ts 同一原则
 * （正则解析对嵌套结构不可靠）。
 *
 * 实测事实（2026-09-30，web-tools v3.2.0）：
 *  · models 一律在 provider 顶层；没有 models 的是 6 家经典/免费 MT + Custom(llm)
 *  · defaults 是配置默认值对象，【不含】models
 *  · 中转字段真名 defaultUseRelay —— useRelay 是用户配置项的名字，provider 上没有；
 *    缺席(claude/gemini/yandex/nvidia/azureopenai/llm) 结构性没有中转路由，≠ false
 *  · messages/*.json 用 fs 读：Node ESM 直接 import JSON 会报 ERR_IMPORT_ATTRIBUTE_MISSING
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ROOT = process.env.SRC_ROOT;
if (!ROOT) throw new Error("SRC_ROOT 未设置（应由 sync-from-source.mjs 注入）");

const s = (p: string) => pathToFileURL(`${ROOT}/${p}`).href;

const { PROVIDERS } = await import(s("src/app/lib/translation/registry.ts"));
const { TOOL_REGISTRY } = await import(s("src/app/lib/toolRegistry.ts"));
const {
  languages,
  LANGUAGE_GROUPS,
  LANGUAGE_GROUP_BY_CODE,
} = await import(s("src/app/lib/translation/languages-data.ts"));

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
  // 三态：true / false / null（null = 结构性没有中转路由）
  defaultUseRelay: typeof p.defaultUseRelay === "boolean" ? p.defaultUseRelay : null,
  models: Array.isArray(p.models)
    ? p.models.map((m: any) => ({
        label: m.label ?? m.value,
        value: m.value,
        thinking: m.thinking === true ? true : null,
      }))
    : null,
  endpoints: Array.isArray(p.endpoints)
    ? p.endpoints.map((e: any) => ({ label: e.label ?? null, url: e.url ?? null, docs: e.docs ?? null }))
    : null,
}));

const groups = LANGUAGE_GROUPS.map((g: any) => ({
  key: g.key,
  label: { zh: mzh.common[g.labelKey], en: men.common[g.labelKey] },
  codes: [...g.codes],
}));

const items = (languages as any[]).map((l) => ({
  value: l.value,
  name: l.name ?? null,
  nativelabel: l.nativelabel ?? null,
  zh: mzh.languages?.[l.value] ?? null,
  group: LANGUAGE_GROUP_BY_CODE[l.value] ?? null,
}));

const APP = "https://tools.newzone.top";
const tools = Object.entries(TOOL_REGISTRY).map(([key, t]: [string, any]) => ({
  key,
  path: t.path,
  group: t.group,
  nameZh: mzh.tools?.[key]?.title ?? null,
  nameEn: men.tools?.[key]?.title ?? null,
  appUrlZh: `${APP}/zh/${t.path}`,
  appUrlEn: `${APP}/en/${t.path}`,
}));

process.stdout.write(JSON.stringify({ providers, languages: { groups, items }, tools }));
