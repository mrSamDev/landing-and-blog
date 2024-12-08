---
title: Sustainable Web Development Series Part 1 - Measuring Minification Impact
excerpt: A personal exploration into the real impact of JavaScript minification on web performance
publishDate: 'Dec 9 2024'
tags:
  - JavaScript
  - Programming
  - Sustainable Development
  - Frontend Development
seo:
  image:
    src: '/minifiedJS.png'
    alt: Minified JavaScript code on a computer screen
---

## TLDR

- Tested minification impact on a React + Vite application
- Test 1 (CSS-heavy): 79.4% total size reduction, up to 43.5% performance improvement
- Test 2 (random CSS): 44.2% total size reduction, 19-27% performance improvement
- Tools used: Vite 6.0.1, React 18.3.1, esbuild for minification via vite
- Code shown in examples optimized for article readability, [full code in repo](https://github.com/mrSamDev/minification-impact-on-react)

## Overview

It started when I was diving into articles about sustainable web development practices. Minification kept coming up as one of the first recommended optimizations, something we all seem to just accept as a "must-do" for production. But I realized I'd never actually measured its impact myself.

With a few hours to spare and genuine curiosity about the performance claims I'd read online, I decided to run some quick tests using Puppeteer. While not exactly rigorous science, I figured some real numbers would be better than none. Plus, I was particularly interested in the sustainability angle that rarely gets discussed in optimization talks.

Quick disclaimer before diving in: This was an afternoon project driven by curiosity, not a comprehensive study. I haven't cross-verified these numbers with other sources, and your results may vary significantly depending on your specific setup. Consider this more of an exploration than a definitive guide.

## Key Findings

- Test 1 (CSS-heavy): 79.4% total size reduction, up to 43.5% performance improvement
- Test 2 (random CSS): 44.2% total size reduction, 19-27% performance improvement
- Tools used: Vite 6.0.1, React 18.3.1, esbuild for minification

## Test Environment

- Vite: 6.0.1
- React: 18.3.1
- Puppeteer: 23.10.1
- Node.js: 23.2.0
- MacBook Pro (16-inch, 2021) with M1 Pro chip and 16GB RAM
- macOS Sonoma 14.5

## Methodology

### Test Setup

The experiment used a basic React + Vite application with two test scenarios:

1. CSS-Heavy Application: Intentionally bloated with duplicate styles and comments
2. Randomly Generated CSS: Using a Node.js script to simulate real-world variability

For the second test, I used a Node.js script to randomly generate the CSS, simulating the variability of real-world stylesheets:

```javascript
function generateRandomCSS(numRules = 50) {
  let css = '';

  for (let i = 0; i < numRules; i++) {
    const selector = generateRandomSelector();
    const numProperties = Math.floor(Math.random() * 5) + 1;

    css += `${selector} {\n`;

    for (let j = 0; j < numProperties; j++) {
      const property = cssProperties[Math.floor(Math.random() * cssProperties.length)];
      const value = randomValue(property);
      css += `    ${property}: ${value};\n`;
    }

    css += '}\n\n';
  }

  return css;
}
```

### Testing Process

```javascript
const testConfig = {
  iterations: 100,
  concurrency: 10,
  waitConditions: ['networkidle0', 'domcontentloaded', 'load']
};
```

The testing script ran 100 times for both minified and non-minified builds, measuring load times and resource sizes.

### Measurement Implementation

```javascript
async function makeRequest(url, page, index) {
  const resources = {
    document: { size: 0, count: 0 },
    script: { size: 0, count: 0 },
    stylesheet: { size: 0, count: 0 },
    other: { size: 0, count: 0 }
  };

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

## Results

### Test 1: CSS-Heavy Application

Resource size comparison:

| Resource Type | Unminified | Minified  | Reduction | % Saved |
| ------------- | ---------- | --------- | --------- | ------- |
| JavaScript    | 458.43 KB  | 254.09 KB | 204.34 KB | 44.6%   |
| CSS           | 788.13 KB  | 1.24 KB   | 786.89 KB | 99.8%   |
| Other Assets  | 1.90 KB    | 1.74 KB   | 0.16 KB   | 8.4%    |
| Total         | 1248.46 KB | 257.07 KB | 991.39 KB | 79.4%   |

Performance metrics:

| Metric            | Unminified | Minified  | Improvement |
| ----------------- | ---------- | --------- | ----------- |
| Average Load Time | 4960.91ms  | 4424.99ms | 10.8%       |
| Median Load Time  | 4988.50ms  | 4941.50ms | 0.9%        |
| 95th Percentile   | 8994.00ms  | 5085.00ms | 43.5%       |

### Test 2: Random CSS

Resource size comparison:

| Resource Type | Unminified | Minified  | Reduction | % Saved |
| ------------- | ---------- | --------- | --------- | ------- |
| JavaScript    | 458.43 KB  | 254.09 KB | 204.34 KB | 44.6%   |
| CSS           | 3.36 KB    | 2.5 KB    | 0.86 KB   | 25.6%   |
| Other Assets  | 1.70 KB    | 1.65 KB   | 0.05 KB   | 2.9%    |
| Total         | 463.49 KB  | 258.24 KB | 205.25 KB | 44.2%   |

Performance metrics:

| Metric            | Unminified | Minified  | Improvement |
| ----------------- | ---------- | --------- | ----------- |
| Average Load Time | 3487.50ms  | 4325.90ms | 19.4%       |
| Median Load Time  | 3749.50ms  | 5085.50ms | 26.3%       |
| 95th Percentile   | 3754.00ms  | 5128.00ms | 26.8%       |

## Recommended Configuration

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

Bundle size checker:

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
    js: 300 * 1024,
    css: 50 * 1024
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

I'm particularly interested in the environmental impact aspect - it feels like there's a lot more to explore there.

## Conclusion

The numbers honestly surprised me - I knew minification helped, but seeing that 79.4% reduction in my own app was eye-opening. And those performance gains in the worst-case scenarios? That wasn't what I expected going into this.

If you're skeptical about minification's impact, I encourage you to run similar tests on your own projects using the reproduction steps provided above. I'd really love to see how these numbers look for different apps - my hunch is that the benefits vary wildly depending on your stack and code structure.

Have you tried measuring this stuff in your own projects? I'm genuinely curious about what others are seeing.

[Repository with Full Code](https://github.com/mrSamDev/minification-impact-on-react)
