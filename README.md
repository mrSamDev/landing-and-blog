# Sijo Sam — Personal Portfolio & Technical Blog

This site is my corner of the internet. It showcases my work, hosts technical writing, and shares AI tips. Built with Astro and Tailwind CSS v4.

## Quick Start

Install dependencies and fire up the dev server:

```bash
pnpm install
pnpm run dev
```

The site runs at `localhost:4321`. Make changes and watch them appear instantly.

## What You Can Do

| Command                    | What it does                          |
| :------------------------- | :------------------------------------ |
| `pnpm install`             | Grabs all dependencies                |
| `pnpm run dev`             | Starts dev server at `localhost:4321` |
| `pnpm run build`           | Builds production site to `./dist/`   |
| `pnpm run preview`         | Previews the build before you deploy  |
| `pnpm run astro ...`       | Runs Astro CLI commands               |
| `pnpm run astro -- --help` | Shows Astro CLI help                  |

## How It's Organized

```
├── public/
├── src/
│   ├── components/       # Reusable UI bits (Hero, Nav, Cards)
│   ├── content/          # Blog posts, projects, guides, AI tips
│   ├── data/             # Site config and constants
│   ├── icons/            # SVG icons
│   ├── layouts/          # BaseLayout, content layouts
│   ├── pages/            # Routes (index, blog, projects, resume)
│   ├── styles/           # Global CSS and Tailwind setup
│   └── utils/            # Helper functions
├── astro.config.mjs
├── package.json
├── README.md
├── tailwind.config.cjs
└── tsconfig.json
```

Astro turns files in `src/pages/` into routes. `index.astro` becomes `/`, `blog.astro` becomes `/blog`, and so on.

Content lives in `src/content/` as collections. Blog posts, projects, guides, and AI tips each have their own folder with schema-validated frontmatter. This keeps your data honest and your TypeScript happy.

Static assets like images go in `public/`. They get served as-is.

## What's Inside

Dark and light modes switch with a toggle. Your choice sticks via localStorage. The hero section introduces you with a Malayalam quote and its English translation. Projects and blog posts display in compact two-column grids. Featured items rise to the top.

Pagination keeps long lists manageable. Tags organize posts. A command palette (⌘K) lets visitors jump anywhere fast. The resume page stands alone without the standard header and footer.

Tailwind CSS v4 handles styling with a custom design token system. View transitions add subtle polish between pages. RSS feeds let readers follow your writing. Sitemaps help search engines find everything.

## Design System

Read DESIGN.md for the full visual language. Colors, typography, spacing, components, and dark mode tokens live there. The design uses Baloo 2 for display and Nunito for body text. Warm teal ink (#004747) anchors the light theme. Charcoal grays handle dark mode.

## Tech Stack

**Core**

Astro 7 powers the static site generation. Tailwind CSS v4 handles styling through Vite. TypeScript keeps everything type-safe. MDX lets you embed React components in markdown.

**Search & Navigation**

Fuse.js drives the command palette (⌘K). Custom search indexing builds a JSON index at build time. The search algorithm scores results by title, keywords, description, and pinned paths. Type-ahead filtering kicks in after you type three characters.

**Content & Diagrams**

Marked parses markdown content. Mermaid renders flowcharts and diagrams with auto theme switching. Content collections validate frontmatter with Zod schemas.

**Performance & Analytics**

Vercel adapter handles deployment and edge functions. Partytown moves third-party scripts off the main thread. PostHog tracks analytics with privacy controls. Vercel Speed Insights measures real user performance.

**UI Components**

Custom component library built from scratch. Hero, Nav, Footer, Cards, Buttons, Theme Toggle, Command Palette, Content Menu, Tag chips, Accordions for AI tips. All accessible with keyboard navigation and ARIA attributes.

## Deploy

Build the site and drop the `dist/` folder on any static host. Vercel, Netlify, and Cloudflare Pages work out of the box.

```bash
pnpm run build
```

That's it. No complex deployment dance required.
