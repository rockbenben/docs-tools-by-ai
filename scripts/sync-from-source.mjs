/**
 * 把 web-tools-by-ai 的 registry 投影成文档站的派生数据，再渲染生成片段。
 *
 * 只在本地跑（CI 上没有源码仓，也永远不该有）。产物全部提交进仓，
 * CI 用 scripts/check-data.mjs 校验「产物自洽 + 正文没重新硬编码」。
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
const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

const arg = process.argv[2];
if (!arg) die("用法：yarn sync <web-tools-by-ai 路径>（两仓需同级 checkout）");

const srcRoot = path.resolve(ROOT, arg);
const REQUIRED = [
  "src/app/lib/translation/registry.ts",
  "src/app/lib/toolRegistry.ts",
  "src/app/lib/translation/languages-data.ts",
  "messages/zh.json",
  "messages/en.json",
];
for (const relPath of REQUIRED) {
  if (!fs.existsSync(path.join(srcRoot, relPath))) {
    die(`${srcRoot} 里没有 ${relPath} —— 确认传的是 web-tools-by-ai 仓库根目录`);
  }
}

// 借源码仓自己装好的 tsx 求值 registry.ts（它是 TS，且依赖源码仓的模块解析）。
// 直接 node 跑 tsx 的 cli.mjs，而不是 .bin/tsx.cmd：Windows 下 .cmd 需要 shell:true，
// 一旦路径含空格就要自己处理引号，容易出错。
const tsxCli = path.join(srcRoot, "node_modules/tsx/dist/cli.mjs");
if (!fs.existsSync(tsxCli)) die(`${srcRoot} 的 tsx 未安装 —— 先在源码仓跑 yarn install`);

const evalScript = path.join(ROOT, "scripts/lib/source-eval.mts");
const run = spawnSync(process.execPath, [tsxCli, evalScript], {
  cwd: srcRoot,
  encoding: "utf8",
  env: { ...process.env, SRC_ROOT: srcRoot.replace(/\\/g, "/") },
});
if (run.status !== 0) {
  die(`在源码仓求值失败（exit ${run.status}）：\n${(run.stderr || run.error?.message || "").slice(0, 800)}`);
}

let data;
try {
  data = JSON.parse(run.stdout);
} catch {
  die("求值输出不是合法 JSON，未写入任何文件");
}
if (!Array.isArray(data.providers) || !data.providers.length) die("providers 为空，未写入任何文件");
if (!Array.isArray(data.tools) || !data.tools.length) die("tools 为空，未写入任何文件");
if (!data.languages?.items?.length) die("languages.items 为空，未写入任何文件");

const visible = data.providers.filter(
  (p) => (p.category === "llm" || p.category === "aggregator") && !p.hidden,
);
const summary = {
  providers: data.providers.length,
  mt: data.providers.filter((p) => p.category === "machine-translation").length,
  llmVisible: visible.length,
  relayVisible: visible.filter((p) => typeof p.defaultUseRelay === "boolean").length,
  languages: data.languages.items.filter((l) => l.value !== "auto").length,
  tools: data.tools.length,
};

const DATA = path.join(ROOT, "docs/data");
fs.mkdirSync(DATA, { recursive: true });
const write = (p, text) => fs.writeFileSync(p, text, "utf8");
write(path.join(DATA, "providers.json"), JSON.stringify(data.providers, null, 2) + "\n");
write(path.join(DATA, "languages.json"), JSON.stringify(data.languages, null, 2) + "\n");
write(path.join(DATA, "tools.json"), JSON.stringify(data.tools, null, 2) + "\n");
if (!fs.existsSync(path.join(DATA, "coverage.json"))) {
  // 文档覆盖策略是编辑决定，不来自源码：有页 / 只外链 / 不提及。
  write(
    path.join(DATA, "coverage.json"),
    JSON.stringify({ dataBatch: "link", dataParserFlare: "hidden", dataParserImgPrompt: "hidden" }, null, 2) + "\n",
  );
}

for (const name of FRAGMENT_NAMES) {
  for (const locale of ["zh", "en"]) {
    const dir = path.join(ROOT, `docs/${locale}/guide/_gen`);
    fs.mkdirSync(dir, { recursive: true });
    write(path.join(dir, `${name}.mdx`), renderFragment(name, data, locale));
  }
}

console.log(`✓ ${Object.entries(summary).map(([k, v]) => `${k}=${v}`).join(" ")}`);
