import pw from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.js';
const { chromium } = pw;

const BASE = 'http://localhost:4321';
const results = [];

function log(label, data) {
  results.push({ label, data });
  console.log(`\n=== ${label} ===`);
  console.log(data);
}

async function main() {
  const browser = await chromium.launch({
    executablePath: '/Users/samdev/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    headless: true,
  });

  // ── Test 1: Direct load (refresh) ──
  const page1 = await browser.newPage();
  const logs1 = [];
  const errors1 = [];

  page1.on('console', (msg) => {
    logs1.push(`[${msg.type()}] ${msg.text()}`);
  });
  page1.on('pageerror', (err) => {
    errors1.push(err.message);
  });
  page1.on('requestfailed', (req) => {
    errors1.push(`REQUEST FAILED: ${req.url()} - ${req.failure()?.errorText}`);
  });

  await page1.goto(`${BASE}/guides/xss-attack/`, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(3000);

  const state1 = await page1.evaluate(() => {
    const pres = document.querySelectorAll('pre.mermaid');
    return {
      totalBlocks: pres.length,
      processed: document.querySelectorAll('pre.mermaid[data-processed]').length,
      unprocessed: document.querySelectorAll('pre.mermaid:not([data-processed])').length,
      hasSvg: document.querySelectorAll('pre.mermaid svg').length,
      firstBlockHtml: pres[0]?.innerHTML.slice(0, 200) || 'NONE',
      firstBlockBg: pres[0] ? getComputedStyle(pres[0]).backgroundColor : 'NONE',
      firstBlockMinHeight: pres[0] ? getComputedStyle(pres[0]).minHeight : 'NONE',
      htmlClasses: document.documentElement.className,
      theme: localStorage.getItem('theme'),
      firstSvgBg: document.querySelector('pre.mermaid svg rect')?.getAttribute('fill') || 'NO RECT',
      firstSvgStyle: document.querySelector('pre.mermaid svg')?.getAttribute('style') || 'NO SVG',
    };
  });

  log('Test 1: Direct load', { state1, logs: logs1, errors: errors1 });

  // ── Test 2: Navigate via View Transition (from homepage) ──
  const page2 = await browser.newPage();
  const logs2 = [];
  const errors2 = [];

  page2.on('console', (msg) => logs2.push(`[${msg.type()}] ${msg.text()}`));
  page2.on('pageerror', (err) => errors2.push(err.message));
  page2.on('requestfailed', (req) => errors2.push(`REQUEST FAILED: ${req.url()} - ${req.failure()?.errorText}`));

  // Start on homepage
  await page2.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(2000);

  console.log('Homepage URL:', page2.url());

  // Set theme to dark
  await page2.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });

  // Click the Guides link in the nav
  const guideLink = await page2.$('a[href*="guide"]');
  console.log('Guide link found:', !!guideLink, 'href:', await guideLink?.getAttribute('href'));
  await guideLink.click();
  await page2.waitForTimeout(2000);
  console.log('After guide click URL:', page2.url());

  // Now click the xss-attack guide
  const xssLink = await page2.$('a[href*="xss-attack"]');
  console.log('XSS link found:', !!xssLink, 'href:', await xssLink?.getAttribute('href'));
  if (xssLink) {
    await xssLink.click();
  } else {
    // Fallback: navigate directly
    await page2.goto(`${BASE}/guides/xss-attack/`, { waitUntil: 'networkidle' });
  }
  await page2.waitForTimeout(4000);

  const state2 = await page2.evaluate(() => {
    const pres = document.querySelectorAll('pre.mermaid');
    return {
      totalBlocks: pres.length,
      processed: document.querySelectorAll('pre.mermaid[data-processed]').length,
      unprocessed: document.querySelectorAll('pre.mermaid:not([data-processed])').length,
      hasSvg: document.querySelectorAll('pre.mermaid svg').length,
      firstBlockHtml: pres[0]?.innerHTML.slice(0, 200) || 'NONE',
      firstBlockBg: pres[0] ? getComputedStyle(pres[0]).backgroundColor : 'NONE',
      firstBlockMinHeight: pres[0] ? getComputedStyle(pres[0]).minHeight : 'NONE',
      htmlClasses: document.documentElement.className,
      theme: localStorage.getItem('theme'),
      firstSvgBg: document.querySelector('pre.mermaid svg rect')?.getAttribute('fill') || 'NO RECT',
      url: window.location.href,
    };
  });

  log('Test 2: View Transition navigation', { state2, logs: logs2, errors: errors2 });

  // ── Test 3: Light mode direct load ──
  const page3 = await browser.newPage();
  const logs3 = [];
  const errors3 = [];

  page3.on('console', (msg) => logs3.push(`[${msg.type()}] ${msg.text()}`));
  page3.on('pageerror', (err) => errors3.push(err.message));

  await page3.goto(`${BASE}/guides/xss-attack/`, { waitUntil: 'networkidle' });

  // Force light mode
  await page3.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  // Re-trigger mermaid by dispatching astro:page-load
  await page3.evaluate(() => {
    document.querySelectorAll('pre.mermaid[data-processed]').forEach((d) => d.removeAttribute('data-processed'));
    document.dispatchEvent(new Event('astro:page-load'));
  });

  await page3.waitForTimeout(3000);

  const state3 = await page3.evaluate(() => {
    const pres = document.querySelectorAll('pre.mermaid');
    return {
      totalBlocks: pres.length,
      processed: document.querySelectorAll('pre.mermaid[data-processed]').length,
      hasSvg: document.querySelectorAll('pre.mermaid svg').length,
      firstBlockHtml: pres[0]?.innerHTML.slice(0, 200) || 'NONE',
      firstSvgBg: document.querySelector('pre.mermaid svg rect')?.getAttribute('fill') || 'NO RECT',
      firstSvgStyle: document.querySelector('pre.mermaid svg')?.getAttribute('style') || 'NO SVG',
      theme: localStorage.getItem('theme'),
      htmlClasses: document.documentElement.className,
    };
  });

  log('Test 3: Light mode', { state3, logs: logs3, errors: errors3 });

  await browser.close();

  console.log('\n\n========== SUMMARY ==========');
  console.log('Test 1 (direct load):', state1.processed, '/', state1.totalBlocks, 'processed,', state1.hasSvg, 'SVGs, errors:', errors1.length);
  console.log('Test 2 (view transition):', state2.processed, '/', state2.totalBlocks, 'processed,', state2.hasSvg, 'SVGs, errors:', errors2.length);
  console.log('Test 3 (light mode):', state3.processed, '/', state3.totalBlocks, 'processed,', state3.hasSvg, 'SVGs, errors:', errors3.length);
  console.log('SVG background (test1):', state1.firstSvgBg);
  console.log('SVG background (test2):', state2.firstSvgBg);
  console.log('SVG background (test3):', state3.firstSvgBg);
}

main().catch(console.error);