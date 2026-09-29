/**
 * 文档站唯一的模板层。
 *
 * 只渲染【会随源码漂的目录事实】（接口名单与计数）；编辑判断（星级、推荐语、
 * 免费额度、具体模型名）留给人写，registry 里没有这类内容，生成等于编造。
 *
 * sync 写盘与 check-data 的重渲染比对都调用本模块 —— 出现第二套模板，
 * 闸门自己就成了新的漂移源。
 */

export const MARKER =
  "<!-- ⚠ 由 yarn sync 生成，请勿手改 —— 手改会在下次同步时被整份覆盖 -->\n";

export const FRAGMENT_NAMES = ["provider-list", "relay-list", "language-table"];

const isLlmFamily = (p) => p.category === "llm" || p.category === "aggregator";
const isVisible = (p) => isLlmFamily(p) && !p.hidden;
// 缺席(null) ≠ false：结构性没有中转路由的家，与「有路由但默认直连」是两回事。
const hasRelay = (p) => typeof p.defaultUseRelay === "boolean";

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

// registry 的 label 自带别名（如 "StepFun (阶跃星辰)"、"Doubao (Volcengine)"），
// 所以这里不再叠一层中文标注 —— 叠了会渲染出「（阶跃星辰）（阶跃星辰）」。
const named = (p) => p.label;
const roster = (items, sep) => items.map(named).join(sep);

function providerList(data, locale) {
  const visible = data.providers.filter(isVisible);
  const direct = visible.filter((p) => p.category === "llm");
  const aggregator = visible.filter((p) => p.category === "aggregator");
  // Custom 是「任何 OpenAI 兼容地址都填这一项」的兜底条目：计入聚合组家数，
  // 但在名单里单列到末尾，读者才不会把它当成某一家具体网关。
  const custom = aggregator.find((p) => p.key === "llm") ?? null;
  const aggregatorNames = aggregator.filter((p) => p.key !== "llm");
  const n = counts(data);

  if (locale === "zh") {
    const tail = custom ? `，以及 **${named(custom)}**` : "";
    return [
      `支持的 LLM 接口共 ${n.llmVisible} 个，分两组：`,
      "",
      `- **厂商直连（${direct.length} 家）**：${roster(direct, "、")}`,
      `- **聚合网关与自托管（${aggregator.length} 家）**：${roster(aggregatorNames, "、")}${tail}`,
    ].join("\n");
  }
  const tail = custom ? `, plus **${named(custom)}**` : "";
  return [
    `${n.llmVisible} LLM endpoints are supported, in two groups:`,
    "",
    `- **Direct vendors (${direct.length})**: ${roster(direct, ", ")}`,
    `- **Aggregators & self-hosted (${aggregator.length})**: ${roster(aggregatorNames, ", ")}${tail}`,
  ].join("\n");
}

function relayList(data, locale) {
  const visible = data.providers.filter(isVisible);
  const withRelay = visible.filter(hasRelay);
  const exceptions = visible.filter((p) => !hasRelay(p));
  const onByDefault = withRelay.filter((p) => p.defaultUseRelay === true);

  if (locale === "zh") {
    const lines = [
      `除 ${roster(exceptions, "、")} 之外的每个 LLM 接口（共 ${withRelay.length} 个：${roster(withRelay, "、")}）都在 API 设置里提供「**中转 API**」开关，开启后请求经由内置的 Cloudflare 转发（只转发请求本体与鉴权头）：`,
    ];
    if (onByDefault.length) {
      lines.push("", `${roster(onByDefault, "、")} 的上游不发 CORS 头或预检就失败，所以**默认开启**。其余家默认直连，遇到跨域问题时按提示自行打开。`);
    }
    return lines.join("\n");
  }
  const lines = [
    `Every LLM provider except ${roster(exceptions, ", ")} — ${withRelay.length} in total: ${roster(withRelay, ", ")} — offers an **API relay** toggle in settings. When enabled, requests are forwarded through the built-in Cloudflare worker (request body and auth headers only):`,
  ];
  if (onByDefault.length) {
    lines.push("", `${roster(onByDefault, ", ")} **default to ON** because upstream sends no CORS headers or fails preflight. The rest start on direct and can be switched on when you hit a CORS wall.`);
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
  let body;
  if (name === "provider-list") body = providerList(data, locale);
  else if (name === "relay-list") body = relayList(data, locale);
  else if (name === "language-table") body = languageTable(data, locale);
  else throw new Error(`未知片段: ${name}`);
  return `${MARKER}\n${body}\n`;
}
