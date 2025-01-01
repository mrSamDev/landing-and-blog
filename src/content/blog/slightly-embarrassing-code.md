---
title: That Time I Over-Engineered Image Loading in React
excerpt: A deep dive into my 2018 React image loading component, what I got wrong, and how web standards have evolved to make it all unnecessary.
publishDate: 'Jan 02 2025'
tags:
  - React
  - JavaScript
  - Web Development
  - Performance
  - Lessons Learned
isFeatured: true
seo:
  image:
    src: 'https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/jlakzump30s04wevtrl4'
    alt: 'React code showing image loading implementation'
---

You know that feeling when you look at your old code and physically cringe? Yeah, we're about to go there. Today, I'm dissecting a React component I wrote back in 2018 or 2019 - for sake of the article let's say 2018 - that I thought was absolutely brilliant at the time. Spoiler alert: it wasn't.

## The "Clever" Component That Haunts Me

First, let me show you this masterpiece of over-engineering:

```typescript
import React from "react";

const imgCache = {
  __cache: {},
  read(src) {
    if (!src) return;

    if (!this.__cache[src]) {
      this.__cache[src] = new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.__cache[src] = true;
          resolve(this.__cache[src]);
        };
        img.src = src;
        setTimeout(() => resolve({}), 7000); // Oh, the elegance! 🤦‍♂️
      }).then((img) => {
        this.__cache[src] = true;
      });
    }

    if (this.__cache[src] instanceof Promise) {
      throw this.__cache[src];
    }
    return this.__cache[src];
  },
  clearImg: (src) => {
    delete this.__cache[src];
  },
};

const ImgWithCache = ({ src, ...rest }) => {
  imgCache.read(src);
  return <img alt="" src={src} {...rest} />;
};
```

## The Conference Talk That Started It All

I distinctly remember sitting in front of my laptop, watching Dan Abramov demonstrate React Suspense. React Hooks and Suspense were the hottest thing at the time. Dan was showing how Suspense could handle async operations elegantly, and my brain went "Oh yeah, I totally get this!"

Reader, I did not totally get this.

What followed was a classic case of cargo cult programming. I had seen something cool, understood about 60% of it, and decided to implement my own version without fully grasping the underlying principles. I took the concept of "thrown promises" and ran with it – straight into a wall of unnecessary complexity.

## Why Did I Think This Was Necessary?

To be fair to my 2018 self, the JavaScript ecosystem was different back then:

- Native lazy loading was still a dream
- Browsers' image optimization capabilities were pretty basic
- React's server-side rendering story was still evolving
- Every other blog post was about building custom image loading solutions

So there I was, armed with enthusiasm and just enough knowledge to be dangerous, trying to solve what I thought were critical problems:

1. "Browsers don't cache images efficiently enough" (they did)
2. "We need to handle loading states with Suspense" (we didn't)
3. "SSR hydration needs special handling" (it really didn't)
4. "Users need a timeout for slow images" (implemented in the worst possible way)

## Let's Count the Problems

Looking at this code now makes me want to time travel and take away my keyboard. Let's break down the issues:

### 1. The Memory Leak Factory

```javascript
this.__cache[src] = true;
```

This cache grows forever. No cleanup. No size limits. Just an ever-expanding object that would eventually eat all the memory if the app ran long enough. The browser's cache? Nah, clearly my infinite-growing object was better.

### 2. The Promise-Throwing Theater

```javascript
if (this.__cache[src] instanceof Promise) {
  throw this.__cache[src];
}
```

Look at me using Suspense! I'm so modern! Meanwhile, the browser had been handling image loading just fine for decades. But no, I had to add my own layer of complexity on top.

### 3. The Timeout of Mystery

```javascript
setTimeout(() => resolve({}), 7000);
```

Seven seconds. Not five. Not ten. Seven. Why? I have no idea. And instead of properly handling the timeout as an error state, I just... resolved with an empty object. Because that's totally helpful for error handling.

Also, notice how there's no way to configure this timeout? Every image gets seven seconds, whether it's a tiny icon or a massive hero image. One size fits all – and it's probably the wrong size.

## How Things Have Changed

Fast forward to 2024, and I'm almost embarrassed by how simple the solution has become:

```html
<!-- Look ma, no JavaScript! -->
<img loading="lazy" decoding="async" src="picture.jpg" alt="A much simpler approach" />
```

That's it. Really. The browser now handles:

- Lazy loading
- Image optimization
- Caching
- Loading priorities
- Everything I was trying (and failing) to do manually

And if you really need more features, modern frameworks have your back:

```javascript
// Next.js making life easier
import Image from 'next/image';

function MyComponent() {
  return <Image src="/my-image.jpg" alt="Look how clean this is" width={500} height={300} />;
}
```

## Let's Be Real: When Would You Actually Need This?

After years of overthinking image loading, I've realized custom image handling is rarely necessary. Here are the few legitimate use cases I've encountered:

1. Game Development: When building our team's HTML5 game prototype, we needed precise control over texture pack loading sequences. Each asset's loading progress had to be tracked individually to create those satisfying loading bars. That's when I finally understood why game devs don't just rely on `loading="lazy"`.

2. Interactive Data Visualizations: During a project involving WebGL and three.js, we needed to ensure all dataset textures loaded in a specific order before rendering. A simple Promise.all() handled this perfectly - no fancy cache required.

3. Complex Canvas Animations: That generative art project where timing was everything? Yeah, we needed to preload and verify every frame's assets before starting the sequence. But modern browsers handle most of this gracefully now.

4. Offline-First Apps: Remember when I built that photography portfolio app that had to work without internet? Even then, Service Workers handled the heavy lifting better than my DIY cache ever could.

For standard websites - even those fancy ones with parallax scrolling and infinite galleries - just trust the platform features. They've got you covered better than any afternoon coding session ever will.

## The Lessons I (Eventually) Learned

Looking back at this code makes me think of all those times I caught myself playing "framework developer" instead of actually solving problems. Here's what I wish I could tell my 2018 self:

1. Trust the platform first. I spent days building a caching system the browser already had. Those days could've gone into actual UX improvements or fixing that buggy checkout flow nobody wanted to touch.

2. Complexity needs justification. That setTimeout(7000)? Pure cargo cult programming. If you can't explain why a number is exactly what it is, it probably shouldn't be there.

3. The web evolves faster than your clever hacks. My "genius" solution was just a workaround for missing features that arrived naturally with time. Now it's just technical debt with a fancy bow.

4. Conference talks are inspiration, not documentation. Sorry, Dan - I watched your Suspense demo and built a suspension bridge to nowhere. Sometimes it's better to wait for the docs than to pioneer in the wrong direction.

## Moving Forward

These days, my image loading code looks something like this:

```javascript
const Image = ({ src, alt }) => <img src={src} alt={alt} loading="lazy" decoding="async" />;
```

That's it. Sometimes I don't even bother with the component wrapper. And you know what? It works better than my over-engineered solution ever did.

If I need more features, I reach for framework-provided solutions. Next.js, Astro, and Gatsby have all solved these problems better than I ever could on my own. It took me a while to accept that, but my code (and my users) are better for it.

## One Last Thing

Writing this post made me dig through some of my other old code, and oh boy, do I have stories to tell. If you enjoyed this journey through my past mistakes, let me know - I found a Redux implementation that makes this image loading component look downright sensible in comparison.

Until then, I'll be here, still resisting the urge to over-engineer things. Mostly. Sometimes. Well, I'm trying.

Find me on [Bluesky](https://bsky.app/profile/sijosam.in) if you want to share your own "what was I thinking?" moments. Misery loves company, especially when it comes to questionable code decisions!
