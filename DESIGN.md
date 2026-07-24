---
name: SIJO-SAM
description: Compact, friendly personal portfolio and technical blog for Sijo Sam. Warm teal ink, pastel accent chips, rounded corners, Baloo 2 display + Nunito body. Built with Astro + Tailwind CSS v4.
colors:
  ink: '#004747'
  panel: '#f0f5f5'
  panel-2: '#ffffff'
  surface: '#e8eeee'
  bg: '#f5f8f8'
  yellow: '#f9d84a'
  pink: '#c92d68'
  pink-cta: '#c92d68'
  pink-cta-deep: '#a8205a'
  pink-cta-shadow: '#8a1f4f'
  pink-error: '#972959'
  melon: '#ff9f6e'
  mint: '#92efc5'
  bluey: '#3f5bff'
  link: '#a8205a'
colors-dark:
  ink: '#ffffff'
  panel: '#26262c'
  panel-2: '#1d1d20'
  surface: '#1e1e23'
  bg: '#1a1a1f'
  yellow: '#f9d84a'
  pink: '#c92d68'
  pink-cta: '#c92d68'
  pink-cta-deep: '#a8205a'
  pink-cta-shadow: '#8a1f4f'
  pink-error: '#ff8caa'
  melon: '#ff9f6e'
  mint: '#2d7d6a'
  bluey: '#3f5bff'
  link: '#ff5d97'
typography:
  display-hero:
    fontFamily: Baloo 2
    fontSize: 2.25rem
    fontWeight: 800
    lineHeight: '1.1'
  display-page-title:
    fontFamily: Baloo 2
    fontSize: 1.5rem
    fontWeight: 800
    lineHeight: '1.15'
  display-section:
    fontFamily: Baloo 2
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: '1.2'
  display-card:
    fontFamily: Baloo 2
    fontSize: 1.125rem
    fontWeight: 700
    lineHeight: '1.2'
  display-logo:
    fontFamily: Baloo 2
    fontSize: 1.125rem
    fontWeight: 800
    lineHeight: '1'
  content-title:
    fontFamily: Baloo 2
    fontSize: 1.875rem
    fontWeight: 500
    lineHeight: '1.3'
  body-md:
    fontFamily: Nunito
    fontSize: 0.9rem
    fontWeight: 500
    lineHeight: '1.5'
  body-base:
    fontFamily: Nunito
    fontSize: 0.85rem
    fontWeight: 500
    lineHeight: '1.5'
  body-sm:
    fontFamily: Nunito
    fontSize: 0.78rem
    fontWeight: 600
    lineHeight: '1.4'
  label-caps:
    fontFamily: Nunito
    fontSize: 0.7rem
    fontWeight: 700
    letterSpacing: 0.06em
  label-ui:
    fontFamily: Nunito
    fontSize: 0.82rem
    fontWeight: 800
  badge:
    fontFamily: Nunito
    fontSize: 0.68rem
    fontWeight: 800
    letterSpacing: 0.04em
rounded:
  xs: 6px
  sm: 8px
  md: 12px
  input: 10px
  lg: 14px
  xl: 16px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
components:
  nav-bar:
    backgroundColor: '{colors.panel}'
    borderColor: '{colors.ink}'
    borderWidth: 2px
    rounded: '{rounded.xl}'
    padding: 12px 16px
    shadow: '0 2px 8px rgb(var(--shadow-rgb) / 0.08)'
  mobile-drawer:
    backgroundColor: '{colors.panel}'
    borderColor: '{colors.ink}'
    borderWidth: 2px
    width: 'min(82vw, 18rem)'
  announcement-banner:
    backgroundColor: '{colors.bg}'
    borderColor: '{colors.ink}'
    borderWidth: 2px
  button:
    backgroundColor: '{colors.panel-2}'
    textColor: '{colors.ink}'
    borderColor: '{colors.ink}'
    borderWidth: 2px
    rounded: '{rounded.pill}'
    padding: 8px 14px
  icon-button:
    backgroundColor: '{colors.bg}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 8px
  theme-toggle:
    backgroundColor: '{colors.panel-2}'
    textColor: '{colors.ink}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 0
  search-button:
    backgroundColor: '{colors.panel-2}'
    textColor: '{colors.ink}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 6px 12px
  card:
    backgroundColor: '{colors.panel-2}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.lg}'
    padding: 12px
    shadow: '0 1px 3px rgb(var(--shadow-rgb) / 0.06)'
  chip-article:
    backgroundColor: '{colors.pink}'
    textColor: '#ffffff'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 3px 8px
  chip-project:
    backgroundColor: '{colors.bluey}'
    textColor: '#ffffff'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 3px 8px
  chip-neutral:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 3px 8px
  chip-tag:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.pill}'
    padding: 3px 8px
  ai-tip-accordion:
    backgroundColor: '{colors.panel-2}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.lg}'
    padding: 12px
    shadow: '0 1px 3px rgb(var(--shadow-rgb) / 0.06)'
  subscribe-panel:
    backgroundColor: '{colors.panel}'
    borderColor: '{colors.ink}'
    borderWidth: 2px
    rounded: '{rounded.xl}'
    padding: 48px
  text-input:
    backgroundColor: '{colors.panel-2}'
    textColor: '{colors.ink}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: '{rounded.input}'
    padding: 8px 12px
  footer:
    borderColor: '{colors.ink}'
    borderWidth: 2px
  command-palette:
    backgroundColor: 'color-mix(in srgb, {colors.bg} 88%, white 12%)'
    borderColor: 'color-mix(in srgb, {colors.ink} 75%, white 25%)'
    borderWidth: 1px
    rounded: 24px
  content-menu-dropdown:
    backgroundColor: '{colors.bg}'
    borderColor: '{colors.ink}'
    borderWidth: 1px
    rounded: 8px
---

## Overview

Sijo Sam is a personal portfolio and technical blog — clean, scannable, and warm. The aesthetic balances professionalism with personality: rounded corners, friendly display fonts, pastel accent chips, and a Malayalam quote that grounds the design in identity.

The site has three core purposes:

1. **Introduce** — Hero section with name, role, and a philosophical anchor (നദിക്ക് വള്ളവും മനുഷ്യർക്ക് സ്വപ്നവും ഒരുപോലെയാണ് — "A boat carries us across a river; a dream carries us through life")
2. **Showcase** — Featured projects and writing in compact preview cards
3. **Navigate** — Clear paths to projects, blog posts, guides, AI tips, and resume

Every pixel earns its place. Borders are thin (1–2px), shadows are subtle, cards are compact, and the grid packs two columns on desktop for featured content. The goal is to make visitors feel welcomed, not overwhelmed.

The site supports both light and dark themes. A toggle in the header switches instantly. The preference is persisted to localStorage and defaults to the system's `prefers-color-scheme`.

## Colors

The palette uses warm teal ink as the structural color, with pastel accents applied sparingly on chips and CTAs.

### Light theme (default)

- **Ink (#004747):** Dark teal — `main` — for all text and borders. The single structural color.
- **Panel (#f0f5f5):** Teal-tinted off-white for header and primary surfaces.
- **Panel-2 (#ffffff):** Pure white for cards and content surfaces — crisp separation from the teal-tinted panel.
- **Surface (#e8eeee):** Light teal-gray for secondary containers (chips, tags).
- **BG (#f5f8f8):** Page background. Solid very-light teal-white — no gradients.
- **Yellow (#f9d84a):** Accent color for highlights and special CTAs.
- **Pink (#c92d68):** Chip color for article tags. Darkened so white text meets WCAG AA 4.5:1 contrast (5.17:1).
- **Pink-CTA (#c92d68 → #a8205a):** Primary action gradient. Darkened so white text passes AA (5.17:1 top, 6.96:1 bottom). Shadow: `#8a1f4f`.
- **Link (#a8205a):** Hyperlink color inside content. 6.96:1 on white in light mode. In dark mode, a brighter `#ff5d97` (6.2:1 on panel) is used instead.
- **Pink-error (#972959):** Dark rose for error text and error borders.
- **Mint (#92efc5):** Active states, selected items, and category chips.
- **Bluey (#3f5bff):** Video/project type chips only. Darkened so white text passes AA (5.06:1).

### Dark theme

Neutral charcoal grays — soft layered dark palette so surfaces separate without harsh pure-black contrast.

- **Ink (#ffffff):** Pure white for all text and borders.
- **Panel (#26262c):** Lifted charcoal panel for header and modal.
- **Panel-2 (#1d1d20):** Card surface. Toned down ~5% from near-black — sits just above the page bg for soft layering.
- **Surface (#1e1e23):** Recessed charcoal for chips and secondary containers.
- **BG (#1a1a1f):** Page background — the deepest layer, with panel and cards stepping up from it.
- **Yellow (#f9d84a):** Unchanged. Uses fixed black text (#000000) in dark mode for contrast.
- **Pink (#c92d68):** Unchanged from light — dark enough for white text on black.
- **Pink-CTA (#c92d68 → #a8205a):** Unchanged gradient. White text passes AA.
- **Pink-error (#ff8caa):** Brighter rose for error text — the light-theme value is too dark on black.
- **Mint (#2d7d6a):** Muted green for selected/category chips.
- **Bluey (#3f5bff):** Unchanged from light — white text passes AA on black.

In dark mode, shadows use pure black (`rgb(0 0 0 / ...)`). The dark theme uses soft layered charcoal grays — no teal tints — with surfaces stepping up gently from the page bg.

## Typography

Two fonts: Baloo 2 for display, Nunito for body and UI. Both are rounded and friendly but used at practical sizes.

**Baloo 2** (display) is used for:
- Hero title (`display-hero`, 2.25rem, 800 weight)
- Page titles (`display-page-title`, 1.5rem, 800 weight)
- Section headings (`display-section`, 1.25rem, 700 weight)
- Card titles (`display-card`, 1.125rem, 700 weight)
- Logo (`display-logo`, 1.125rem, 800 weight)
- Content titles (`content-title`, 1.875rem, 500 weight)

Line height 1.1–1.3 — readable, not cramped.

**Nunito** (body) handles everything else:
- Body text: `body-md` (0.9rem), `body-base` (0.85rem), `body-sm` (0.78rem)
- Labels: `label-ui` (0.82rem, 800 weight), `label-caps` (0.7rem, 700 weight, 0.06em tracking)
- Badges: `badge` (0.68rem, 800 weight, 0.04em tracking)

Font sizes are deliberately compact for information density — the priority is fitting more content per screen without feeling cramped.

## Layout

The layout is a centered max-width container with a compact header bar on top.

```
┌───────────────────────────────────────────┐
│  Sijo Sam    [nav links]    [☾] [🔍]      │  compact header
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  Sijo Sam                           │  │  hero section
│  │  നദിക്ക് വള്ളവും മനുഷ്യർക്ക്...       │  │
│  │  [About] [Projects] [Say Hi]        │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Projects                        [View all]│
│  ┌──────────┐ ┌──────────┐                │
│  │  card    │ │  card    │                │  featured grid
│  └──────────┘ └──────────┘                │
│                                           │
│  Writing                         [View all]│
│  ┌──────────┐ ┌──────────┐                │
│  │  card    │ │  card    │                │  featured grid
│  └──────────┘ └──────────┘                │
│                                           │
└───────────────────────────────────────────┘
```

**Header bar:** A single horizontal panel containing the site name/logo (left), navigation links (center), and theme toggle + search button (right). ~50px tall on desktop.

**Hero section:** Centered content block with:
- Name (Baloo 2, 2.25rem, 800 weight)
- Malayalam quote in blockquote with left border accent
- English translation subtitle
- Action buttons (About, Projects, Say Hi)

**Featured grids:** Two columns on desktop for featured projects and writing. Each card is compact with 1px ink border, 14px radius, and subtle shadow.

**Main content pages:** Blog, projects, guides, AI tips, and resume pages follow a consistent single-column or grid layout with max-width 5xl (640px) centered container.

Spacing follows a 4px base unit. Common values: 4, 8, 12, 16, 24px. Gaps between cards use 12px.

## Elevation & Depth

Depth is subtle — just enough to separate layers without adding visual noise.

**Panels (header, modal):** `0 2px 8px rgb(var(--shadow-rgb) / 0.08)` — a soft, small shadow. `--shadow-rgb` is `0 71 71` in light mode, `0 0 0` in dark mode.

**Cards:** `0 1px 3px rgb(var(--shadow-rgb) / 0.06)` — barely there, just enough to lift the white card off the warm background. On hover: `0 2px 8px rgb(var(--shadow-rgb) / 0.12)` with a subtle `translateY(-1px)` lift.

**Buttons:** `0 4px 0 #8a1f4f` — keeps the signature hard shadow on primary CTA only. On hover: `translateY(-1px)`. On active: `translateY(2px)` with `0 2px 0` shadow.

No decorative rotated shapes. No excessive shadows. The content is the design.

## Shapes

Roundness is part of the identity — friendly but not exaggerated:

- **pill (9999px):** all chips, all buttons, stat pills
- **xl (16px):** header bar, modal container, subscribe panel
- **lg (14px):** cards, content containers
- **input (10px):** text input, select dropdowns
- **sm (8px):** minor UI elements, thumbnails
- **xs (6px):** small inline elements

Corners are rounded but not wasteful. Cards at 14px look friendly without losing corner space.

## Dark Mode

The site implements a manual light/dark theme toggle with system preference fallback.

**Implementation:** A `data-theme="light"` or `data-theme="dark"` attribute is set on `<html>`. All color tokens are CSS custom properties, so dark mode is a pure variable override — no component code changes needed. The theme hook manages state, persists to `localStorage` (key: `theme`), and defaults to `window.matchMedia("(prefers-color-scheme: dark)")` on first visit.

**FOUC prevention:** An inline script in `BaseLayout.astro` reads the stored preference and sets `data-theme` before Astro hydrates, preventing a flash of the wrong theme.

**Toggle button:** A compact secondary-style button in the header bar showing "☾" in light mode (click → dark) and "☀" in dark mode (click → light). Same 2px border, pill radius, and compact padding as other buttons.

**Adaptations beyond color variables:**

- The "Read original" button uses fixed black text (`#000000`) in dark mode — white on bright yellow has poor contrast.
- Content links use a dedicated `--color-link` token (`#a8205a` light, `#ff5d97` dark) instead of `--color-pink-cta-deep`, because the CTA gradient needs a dark pink for white text while links need a bright pink on dark backgrounds.
- Shadows use pure black in both themes (light: teal-tinted, dark: pure black).
- Native form controls and scrollbars respect the theme via `color-scheme: dark`.
- The modal backdrop always uses `bg-black/40` (not `bg-ink/40`) so it stays dark in both themes.

**Accessibility (WCAG 2.2 AA):**

- Pink and blue accent colors are darkened so all white-on-color text meets 4.5:1 contrast.
- Secondary text uses `text-ink-muted` (75% ink) instead of 60%, ensuring 4.5:1 on panel/card surfaces in light mode.
- `:focus-visible` rings (2px pink-cta outline) on all buttons and cards.
- `@media (prefers-reduced-motion: reduce)` disables all decorative animation (spin, fade-in) and transform-based transitions.
- Modals use `role="dialog" aria-modal="true"`, trap Tab focus, and restore focus to the triggering element on close.
- Error banners use `role="alert"`; loading states use an `aria-live="polite"` region.
- A skip-to-content link is the first focusable element.
- Form inputs have associated `<label>` elements; invalid input triggers `role="alert"` and `aria-invalid`.

## Components

**Header bar (Nav):** The primary navigation surface. Panel background, 2px ink border, 16px radius, subtle shadow. Contains:

- Site name/logo ("Sijo Sam") in Baloo 2 1.125rem, 800 weight
- Navigation links: Home, Projects, Blog, Guides, AI Tips, Resume
- Theme toggle button (☾ / ☀)
- Search button (triggers command palette)

**Hero:** Centered content block at the top of the home page. Contains:

- Name (Baloo 2, 2.25rem, 800 weight)
- Malayalam quote in blockquote with 2px ink left border, italic, 1.5rem
- English translation subtitle (0.82rem, ink/90)
- Action buttons (About, Projects, Say Hi) in primary/secondary variants

**Cards (PostPreview, ProjectPreview):** Compact, clickable, white background (panel-2). 1px ink border, 14px radius, subtle shadow. 12px padding. Layout:

- Thumbnail (optional): full-width, 80px tall, 8px radius, 1px border, object-cover
- Type chip + date chip: inline row above the title, small (0.68rem)
- Title: Baloo 2, 1.125rem, 700 weight, 1.2 line-height, `line-clamp-2`
- Excerpt/description: Nunito, 0.85rem, `line-clamp-2`, ink at 80% opacity
- Metadata chips at the bottom (read time, tags, etc.)
- Entire card is clickable. A subtle hover state (shadow + 1px lift) signals interactivity.

**Chips:** All pill radius + 1px ink border. Compact: 3px 8px padding, 0.68rem text.

- Article type: pink background, white text
- Project type: bluey background, white text
- Neutral (date, read-time): surface background, ink text
- Tag chips: surface background, ink text

**Primary buttons:** Vertical gradient `#c92d68 → #a8205a`, white text, pill, 2px ink border, hard shadow `0 4px 0 #8a1f4f`. Compact: 8px 14px padding, 0.82rem text. Hover lifts `translateY(-1px)`.

**Secondary buttons:** White/panel-2 background, ink text, 2px ink border, pill. Used for navigation, theme toggle, modal close. Compact: 8px 14px padding. Hover lifts `translateY(-1px)`.

**Text input:** White/panel-2 background, 1px ink border, 10px radius, 8px 12px padding. Placeholder uses ink at 40% opacity. Flat, no inset shadow.

**Command palette:** Centered overlay, max-width 640px. Panel background, 1px ink border, 24px radius. Contains search input and keyboard shortcut hints (⌘K).

**Footer:** Simple panel with 2px ink border. Contains:

- About, Contact links
- Code (GitHub) link
- RSS feed link
- Carbon page link

## Do's and Don'ts

**Do:**

- Use 1–2px ink borders on cards and inputs, 2px on panels
- Keep cards compact — 12px padding, 2-line clamps
- Make entire cards clickable
- Use two columns on desktop for featured content grids
- Keep the header to a single compact bar
- Use Baloo 2 for titles and the site name only
- Apply the hard CTA shadow (`0 4px 0 #8a1f4f`) to primary buttons only
- Use `translateY(-1px)` on hover for cards and buttons
- Support dark mode via CSS variable overrides on `[data-theme="dark"]`
- Persist theme preference to localStorage with system preference fallback
- Include the Malayalam quote in the hero — it's central to identity

**Don't:**

- Use borders thicker than 2px anywhere
- Use 4px borders, 32px radii, or heavy double shadows
- Give cards their own "Open" button — the card itself is the button
- Use a giant hero section or display text larger than 2.25rem
- Use decorative rotated shapes or excessive shadows
- Use dashed borders — solid only
- Use gray text — use `ink` at reduced opacity (`ink/60`, `ink/80`) instead
- Apply the CTA pink gradient to anything other than primary buttons
- Use fonts outside Baloo 2 / Nunito
- Hardcode colors in components — use CSS variables so dark mode works automatically
- Use `bg-ink/40` for modal backdrop — use `bg-black/40` so it stays dark in both themes
- Remove the Malayalam quote or English translation — they define the site's voice
