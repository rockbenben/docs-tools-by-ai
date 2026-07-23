/**
 * 文档链接体检：补上 rspress 原生 checkDeadLinks 的两个盲区。
 *
 * rspress 的 checkDeadLinks 默认开启，且坏链会直接让 build 失败 —— 但它只遍历
 * 正文的 markdown AST，因此漏掉：
 *   1. frontmatter（faq / howto / description）里的 markdown 链接。这些链接会被
 *      geo 插件剥成纯文本送进 JSON-LD，不渲染给用户，所以坏了也无人察觉 ——
 *      2026-07 就是这样攒下 6 条指向 ../../ 的死链。
 *   2. 图片路径（正文的 ![](...) 与 frontmatter 的 image:），rspress 不校验。
 *
 * 用法：node scripts/check-links.mjs   （yarn check:links）
 * 有问题时退出码为 1，可直接串进 CI。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const PUBLIC = path.join(DOCS, "public");

/** 递归收集 .md / .mdx */
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "public") walk(p, out);
    } else if (/\.mdx?$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
};

/** 目标文件是否存在：允许省略 .md/.mdx，允许目录（走其 index） */
const resolves = (abs) =>
  fs.existsSync(abs) ||
  fs.existsSync(`${abs}.mdx`) ||
  fs.existsSync(`${abs}.md`) ||
  (fs.existsSync(abs) && fs.statSync(abs).isDirectory());

const MD_LINK = /\[[^\]]*\]\(([^)\s]+)/g;

/** 去掉围栏代码块与行内代码：文档里的模板示例（如 `- [{1}]({2})`）长得像链接但不是 */
const stripCode = (text) => text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");

const problems = [];

for (const file of walk(DOCS)) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const dir = path.dirname(file);

  // frontmatter 与正文分开，报告里注明来源，便于判断严重性
  let fm = "";
  let body = src;
  if (src.startsWith("---")) {
    const end = src.indexOf("\n---", 3);
    if (end !== -1) {
      fm = src.slice(0, end);
      body = src.slice(end);
    }
  }

  const check = (zone, text) => {
    for (const [, url] of stripCode(text).matchAll(MD_LINK)) {
      if (/^(https?:|mailto:|#)/.test(url)) continue;
      const clean = url.split("#")[0].split("?")[0];
      if (!clean) continue;
      const abs = clean.startsWith("/")
        ? path.join(PUBLIC, clean) // 站内绝对路径 = public 下的静态资源
        : path.resolve(dir, clean);
      if (!resolves(abs)) problems.push({ rel, zone, url });
    }
  };

  check("frontmatter", fm);
  check("body", body);

  // frontmatter 的 image: 字段（绝对 URL 形式，指向 docs/public）
  for (const [, img] of fm.matchAll(/^image:\s*https:\/\/docs\.newzone\.top(\/\S+)/gm)) {
    if (!fs.existsSync(path.join(PUBLIC, img))) problems.push({ rel, zone: "frontmatter image:", url: img });
  }
}

if (problems.length === 0) {
  console.log("✓ 所有文档链接与图片路径均可解析");
  process.exit(0);
}

console.error(`✗ 发现 ${problems.length} 处无法解析的引用：\n`);
for (const p of problems) console.error(`  ${p.rel}  [${p.zone}]  ${p.url}`);
console.error("\n提示：frontmatter 里的链接不会渲染给用户（geo 插件会剥成纯文本），");
console.error("但仍应保持正确 —— 它们是 FAQ 正文的同源内容，错了会被复制进正文。");
process.exit(1);
