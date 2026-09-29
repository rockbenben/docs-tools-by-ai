> For AI agents: the complete documentation index is available at /en/llms.txt, the full documentation bundle is available at /en/llms-full.txt.

# MD Translator Deployment

## System Requirements

- [Node.js 20.9](https://nodejs.org/) or later
- Supports macOS, Windows (including WSL), and Linux

## Local Deployment

Ensure you have [Node.js](https://nodejs.org/) installed.

```shell
# Install dependencies
yarn

# Local Development
yarn dev

# Build and Start
yarn build && npx serve@latest out

# Deploy for a Single Language
yarn build:lang en
yarn build:lang zh
yarn build:lang zh-hant
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

You can start editing the page by modifying `src/app/[locale]/page.tsx`. The page will auto-update as you edit the file.

## Vercel Deployment

Click the button below to deploy MD Translator to Vercel with one click:

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frockbenben%2Fmd-translator)

With Vercel, you can quickly host the project, and it will automatically handle the build and deployment process — ideal for users who don't have complex server configuration needs.

## Cloudflare Pages Deployment

Click the button or link below to fork this project, then follow the steps to deploy it on Cloudflare Pages:

👉 [Fork this project](https://github.com/rockbenben/md-translator/fork)

Deployment steps:

1. Log in to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click **"Create a project"**
3. Connect the GitHub repository you just forked
4. Configure the build and deployment settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Environment variable**: Add `NODE_VERSION` with the value `22.14.0`
5. Click the deploy button to start building!

🎉 Once completed, you can access your MD Translator page!

## Docker Deployment

If you prefer to run the application in a containerized environment, you can use the following methods to run MD Translator via Docker:

```bash
# Pull and run from ghcr.io
docker run -d -p 3000:3000 --name md-translator ghcr.io/rockbenben/md-translator:latest

# Or pull and run from Docker Hub
docker run -d -p 3000:3000 --name md-translator rockben/md-translator:latest
```

Once running, you can access it at [http://localhost:3000](http://localhost:3000).

You can also deploy using a `docker-compose.yml` file:

```yaml
services:
  md-translator:
    image: ghcr.io/rockbenben/md-translator:latest
    container_name: md-translator
    ports:
      - '3000:3000'
    restart: unless-stopped
```

Run the command `docker-compose up -d` to start the service.
