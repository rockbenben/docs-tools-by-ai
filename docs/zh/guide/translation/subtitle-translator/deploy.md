# 项目部署

System Requirements:

- [Node.js 18.18](https://nodejs.org/) or later.
- macOS, Windows (including WSL), and Linux are supported.

## 本地部署

确保你已安装 [Node.js](https://nodejs.org/)。

```shell
# Installation（安装依赖）
yarn

# Local Development (本地开发)
yarn dev

# build and start (构建并启动)
yarn build && yarn start

# Deploy for a single language（单一语言部署）
yarn build:lang en
yarn build:lang zh
yarn build:lang zh-hant
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/[locale]/page.tsx`. The page auto-updates as you edit the file.

## Vercel 部署

点击下方按钮，一键将 Subtitle Translator 部署到 Vercel 平台：

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frockbenben%2Fsubtitle-translator%2Ftree%2Fmain)

通过 Vercel，你可以快速将项目托管，并且可以自动处理构建和部署，适合没有复杂服务器配置需求的用户。

## Cloudflare Pages 部署

点击下方按钮或链接，Fork 本项目后，按说明在 Cloudflare Pages 上部署：

👉 [Fork 本项目](https://github.com/rockbenben/subtitle-translator/fork)

部署步骤：

1. 登录 [Cloudflare](https://pages.cloudflare.com/)
2. 选择 **"Create a project"**
3. 绑定你刚刚 Fork 的仓库
4. 配置构建命令：
   - Build command: `npm run build`
   - Output directory: `out` 或根据项目不同填写
5. 点击部署！

🎉 完成后即可访问你的字幕翻译器页面！
