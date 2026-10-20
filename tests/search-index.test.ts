import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseFrontmatter } from '../src/integrations/search-index.ts';

// The blog loop skips posts flagged isPublished: false. Posts that omit the
// flag fall back to the published default, so the parser must not invent one.

test('post without isPublished is treated as published', () => {
    const { data } = parseFrontmatter('---\ntitle: Hello\n---\nbody');
    assert.equal(data.isPublished, undefined);
    assert.notEqual(data.isPublished, false);
});

test('post with isPublished false is detected', () => {
    const { data } = parseFrontmatter('---\ntitle: Hello\nisPublished: false\n---\nbody');
    assert.equal(data.isPublished, false);
});
