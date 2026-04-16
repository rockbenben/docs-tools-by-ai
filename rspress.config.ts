import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginLlms } from "@rspress/plugin-llms";
import { pluginSitemap } from "@rspress/plugin-sitemap";
import { pluginGeo } from "./geo/plugin-geo";

const SITE_URL = "https://docs.newzone.top";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  icon: "/rspress-icon.png",
  logo: {
    light: "/light-logo.png",
    dark: "/dark-logo.png",
  },
  lang: "zh",
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
      title: "Tools By AI Docs - AI-Powered Tools for Translation, Text & JSON Processing",
      description:
        "Struggling with multilingual translation, text processing, or complex JSON edits? Tools By AI offers a suite of AI-powered tools for subtitle translation, i18n localization, and more, boosting your development and office productivity.",
    },
    {
      lang: "zh",
      label: "简体中文",
      title: "Tools By AI 中文文档 - AI 驱动的翻译、文本与 JSON 处理工具",
      description: "还在为多语言翻译、文本处理或复杂的 JSON 编辑烦恼吗？Tools By AI 提供一站式 AI 工具集，助您轻松完成字幕翻译、i18n 本地化等任务，大幅提升开发与办公效率。",
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
        },
        llmsFullTxt: false,
        mdFiles: false,
        include: ({ page }) => page.lang === "zh",
      },
      {
        llmsTxt: {
          name: "en/llms.txt",
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
      siteNames: {
        en: "Tools By AI Docs",
        zh: "Tools By AI 中文文档",
      },
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
