---
title: domsure
description: DOM query utilities that replace non-null assertions with real runtime checks. Eight helpers under 1 KB gzipped.
publishDate: 'Jul 04 2026'
isFeatured: true
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/v1733839719/Blog/canvas.png
    alt: domsure project cover
---

![npm version](https://img.shields.io/npm/v/domsure?logo=npm&label=npm)
![TypeScript](https://img.shields.io/badge/typescript-ready-3178C6?logo=typescript&logoColor=white)
![Size](https://img.shields.io/badge/size-1KB%20gzipped-success)
![GitHub](https://img.shields.io/badge/github-domsure-181717?logo=github)

**Project Overview**

`domsure` replaces your `!` non-null assertions with real runtime checks. Eight DOM query helpers under 1 KB gzipped. ESM and CJS. No dependencies.

## Before / After

```ts
// Before: the ! hides a missing element. Silent null deref at runtime.
const navbar = document.getElementById("navbar")!;
navbar.classList.add("active");

// After: throws a clear error if the selector is wrong or the element is gone.
const navbar = $.required("#navbar");
navbar.classList.add("active");
```

## API

```ts
import { $, $$, defineSelectors, DomsureError } from 'domsure';

$(selector)        // HTMLElement | null  - silent query
$.required(sel)    // HTMLElement        - throw if missing
$.tryRequired(sel) // [DomsureError|null, HTMLElement|null] - required, never throws
$.optional(sel)    // HTMLElement | null - warn once in dev if missing
$.exists(sel)      // boolean            - presence check
$$(selector)       // HTMLElement[]      - querySelectorAll as an array
$$.required(sel)   // HTMLElement[]      - throw if none match
$$.tryRequired(sel)// [DomsureError|null, HTMLElement[]] - required, never throws
$$.optional(sel)   // HTMLElement[]      - warn once in dev if none match
$$.exists(sel)     // boolean            - presence check
defineSelectors(s) // Readonly registry  - frozen, typed selector map
resetWarnings()    // void               - clear the warn-once dedup set
```

### `$`

Silent single-element query. Simple `#id` selectors use `getElementById`. Everything else, including compound selectors like `#app .item` or `#nav.active`, falls through to `querySelector`. Never warns.

```ts
const modal = $('#modal');        // HTMLElement | null
```

### `$.required`

Asserts the element exists. Throws `DomsureError` if it does not. This is the whole reason the package exists.

```ts
const app = $.required('#app');   // HTMLElement, never null
```

### `$.tryRequired`

Required semantics, but returns a `[error, element]` tuple instead of throwing. `[null, el]` on success. `[DomsureError, null]` on a miss.

Use it where a throw is unrecoverable. The main case is React `useEffect` and `useLayoutEffect`. Error boundaries catch render-phase throws, but not effect throws. So a `$.required` inside an effect bypasses the boundary and crashes the page. `$.tryRequired` lets the effect degrade instead.

```ts
const [err, nav] = $.tryRequired('#navbar');
if (err) { report(err); return; }
nav.classList.add('active');
```

Unlike `$.required`, it is safe under SSR. It returns `[DomsureError, null]` instead of throwing.

### `$.optional`

Like `$`, but warns once per selector in development when the element is missing. The dedup keeps React and Vue re-renders from flooding the console. No warnings in production.

```ts
const tooltip = $.optional('#tooltip');
```

### `$.exists`

Boolean check. No warnings, no element back.

```ts
if ($.exists('#tooltip')) { /* ... */ }
```

### `$$` and its parity methods

`querySelectorAll` returned as a real `Array`. `map`, `filter`, and `reduce` work directly. `$$` mirrors `$` with `.required`, `.optional`, and `.exists` for the multi-element case.

```ts
const items = $$('.item').map(el => el.textContent);

const required = $$.required('.row');    // throws if zero rows match
const [err, rows] = $$.tryRequired('.row'); // never throws
const maybe    = $$.optional('.row');    // warns once in dev if zero match
if ($$.exists('.row')) { /* ... */ }
```

### `defineSelectors`

Frozen, typed selector registry. Pass `as const` for string-literal inference. In dev, it rejects non-string values and duplicate selectors across keys, which is usually a copy-paste typo. Production builds strip the checks out via dead-code elimination.

```ts
const S = defineSelectors({
  navbar: '#navbar',
  items: '.item',
} as const);

S.navbar;  // typed as "#navbar", not string
```

### `resetWarnings`

Clears the warn-once dedup set so `$.optional` and `$$.optional` warn again for selectors that already fired one this session. Handy in long-lived SPAs after a route change, when previously missing elements reappear.

```ts
resetWarnings();
```

### `DomsureError`

Every failure throws a `DomsureError`, not a raw `DOMException` or a string. Catch it by type instead of regex-matching a message prefix. It carries the offending `selector` as structured data, so your logs can group by selector without parsing prose.

```ts
try {
  $.required('#missing');
} catch (e) {
  if (e instanceof DomsureError) {
    console.error(e.selector, e.message);
  }
}
```

## Browser-only

domsure reads `document` directly. Under SSR, where `document` is undefined, `$` and `$$` throw a `DomsureError` instead of failing silently. Guard isomorphic code:

```ts
if (typeof window !== 'undefined') {
  const el = $.required('#app');
}
```

## Size

| | raw | gzipped |
|---|---|---|
| ESM (`dist/index.js`) | ~2.3 KB | ~1.0 KB |
| CJS (`dist/index.cjs`) | ~2.8 KB | ~1.24 KB |

Zero runtime dependencies.

## Links

- NPM: https://www.npmjs.com/package/domsure
- GitHub: https://github.com/mrSamDev/domsure
- JSR: https://jsr.io/@mrsamdev/domsure
