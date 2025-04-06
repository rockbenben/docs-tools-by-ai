# Project Deployment

**System Requirements:**

- [Node.js 18.18](https://nodejs.org/) or later.
- Supported on macOS, Windows (including WSL), and Linux.

## Local Deployment

Ensure you have installed [Node.js](https://nodejs.org/).

```shell
# Installation (Install dependencies)
yarn

# Local Development
yarn dev

# Build and Start
yarn build && yarn start

# Deploy for a Single Language
yarn build:lang en
yarn build:lang zh
yarn build:lang zh-hant
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the result.

You can start editing the page by modifying `src/app/[locale]/page.tsx`. The page will auto-update as you edit the file.

## Vercel Deployment

Click the button below to deploy Subtitle Translator to the Vercel platform with one click:

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frockbenben%2Fsubtitle-translator%2Ftree%2Fmain)

With Vercel, you can quickly host your project, and it automatically handles building and deployment—ideal for users without complex server configuration needs.

## Cloudflare Pages Deployment

Click the button or link below to fork this project and deploy it on Cloudflare Pages following the instructions:

👉 [Fork this project](https://github.com/rockbenben/subtitle-translator/fork)

**Deployment Steps:**

1. Log in to [Cloudflare](https://pages.cloudflare.com/)
2. Select **"Create a project"**
3. Connect the repository you just forked.
4. Configure the build command:
   - Build command: `npm run build`
   - Output directory: `out` (or the directory specified by your project)
5. Click deploy!

🎉 Once deployment is complete, you can access your Subtitle Translator page!
