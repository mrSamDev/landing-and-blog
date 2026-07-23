---
title: pi-deploy-artifacts
description: Deploy HTML pages to live URLs on Vercel, Cloudflare Pages, Netlify, or GitHub Pages. Like Claude Code artifacts for pi.
publishDate: 'Jul 19 2026'
isFeatured: true
tags:
  - DevTool
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: pi-deploy-artifacts project cover
---

![npm version](https://img.shields.io/npm/v/@mrsamdev/pi-deploy-artifacts?logo=npm&label=npm)
![TypeScript](https://img.shields.io/badge/typescript-ready-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub](https://img.shields.io/badge/github-pi--deploy--artifacts-181717?logo=github)

**Project Overview**

`pi-deploy-artifacts` is a pi extension that deploys HTML pages to live URLs on Vercel, Cloudflare Pages, Netlify, or GitHub Pages. Ask pi to build a dashboard, annotated diff, comparison layout, or interactive page, and it deploys to a real URL you can share.

## Install

```sh
pi install npm:@mrsamdev/pi-deploy-artifacts
```

To try it for a single run without adding it to your Pi settings:

```sh
pi -e npm:@mrsamdev/pi-deploy-artifacts
```

## Prerequisites

Install at least one deployment CLI and authenticate:

```sh
# Vercel
npm i -g vercel && vercel login

# Cloudflare Pages
npm i -g wrangler && wrangler login

# Netlify
npm i -g netlify-cli && netlify login

# GitHub Pages (no CLI install needed, uses npx)
# Requires a git repo with a GitHub remote
```

## Usage

Ask pi to build something visual:

> "Build a dashboard of our open PRs and publish it as an artifact"

> "Make an artifact that walks through this diff with annotations"

> "Create a comparison page of these three layout options"

Pi will build a self-contained HTML page, call `publish_artifact` to deploy it, and return a live URL. Call with the same title to update an existing artifact in place.

## How It Works

All artifacts on the same platform share one project. Each gets its own path. HTML files are stored in `.pi/artifacts/hub/<platform>/<slug>/index.html`. The platform CLI deploys the entire hub directory. Artifacts are tracked by title in `.pi/artifacts/state.json`.

### URL Structure

| Platform | Example URL |
|----------|-------------|
| Vercel | `https://my-project.vercel.app/my-slug/` |
| Cloudflare Pages | `https://my-project.pages.dev/my-slug/` |
| Netlify | `https://my-site.netlify.app/my-slug/` |
| GitHub Pages | `https://user.github.io/repo/my-slug/` |

## Package Structure

```
pi-deploy-artifacts/
├── package.json              # pi manifest
├── vitest.config.ts
├── extensions/
│   ├── index.ts              # Extension entry point (publish_artifact tool)
│   ├── types.ts              # Shared types
│   ├── helpers.ts            # Pure functions (slugify, remoteToPagesUrl, which, execAsync)
│   ├── state.ts              # State load/save, path helpers
│   └── deployers/
│       ├── index.ts          # Deployer registry
│       ├── types.ts          # Deployer interface
│       ├── vercel.ts
│       ├── cloudflare.ts
│       ├── netlify.ts
│       └── github.ts
├── skills/
│   └── artifacts/
│       └── SKILL.md          # Teaches LLM when to use artifacts
├── tests/
│   ├── helpers.test.ts
│   ├── state.test.ts
│   ├── deployers.test.ts
│   └── deploy.integration.test.ts
└── README.md
```

## Links

- NPM: https://www.npmjs.com/package/@mrsamdev/pi-deploy-artifacts
- GitHub: https://github.com/mrSamDev/pi-deploy-artifacts
