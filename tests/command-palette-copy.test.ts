import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// The command palette's copy should carry the site's voice. The generic
// enumeration ("Search pages, posts, guides, projects, and actions") is a
// template-ism; we brand it with warm, human, navigation-flavored copy.

const PALETTE_URL = new URL('../src/components/CommandPalette.astro', import.meta.url);
const RENDER_URL = new URL('../src/scripts/command-palette/render.ts', import.meta.url);

test('search placeholder is branded, not the generic enumeration', () => {
    assert.ok(
        readFileSync(PALETTE_URL, 'utf8').includes('placeholder="Where to next?"'),
        'placeholder should be the branded "Where to next?"'
    );
});

test('help line is tight and human, not a full sentence', () => {
    assert.ok(
        readFileSync(PALETTE_URL, 'utf8').includes('⌘K to open · ↑↓ to move · ↵ to open · esc to close'),
        'help line should be the compact keyboard hint'
    );
});

test('the generic enumeration is gone', () => {
    assert.ok(!readFileSync(PALETTE_URL, 'utf8').includes('Search pages, posts'));
});

test('empty state is human, not the spec-y "No matches"', () => {
    const render = readFileSync(RENDER_URL, 'utf8');
    assert.ok(render.includes('Nothing here — try a different word.'));
    assert.ok(!render.includes('No matches'));
});
