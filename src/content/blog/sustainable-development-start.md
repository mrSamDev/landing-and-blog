---
title: 'Network-Aware Development: Sustainability'
excerpt: 'Learn how to implement adaptive loading strategies that balance performance and sustainability in modern web applications'
publishDate: 'Jan 15 2025'
isPublished: true
tags:
  - JavaScript
  - Programming
  - Sustainable Development
  - Frontend Development
seo:
  image:
    src: 'https://res.cloudinary.com/dnmuyrcd7/image/upload/f_auto,q_auto/v1/Blog/carbonwebsite'
    alt: Minified JavaScript code on a computer screen
---

After seven years building web applications, from startups to enterprise-scale projects, I stumbled upon something that completely changed how I write code. Like many developers, I've spent countless hours focusing on architecture patterns, framework choices, and optimization techniques. But I'd never stopped to consider the environmental cost of every line of code I write.

The turning point came after watching Ko Turk's eye-opening talk ["Your frontend is killing! Let's measure its impact with CO2.js"](https://www.youtube.com/watch?v=UNmusfWlhTk) - which highlighted how every webpage load contributes to an often-overlooked energy consumption crisis.

## The Wake-Up Call

It started with a realization while optimizing one of our web apps. I was digging through Chrome Dev Tools, trying to figure out why our bundle size had grown so much over the past few months. That's when it hit me - does all this code we're shipping actually have an environmental impact?

The thought wouldn't leave my head. As developers, we're always focused on speed, user experience, and business metrics. But what about the energy cost? Each byte we send means servers running somewhere, network infrastructure transmitting data, and client devices processing code. The more I thought about it, the more I realized how little attention we pay to the environmental cost of our development decisions.

## Rethinking Network-Aware Development

Before diving into implementation, let me share what I've learned about the available tools. The Network Information API provides the `saveData` property ([MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)), which indicates whether the user has requested reduced data usage. I discovered this while working on a project for users in regions with limited connectivity. The browser support surprised me:

- Chrome (Android): Supported
- Chrome (Desktop): Not supported
- Firefox: Not supported
- Safari: Not supported
- Samsung Internet: Supported
- Opera (Android): Supported

Despite limited support, I've found creative ways to use this as part of a progressive enhancement strategy.

### The Legacy Code Challenge

The real wake-up call came when I inherited a massive codebase that had grown organically over years without proper code management. The application was plagued with inefficient renders and significant memory leaks. This wasn't just about bundle size - it was about code that was actively consuming excessive resources on users' machines.

Here are the specific issues I encountered:

1. **Memory Consumption Nightmares**
   The legacy codebase had components re-rendering unnecessarily on every state change, creating new instances of heavy objects without cleanup. Memory usage would climb steadily until users had to refresh their browsers. Chrome's Memory Profiler became my best friend as I tracked down these leaks.

2. **Render Optimization Challenges**
   I discovered components that were rendering thousands of items simultaneously without virtualization, causing significant performance issues. Some list views were so inefficient that scrolling would cause noticeable frame drops and CPU spikes.

3. **Technical Debt Impact**
   Years of accumulated technical debt manifested in:
   - Duplicate code blocks doing the same tasks differently
   - Outdated dependencies with known memory leaks
   - Inconsistent state management patterns leading to unnecessary renders

## Real-World Impact: The Ongoing Battle

While I managed to implement several optimizations, the results weren't as dramatic as I'd hoped. Here's what I achieved after months of refactoring:

- Memory consumption improved by around 30% through better cleanup and render optimization, though we're still working on further improvements
- CPU usage decreased after implementing virtualization, but some complex views still need optimization
- Browser crashes reduced significantly but still occur occasionally during peak usage

The journey taught me that legacy code optimization is often more about persistent incremental improvements rather than dramatic transformations. We're still working on better solutions for our more complex views.

## Experimenting with Solutions

Here's my initial proof-of-concept implementation for network-aware loading:

```javascript
const networkAwareLoad = async (resourceUrl) => {
  const connection = navigator.connection || {
    effectiveType: '4g',
    saveData: false
  };

  const RARELY_USED_THRESHOLD = 0.15;
  const CHUNK_SIZE = 100 * 1024; // 100KB chunks

  try {
    const resourceSize = await getResourceSize(resourceUrl);

    if (connection.saveData || connection.effectiveType === 'slow-2g') {
      return loadCriticalOnly(resourceUrl);
    }

    if (connection.effectiveType === '4g') {
      const usage = await getModuleUsageStats(resourceUrl);
      if (usage.interactionRate > RARELY_USED_THRESHOLD) {
        return prefetchWithPriority(resourceUrl);
      }
    }

    return loadChunked(resourceUrl, { chunkSize: CHUNK_SIZE });
  } catch (error) {
    console.error(`Failed to load ${resourceUrl}:`, error);
    return loadDefault(resourceUrl);
  }
};
```

### Local-First Architecture

I'm also exploring local-first approaches using Dexie.js and IndexedDB:

```javascript
import Dexie from 'dexie';

class SustainableLocalDB extends Dexie {
  constructor() {
    super('SustainableApp');

    this.version(1).stores({
      assets: 'key, data, timestamp',
      userActions: '++id, type, data, synced'
    });
  }

  async prefetchCommonAssets() {
    const assetsList = await getCommonAssetsList();

    for (const asset of assetsList) {
      const stored = await this.assets.get(asset.key);
      if (!stored || this.isAssetStale(stored.timestamp)) {
        const data = await fetchAsset(asset.key);
        await this.assets.put({
          key: asset.key,
          data: data,
          timestamp: Date.now()
        });
      }
    }
  }

  isAssetStale(timestamp) {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > ONE_WEEK;
  }
}
```

### Active Development Tools

The [Import Cost VS Code Extension](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) by Wix has revolutionized how I think about package imports. It provides instant feedback right in your editor:

```javascript
import lodash from 'lodash'; // 69.7K (gzipped)
import { get } from 'lodash'; // 23.1K (gzipped)
```

This real-time size feedback makes it much easier to spot heavy imports before they make it into production. I've caught myself numerous times reaching for lodash when I only needed a single function.

### Learning Resources

For developers starting their sustainability journey, these resources helped shape my understanding:

#### Core Documentation

- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData) - Essential reading for implementing data-saving features
- [HTTP Archive Web Almanac](https://almanac.httparchive.org/) - Invaluable for benchmarking and understanding web performance trends
- [Web.dev Performance Guides](https://web.dev/learn/#performance) - Comprehensive resource for performance optimization techniques

#### Sustainability Specific

- [Ko Turk's "Your frontend is killing!"](https://www.youtube.com/watch?v=UNmusfWlhTk) - This talk completely changed my perspective on frontend environmental impact
- [Sustainable Web Design Guidelines](https://www.sustainablewebdesign.org/) - Practical guidelines for reducing your web application's carbon footprint

Each resource builds upon the others - I'd recommend starting with Ko Turk's talk for inspiration, then diving into the technical documentation to implement what you've learned.

## Update: Walking the Talk

After applying these principles to my own blog, the results exceeded my expectations. Using the [Website Carbon Calculator](https://www.websitecarbon.com/), my blog now ranks in the top 2% of web pages tested for sustainability. Here's what made the difference:

- Moved to Astro for minimal JavaScript shipping
- Implemented aggressive asset optimization

I will share more along my journey as I learn more about sustainability and tools. Feel free to reach out at [contact](/contact) if you're interested in exploring this together.
