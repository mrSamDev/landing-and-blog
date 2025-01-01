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

You know that feeling when you look at your old code and physically cringe? Yeah, we're about to go there. Today, I'm dissecting a React component I wrote back in 2018 that I thought was absolutely brilliant at the time. Spoiler alert: it wasn't.

## The "Clever" Component That Haunts Me

First, let me show you this masterpiece of over-engineering:

```typescript
import React from "react";

const imgCache = {
  __cache: {}
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

Look at that beauty! A custom cache implementation! Throwing promises around! A timeout that resolves to an empty object because... reasons? I was so proud of this at the time.

## Why Did I Even Write This?

It was 2018, and React had just dropped this shiny new thing called Suspense. Everyone was excited about it, including me. Maybe a bit too excited. The JavaScript ecosystem was different back then:

- Native lazy loading? Nah, that wasn't a thing yet
- Browser image optimization? Pretty basic
- React was still figuring out how to handle SSR properly
- Everyone and their dog was writing custom image loading solutions

So there I was, thinking I needed to solve ALL THE THINGS:

1. Cache images in memory (because apparently browsers don't do that already, right?)
2. Handle loading states with Suspense (because it was new and cool)
3. Deal with SSR hydration (by making things more complicated)
4. Add a timeout (that doesn't actually handle errors properly)

## Oh God, What Was I Thinking?

Let's count the ways this was... problematic:

### 1. The Memory Leak Factory

```javascript
this.__cache[src] = true;
```

This cache grows forever. No cleanup. No size limits. Just an ever-expanding object that would eventually eat all the memory if the app ran long enough. Oops.

### 2. The Promise-Throwing Theater

```javascript
if (this.__cache[src] instanceof Promise) {
  throw this.__cache[src];
}
```

Look at me using Suspense! I'm so modern! (Meanwhile, the browser's already handling image loading just fine, thanks.)

### 3. The Timeout of Mystery

```javascript
setTimeout(() => resolve({}), 7000);
```

Seven seconds, because... why not? And let's resolve with an empty object instead of properly handling the error. Future me would like to have a word with past me about this one.

## How Things Have Changed (Thank Goodness)

Fast forward to 2024, and oh boy, have things improved. Here's what we can do now:

```html
<!-- Look ma, no JavaScript! -->
<img loading="lazy" decoding="async" src="picture.jpg" alt="A much simpler approach" />
```

That's it. Really. The browser now handles:

- Lazy loading
- Image optimization
- Caching
- Loading priorities
- Pretty much everything I was trying (and failing) to do manually

And if you really need more features, modern frameworks got you covered:

```javascript
// Next.js making life easier
import Image from 'next/image';

function MyComponent() {
  return <Image src="/my-image.jpg" alt="Look how clean this is" width={500} height={300} />;
}
```

## When Do You Actually Need Custom Image Loading?

After spending way too much time thinking about this, here's when you might actually need custom image handling:

1. You're building a game with specific asset loading requirements
2. You're doing some fancy pants animation sequences
3. You're building an offline-first app with complex caching needs

Notice how "displaying regular images on a website" isn't on that list? Yeah.

## The Lessons I (Eventually) Learned

1. **Trust the Platform**: Browsers are pretty smart. They've been loading images since before I wrote my first `console.log()`. Maybe trust them a bit more?

2. **Simple > Clever**: Every time I try to be clever, future me has to deal with the consequences. Future me is getting tired of this.

3. **Stay Updated**: The web platform keeps evolving. What was a "best practice" in 2018 might be an anti-pattern in 2024.

## What Now?

These days, my approach is much simpler:

```javascript
const Image = ({ src, alt }) => <img src={src} alt={alt} loading="lazy" decoding="async" />;
```

That's it. No cache. No promises. No timeouts. Just let the browser do its thing.

If you need more features, grab an image component from your framework of choice. Next.js, Astro, and Gatsby all have great solutions that are way better than anything we were cooking up in 2018.

## The Moral of the Story

Sometimes the best code is the code you don't write. Or in this case, the code you delete and replace with platform features that existed all along.

I'd love to hear about your own "what was I thinking?" moments. Drop a comment below or reach out on [Bluesky](https://bsky.app/profile/sijosam.in). Misery loves company, especially when it comes to questionable code decisions!
