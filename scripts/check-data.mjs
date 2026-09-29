/**
 * 防漂移闸门（CI 用，不需要源码仓）：六条判据，只读 docs/data/*.json 与 docs/**。
 *
 * 用法：node scripts/check-data.mjs   （yarn check:data）
 * 有问题时退出码为 1，可直接串进 CI。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gates, localeParity } from "./lib/gates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "docs/data");
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

for (const f of ["providers.json", "languages.json", "tools.json"]) {
  if (!fs.existsSync(path.join(DATA, f))) {
    console.error(`✗ 缺 docs/data/${f} —— 先跑 yarn sync ../web-tools-by-ai 生成派生数据`);
    process.exit(1);
  }
}

const data = {
  providers: read(path.join(DATA, "providers.json")),
  languages: read(path.join(DATA, "languages.json")),
  tools: read(path.join(DATA, "tools.json")),
};

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "public") walk(p, out);
    } else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
};

const relFromRoot = (p) => path.relative(ROOT, p).replace(/\\/g, "/");
const files = [];
const byLocale = { zh: [], en: [] };
for (const locale of ["zh", "en"]) {
  const localeRoot = path.join(ROOT, "docs", locale);
  for (const p of walk(localeRoot)) {
    const text = fs.readFileSync(p, "utf8");
    files.push({ rel: relFromRoot(p), abs: p, locale, text });
    byLocale[locale].push(path.relative(localeRoot, p).replace(/\\/g, "/"));
  }
}

// 侧栏顺序对照：两边都存在 _meta.json 的目录
const metas = [];
const metaDirs = (loc) =>
  fs
    .readdirSync(path.join(ROOT, `docs/${loc}/guide`), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
const names = metaDirs("zh").filter((name) => metaDirs("en").includes(name));
const entryNames = (arr) => arr.map((x) => (typeof x === "string" ? x : x.name));
for (const name of names) {
  const zp = path.join(ROOT, `docs/zh/guide/${name}/_meta.json`);
  const ep = path.join(ROOT, `docs/en/guide/${name}/_meta.json`);
  if (fs.existsSync(zp) && fs.existsSync(ep)) {
    metas.push({ rel: `${name}/_meta.json`, zh: entryNames(read(zp)), en: entryNames(read(ep)) });
  }
}

// 经典 MT 表 = 「经典翻译 API」小节里的第一个表格块
const mtTables = [];
for (const f of files.filter((f) => /translation\/api\.mdx$/.test(f.rel))) {
  const start = f.text.search(/^##[^\n]*(经典翻译 API|Classic translation API)/im);
  if (start === -1) {
    console.error(`✗ ${f.rel} 找不到「经典翻译 API」小节标题 —— 判据 6 无从下手`);
    process.exit(1);
  }
  const section = f.text.slice(start).split("\n## ")[0];
  const tableText = section
    .split("\n")
    .filter((l) => l.trim().startsWith("|"))
    .join("\n");
  mtTables.push({ rel: f.rel, tableText });
}

const problems = [
  ...gates({ data, files, mtTables, configText: fs.readFileSync(path.join(ROOT, "rspress.config.ts"), "utf8") }),
  ...localeParity({ zhFiles: byLocale.zh, enFiles: byLocale.en, metas }).map((p) => ({ gate: "parity", ...p })),
];

if (!problems.length) {
  console.log(
    `✓ 防漂移判据全过（${files.length} 个文档文件；providers=${data.providers.length} tools=${data.tools.length}）`,
  );
  process.exit(0);
}

console.error(`✗ 防漂移检查发现 ${problems.length} 处问题：\n`);
for (const p of problems) console.error(`  [${p.gate}] ${p.rel ?? ""}  ${p.detail}`);
console.error("\n处置：");
console.error("  · [fragment] 红了说明 _gen/ 被手改过 —— 跑 yarn sync 覆盖回去，改内容请改 scripts/lib/render.mjs");
console.error("  · [aggregate] 红了说明正文重新写死了接口计数 —— 删掉计数或用生成片段");
console.error("  · [mtMembership] 红了按 docs/data/providers.json 校正接口名单（星级与场景描述仍归人写）");
process.exit(1);
