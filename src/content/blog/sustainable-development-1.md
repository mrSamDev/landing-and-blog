---
title: Understanding Minification Impact A Developer's Experiment
excerpt: A personal exploration into the real impact of JavaScript minification on web performance
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

## TL;DR

- Tested minification impact on a React + Vite application
- Achieved 79.4% total size reduction (JS: 44.6%, CSS: 99.8%)
- Performance improved most significantly in worst-case scenarios (43.5% faster at 95th percentile)
- Test case used artificially bloated CSS to demonstrate maximum potential impact
- Tools used: Vite 5.0.0, React 18.2.0, esbuild for minification

## Disclaimer

Before diving in: This was an afternoon project using an artificially constructed test case. I intentionally created a CSS-heavy application to demonstrate the maximum potential impact of minification. While the results are interesting, they likely won't match typical production applications. Consider this more of an exploration than a definitive guide.

It started when I was diving into articles about sustainable web development practices. Minification kept coming up as one of the first recommended optimizations, something we all seem to just accept as a "must-do" for production. But I realized I'd never actually measured its impact myself.

## Tools and Versions Used

- Vite: 6.0.1
- React: 18.3.1
- Puppeteer: 23.10.1
- Node.js: 23.2.0
- MacBook Pro (16-inch, 2021) with M1 Pro chip and 16GB RAM
- macOS Sonoma 14.5

## How to Reproduce These Tests

1. Clone the test repository: `git clone https://github.com/yourusername/minification-test`
2. Install dependencies: `pnpm install`
3. Run the test suite: `npm run analysis`
4. Results will be output to the nodejs console`

## The Test Setup

I used a basic React + Vite application as my test subject. The setup was pretty straightforward - I just toggled the minification settings in the Vite config to compare builds.

the testing script will be called 100 time for minfied and non minfied paths

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

If you're skeptical about minification's impact, I encourage you to run similar tests on your own projects using the reproduction steps provided above. I'd really love to see how these numbers look for different apps - my hunch is that the benefits vary wildly depending on your stack and code structure.

Have you tried measuring this stuff in your own projects? I'm genuinely curious about what others are seeing

[Full code repo](https://github.com/mrSamDev/minification-impact-on-react)
