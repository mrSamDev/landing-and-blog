---
title: The CSS Size Paradox Why Your Utility-First CSS Is Larger (And Why That's Okay)
excerpt: Explore the tradeoffs between utility-first and traditional CSS approaches, examining bundle sizes, developer experience, and environmental impact in modern web development.
publishDate: 'Dec 15 2024'
tags:
  - CSS
  - Web Development
  - Performance
  - Sustainability
  - Tailwind
seo:
  image:
    src: https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/css-paradox/sntje6rvkkjm0d3pyz7k
    alt: CSS Development Approaches Comparison
---

## Introduction

I had an interesting realization recently after building a three-page application using Tailwind CSS and shadcn/ui. The final CSS bundle came in at 16.87kB - not terrible, but it got me thinking: what would this look like with plain CSS? That simple question led me down a path that made me reconsider my assumptions about modern CSS development.

The application consisted of three core pages:

_Note: The following images are representative examples and not the actual application screenshots used in development._

![[Dashboard]](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/css-paradox/dsbfcvge59ppcdt9jwyw)

![[Login]](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/css-paradox/obdefauvrp70xyesyv6s)

![[Profile]](https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/css-paradox/v3fdgrgamosrfedfaoiz)

## The Project Breakdown

The application was straightforward: a dashboard with some metric cards, a login page, and a profile section. Nothing groundbreaking - just the kind of interfaces we build every day. Using Tailwind and shadcn/ui, everything came together quickly. The components were essentially plug-and-play, and Tailwind's utility classes made custom styling predictable.

## The Plain CSS Experiment

After finishing the Tailwind version, I decided to rebuild it with plain CSS. As someone who started web development before utility classes were a thing, I figured it would be a good comparison.

The results were... enlightening:

- The plain CSS version took most of my workday, compared to getting the Tailwind version done before lunch
- I caught myself Googling "CSS grid vs flexbox", "media query breakpoints" and even "center div CSS" like it was a newbie again 😅
- Here's the truly ironic part: I kept finding myself on Tailwind's documentation to remember how to write certain styles in plain CSS. Yes, you read that right - I was using Tailwind's docs as a reference for vanilla CSS properties!

## The Numbers

Let's look at the actual build outputs:

### Plain CSS Version

```bash
> pnpm build
vite v6.0.3 building for production...
✓ 1582 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-B76JZ6kn.css    9.72 kB │ gzip:  2.30 kB
dist/assets/index-B8BU4Oca.js   160.20 kB │ gzip: 50.30 kB
✓ built in 868ms
```

### Tailwind Version

```bash
> pnpm build
vite v6.0.3 building for production...
✓ 1583 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-auN296VL.css   16.87 kB │ gzip:  3.91 kB
dist/assets/index-BwddC_WK.js   187.06 kB │ gzip: 58.19 kB
✓ built in 1.25s
```

## The Real Costs

While the plain CSS version was indeed smaller (9.72kB vs 16.87kB), the development experience revealed some hidden costs:

1. **Context Switching**

   - Constantly jumping between HTML and CSS files
   - Fighting specificity wars in our shared.css file ('!important' became our team's inside joke in the plain CSS version)
   - Maintaining consistent naming conventions

2. **Development Speed**
   - More time spent on basic layout implementations
   - Additional effort required for responsive design
   - Increased cognitive load from managing style organization

## A Practical Example

Here's a simple button implementation in both approaches:

### Traditional CSS:

```css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: #3b82f6;
  color: white;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2563eb;
}

@media (max-width: 768px) {
  .button {
    width: 100%;
  }
}
```

### Utility-First CSS:

```html
<button class="px-4 py-2 rounded bg-blue-500 text-white transition-colors hover:bg-blue-600 md:w-auto w-full">Click me</button>
```

While the traditional CSS might look cleaner in isolation, the utility-first approach scales better across a large application. You're trading verbosity in HTML for predictability and maintainability in your styles.

## The Environmental Angle

During development, I noticed something unexpected about resource usage. The plain CSS workflow involved constant rebuilds and refreshes as I tweaked styles and fought specificity issues. My development machine was working harder, running hotter, and consuming more power. The Tailwind version, despite its larger bundle size, actually resulted in fewer build cycles and less time with development servers running.

This led me to an interesting conclusion: while the final bundle is 7.15kB larger, the reduced development overhead might actually make the utility-first approach more environmentally conscious overall. For teams interested in measuring their development environmental impact, tools like the [Website Carbon Calculator](https://www.websitecarbon.com/) can provide insights into the broader picture.

## Conclusion

Yes, utility-first CSS creates larger bundles. But after spending a day with both approaches, I can confidently say those extra kilobytes are buying something valuable: developer productivity and maintainable code. The next time someone points out your CSS bundle size, remember that performance isn't just about the numbers - it's about the entire development lifecycle.

What started as a simple size comparison ended up reinforcing why modern CSS tools have become so popular. Those extra kilobytes aren't just code - they're hours saved and headaches avoided.
