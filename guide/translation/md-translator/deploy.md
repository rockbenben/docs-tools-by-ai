> For AI agents: the complete documentation index is available at /llms.txt, the full documentation bundle is available at /llms-full.txt.

# MD Translator 部署

## 系统要求

- [Node.js 20.9](https://nodejs.org/) 或更高版本
- 支持 macOS、Windows（包括 WSL）和 Linux

## 本地部署

确保你已安装 [Node.js](https://nodejs.org/)。

```shell
# 安装依赖
yarn

# 本地开发
yarn dev

# 构建并启动
yarn build && npx serve@latest out

# 单一语言部署
yarn build:lang en
yarn build:lang zh
yarn build:lang zh-hant
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `src/app/[locale]/page.tsx` 开始编辑页面，保存后页面会自动更新。

## Vercel 部署

点击下方按钮，一键将 MD Translator 部署到 Vercel 平台：

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frockbenben%2Fmd-translator)

通过 Vercel，你可以快速将项目托管，并且可以自动处理构建和部署，适合没有复杂服务器配置需求的用户。

## Cloudflare Pages 部署

点击下方按钮或链接 Fork 本项目，然后按照以下步骤在 Cloudflare Pages 上部署：

👉 [Fork 本项目](https://github.com/rockbenben/md-translator/fork)

部署步骤：

1. 登录 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 点击 **"Create a project"**
3. 绑定你刚刚 Fork 的 GitHub 仓库
4. 配置构建和部署参数：
   - **构建命令**：`npm run build`
   - **构建输出目录**：`out`
   - **环境变量**：添加变量 `NODE_VERSION`，值设为 `22.14.0`
5. 点击部署按钮，开始构建！

🎉 完成后即可访问你的 Markdown 翻译工具！

## Docker 部署

如果你更倾向于在容器环境中运行应用程序，可以使用以下方法通过 Docker 容器运行 MD Translator：

```bash
# 从 ghcr.io 拉取并运行
docker run -d -p 3000:3000 --name md-translator ghcr.io/rockbenben/md-translator:latest

# 或者从 Docker Hub 拉取并运行
docker run -d -p 3000:3000 --name md-translator rockben/md-translator:latest
```

运行后，访问 [http://localhost:3000](http://localhost:3000) 即可使用。

也可以通过 `docker-compose.yml` 来部署：

```yaml
services:
  md-translator:
    image: ghcr.io/rockbenben/md-translator:latest
    container_name: md-translator
    ports:
      - '3000:3000'
    restart: unless-stopped
```

执行 `docker-compose up -d` 命令即可启动服务。
