import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import sitemap from 'rspress-plugin-sitemap';

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
        'Tools By AI Docs - Multilingual Translation, Text Processing & JSON Editing | Essential for Efficient Development & Office Work',
      description:
        'Tools By AI Docs, featuring subtitle translation, i18n JSON translation, Markdown text translation, text splitting, Chinese conversion, regex matching, JSON value extraction, node editing, key replacement, data match & update, bookmark parsing, and data conversion. Perfect for developers and creators handling multilingual translation and text processing tasks.',
    },
    {
      lang: 'zh',
      label: '简体中文',
      title:
        'Tools By AI Docs - 多语言翻译、文本处理与 JSON 编辑 | 高效开发与办公必备',
      description:
        'Tools By AI Docs，包括字幕翻译、i18n JSON 翻译、Markdown 文本翻译、文本分割、简繁转换、正则匹配、JSON 值提取、节点编辑、键值替换、数据匹配更新、书签与数据解析等，助力开发者与创作者高效解决多语言翻译和文本处理需求。',
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
