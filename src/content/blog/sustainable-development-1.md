---
title: Understanding Minification Impact Sustainability and Performance Analysis
excerpt: A personal exploration into the real impact of JavaScript minification om web performance
publishDate: 'Dec 9 2024'
tags:
  - JavaScript
  - Programming
  - Sustainable development
  - Frontend development
seo:
  image:
    src: '/js-symbols.jpg'
    alt: JavaScript code on a computer screen
---

It started when I was diving into articles about sustainable web development practices. Minification kept coming up as one of the first recommended optimizations, something we all seem to just accept as a "must-do" for production. But I realized I'd never actually measured its impact myself.

With a few hours to spare and genuine curiosity about the performance claims I'd read online, I decided to run some quick tests using Puppeteer. While not exactly rigorous science, I figured some real numbers would be better than none. Plus, I was particularly interested in the sustainability angle that rarely gets discussed in optimization talks.

Quick disclaimer before diving in: This was an afternoon project driven by curiosity, not a comprehensive study. I haven't cross-verified these numbers with other sources, and your results may vary significantly depending on your specific setup. Consider this more of an exploration than a definitive guide.

## The Test Setup

I used a basic React + Vite application as my test subject. The setup was pretty straightforward - I just toggled the minification settings in the Vite config to compare builds. All tests were run on my MacBook Pro (16-inch, 2021) with an M1 Pro chip and 16GB RAM, running macOS Sonoma 14.5.

For testing, I put together a simple Puppeteer script:

```javascript
const testConfig = {
  iterations: 100, // Seemed like a reasonable number
  concurrency: 10, // My laptop could handle this fine
  waitConditions: ['networkidle0', 'domcontentloaded', 'load']
};
```

### Measurement Approach

The testing setup was intentionally basic - just plain JavaScript and CSS with React. I modified the Vite config to toggle minification:

```javascript
// vite.config.js for unminified build
export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: null
      }
    }
  }
});

// vite.config.js for minified build
export default defineConfig({
  build: {
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: null
      }
    }
  }
});

const createConfig = (minify = true) =>
  defineConfig({
    plugins: [react()],
    build: {
      minify: minify,
      rollupOptions: {
        output: {
          dir: minify ? "dist/minified" : "dist/unminified",
        },
      },
    },
  });

export default ({ mode }) => {
  if (mode === "production-unminified") {
    return createConfig(false);
  }
  return createConfig(true);
};

```

## Results

Here's what I found after comparing the builds:

| Resource Type | Unminified | Minified  | Reduction | % Saved |
| ------------- | ---------- | --------- | --------- | ------- |
| JavaScript    | 458.43 KB  | 254.09 KB | 204.34 KB | 44.6%   |
| CSS           | 788.13 KB  | 1.24 KB   | 786.89 KB | 99.8%   |
| Other Assets  | 1.90 KB    | 1.74 KB   | 0.16 KB   | 8.4%    |
| Total         | 1248.46 KB | 257.07 KB | 991.39 KB | 79.4%   |

The CSS reduction seemed surprisingly high, so I double-checked those numbers several times. Turns out my unminified CSS had a lot of duplicate styles and comments that got stripped out.

## Performance Impact

The load time improvements were interesting:

| Metric            | Unminified | Minified  | Improvement |
| ----------------- | ---------- | --------- | ----------- |
| Average Load Time | 4960.91ms  | 4424.99ms | 10.8%       |
| Median Load Time  | 4988.50ms  | 4941.50ms | 0.9%        |
| 95th Percentile   | 8994.00ms  | 5085.00ms | 43.5%       |

The most noticeable improvement was in the 95th percentile - the "worst case" scenarios got much better with minification. The median improvement wasn't as dramatic as I expected, which made me wonder about other factors affecting load time.

## The Testing Code

Here's the core function I used to measure everything:

```javascript
async function makeRequest(url, page, index) {
  const resources = {
    document: { size: 0, count: 0 },
    script: { size: 0, count: 0 },
    stylesheet: { size: 0, count: 0 },
    other: { size: 0, count: 0 }
  };

  // Track all network responses
  page.on('response', async (response) => {
    const request = response.request();
    const type = request.resourceType();
    const buffer = await response.buffer();
    const size = buffer.length;

    resources[type] = {
      size: resources[type].size + size,
      count: resources[type].count + 1
    };
  });

  const startTime = Date.now();
  await page.goto(url, {
    waitUntil: ['networkidle0', 'domcontentloaded', 'load']
  });
  const loadTime = Date.now() - startTime;

  return { loadTime, resources };
}
```

## Environmental Considerations

While I can't make definitive claims about environmental impact without more rigorous study, the data reduction numbers got me thinking about the broader implications:

- Less data transferred means less network infrastructure load
- Reduced server load could mean lower power consumption
- Faster load times might mean less client-side processing

These are just theoretical benefits though - I'd love to see someone do a proper study on the environmental impact of frontend optimizations.

## What I'm Using Now

Based on these findings, here's the build configuration I settled on:

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

And a simple size checker for my build process:

```javascript
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const checkBundleSize = async () => {
  const stats = await getBuildStats();
  const limits = {
    js: 300 * 1024, // Based on test results
    css: 50 * 1024 // Generous limit given findings
  };

  Object.entries(stats).forEach(([type, size]) => {
    if (size > limits[type]) {
      throw new Error(`${type} bundle exceeds size limit!`);
    }
  });
};
```

## Looking Forward

This quick exploration left me with several questions I'd like to investigate further:

1. How do these results scale with different types of applications?
2. What's the actual relationship between bundle size and energy consumption?
3. Are there specific types of code that benefit more from minification?
4. How do different minification tools compare?

## Conclusion

The numbers honestly surprised me - I knew minification helped, but seeing that 79.4% reduction in my own app was eye-opening. And those performance gains in the worst-case scenarios? That wasn't what I expected going into this.

Quick confession: I should mention that my test case was pretty artificial. I basically went wild copy-pasting div styles in CSS (something I hope no real developer actually does... please tell me no one does this). While it helped demonstrate the extreme case of what minification can do, it's probably not representative of a well-structured codebase. But hey, sometimes you need to go a bit overboard to prove a point, right?

If you're skeptical (like I was) about minification's impact, the test setup isn't too complex to replicate. I'd really love to see how these numbers look for different apps - my hunch is that the benefits vary wildly depending on your stack and code structure.

And yeah, obvious caveat - this was just me, messing around with tests for an afternoon on one specific app. Take these results with a grain of salt. Have you tried measuring this stuff in your own projects? I'm genuinely curious about what others are seeing.
