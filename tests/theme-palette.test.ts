import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// The dark theme must carry the site's warm teal identity, not neutral
// charcoal. Neutral grays (R=G=B) read as the generic AI-dev-site dark mode;
// a subtle teal cast echoes the light-mode palette while staying readable.

const CSS_URL = new URL('../src/styles/global.css', import.meta.url);

function extractBlock(src: string, label: string): string {
    const re = new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`);
    const m = re.exec(src);
    if (!m) {
        throw new Error(`CSS block not found: ${label}`);
    }
    return m[1];
}

function colorTokens(block: string): Record<string, string> {
    const tokens: Record<string, string> = {};
    for (const line of block.split('\n')) {
        const m = /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/.exec(line);
        if (m) {
            tokens[m[1]] = m[2].toLowerCase();
        }
    }
    return tokens;
}

function rgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace('#', ''), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function toHueSatLight(hex: string): { h: number; s: number; l: number } {
    const [r, g, b] = rgb(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) {
        return { h: 0, s: 0, l };
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h: number;
    switch (max) {
        case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
            break;
        case g:
            h = ((b - r) / d + 2) * 60;
            break;
        default:
            h = ((r - g) / d + 4) * 60;
    }
    return { h: (h + 360) % 360, s, l };
}

function luminance(hex: string): number {
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const [r, g, b] = rgb(hex);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
    const hi = Math.max(luminance(a), luminance(b));
    const lo = Math.min(luminance(a), luminance(b));
    return (hi + 0.05) / (lo + 0.05);
}

const css = readFileSync(CSS_URL, 'utf8');
const dark = colorTokens(extractBlock(css, '@variant dark'));
const light = colorTokens(extractBlock(css, '@theme'));

const SURFACES = ['bg', 'surface', 'panel', 'panel-2'] as const;

test('dark neutrals carry a teal hue (not neutral charcoal)', () => {
    for (const name of SURFACES) {
        const { h, s } = toHueSatLight(dark[name]);
        assert.ok(
            h >= 150 && h <= 210 && s > 0,
            `${name} (${dark[name]}) should be teal-hued, got hue ${h.toFixed(1)}, sat ${s.toFixed(3)}`
        );
    }
});

test('dark surfaces are deep (low luminance)', () => {
    for (const name of SURFACES) {
        const { l } = toHueSatLight(dark[name]);
        assert.ok(l < 0.25, `${name} (${dark[name]}) should be dark, got lightness ${l.toFixed(3)}`);
    }
});

test('dark ink keeps WCAG AA contrast (>= 4.5:1) on every surface', () => {
    const ink = dark.ink;
    for (const name of SURFACES) {
        const ratio = contrast(ink, dark[name]);
        assert.ok(ratio >= 4.5, `ink on ${name}: ${ratio.toFixed(2)}:1 < 4.5`);
    }
});

test('light-mode tokens are unchanged (regression guard)', () => {
    assert.equal(light.bg, '#e9f0f0');
    assert.equal(light.ink, '#004747');
    assert.equal(light.panel, '#f0f5f5');
});

