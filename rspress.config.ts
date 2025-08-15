import * as path from 'node:path';
import sitemap from 'rspress-plugin-sitemap';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  icon: '/rspress-icon.png',
  logo: {
    light: '/light-logo.png',
    dark: '/dark-logo.png',
  },
  lang: 'zh',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title:
        'Tools By AI Docs - AI-Powered Tools for Translation, Text & JSON Processing',
      description:
        'Struggling with multilingual translation, text processing, or complex JSON edits? Tools By AI offers a suite of AI-powered tools for subtitle translation, i18n localization, and more, boosting your development and office productivity.',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title: 'Tools By AI 中文文档 - AI 驱动的翻译、文本与 JSON 处理工具',
      description:
        '还在为多语言翻译、文本处理或复杂的 JSON 编辑烦恼吗？Tools By AI 提供一站式 AI 工具集，助您轻松完成字幕翻译、i18n 本地化等任务，大幅提升开发与办公效率。',
    },
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/rockbenben',
      },
    ],
  },
  plugins: [
    sitemap({
      domain: 'https://docs.newzone.top',
      defaultChangeFreq: 'monthly',
      defaultPriority: '0.5',
    }),
  ],
});
