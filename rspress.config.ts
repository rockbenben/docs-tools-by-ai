import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspress/core";
import { pluginLlms } from "@rspress/plugin-llms";
import { pluginSitemap } from "@rspress/plugin-sitemap";
import { pluginGeo } from "./geo/plugin-geo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://docs.newzone.top";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  icon: "/rspress-icon.png",
  logo: {
    light: "/light-logo.png",
    dark: "/dark-logo.png",
  },
  lang: "zh",
  // Top-level title is the global fallback (rspress internals, OG defaults).
  // Per-locale `locales[].title` overrides for browser tab; `onTitleGenerate`
  // below overrides for llms.txt. Lead with popular tools (Subtitle / Markdown
  // / JSON translation) instead of brand-first so the title carries searchable
  // keywords even when something falls back to this global value.
  title: "Subtitle Translator, Markdown Translator & JSON i18n Tools — Tools By AI Docs",
  head: [
    '<script defer src="https://s.newzone.top/tracker.js" data-website-id="fde645a1-fe64-4434-9edb-6923dbcd3614"></script>',
    ["meta", { name: "author", content: "rockbenben" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "Tools By AI, AI tools, subtitle translation, i18n translation, JSON translation, JSON editor, text splitter, markdown translation, 字幕翻译, i18n 本地化, JSON 编辑, AI 工具",
      },
    ],
    ["meta", { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" }],
    ["meta", { name: "googlebot", content: "index, follow" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Tools By AI Docs" }],
    ["meta", { property: "og:image", content: `${SITE_URL}/rspress-icon.png` }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: `${SITE_URL}/rspress-icon.png` }],
  ],
  locales: [
    {
      lang: "en",
      label: "English",
      title: "Subtitle Translator · Markdown Translator · JSON i18n Tools — Tools By AI Docs",
      description:
        "Free subtitle translator (SRT / ASS / VTT), Markdown translator preserving code blocks & LaTeX, and JSON i18n localization tools. 8 translation APIs + 21 LLMs across 120+ languages. Full usage guide and API setup.",
    },
    {
      lang: "zh",
      label: "简体中文",
      title: "字幕翻译器 · Markdown 翻译 · JSON i18n 翻译工具 - Tools By AI 中文文档",
      description: "免费的字幕翻译（SRT / ASS / VTT）、保留代码块与 LaTeX 的 Markdown 翻译、JSON i18n 本地化工具。8 种翻译 API + 21 种 AI 大模型，覆盖 120+ 种语言。完整使用文档与 API 配置指南。",
    },
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/rockbenben",
      },
    ],
  },
  plugins: [
    pluginLlms([
      {
        llmsTxt: {
          name: "llms.txt",
          // Match the zh locale.title — popular-tool-first ordering so AI engines
          // see the search-relevant keywords as the very first signal.
          onTitleGenerate: () => "字幕翻译器 · Markdown 翻译 · JSON i18n 翻译工具 - Tools By AI 中文文档",
        },
        llmsFullTxt: false,
        mdFiles: false,
        include: ({ page }) => page.lang === "zh",
      },
      {
        llmsTxt: {
          name: "en/llms.txt",
          onTitleGenerate: () => "Subtitle Translator · Markdown Translator · JSON i18n Tools — Tools By AI Docs",
        },
        llmsFullTxt: false,
        mdFiles: false,
        include: ({ page }) => page.lang === "en",
      },
    ]),
    pluginSitemap({
      siteUrl: SITE_URL,
    }),
    pluginGeo({
      siteUrl: SITE_URL,
      orgName: "Tools By AI",
      orgLogo: `${SITE_URL}/rspress-icon.png`,
      orgSameAs: ["https://github.com/rockbenben"],
      orgDescription: "Open-source AI-assisted developer tools by rockbenben — covering subtitle translation, Markdown translation, JSON i18n localization, and other browser-local utilities.",
      siteNames: {
        en: "Tools By AI Docs",
        zh: "Tools By AI 中文文档",
      },
      siteDescription: "Documentation for Tools By AI — subtitle translator (SRT / ASS / VTT), Markdown translator preserving code blocks & LaTeX, JSON i18n localization, and more. 8 translation APIs + 21 LLMs across 120+ languages.",
      appUrl: "https://tools.newzone.top",
      appDescription: "Free, browser-local AI tool suite: subtitle translator, Markdown translator, JSON i18n localization, regex toolbox, Chinese conversion, and more. Works with 8 translation APIs and 21 LLMs across 120+ languages.",
      appScreenshot: "https://img.newzone.top/subtile-translator.gif?imageMogr2/format/webp",
      appFeatureList: [
        "Subtitle translation",
        "Markdown translation",
        "JSON i18n translation",
        "JSON value extractor / editor",
        "Text splitter",
        "Regex matcher",
        "Chinese conversion",
      ],
    }),
  ],
});
