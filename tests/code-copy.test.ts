import { test } from 'node:test';
import assert from 'node:assert/strict';

import { stripTrailingNewline } from '../src/utils/code-copy.ts';

test('drops the newline Shiki adds after the last line', () => {
    assert.equal(stripTrailingNewline('npm run build\n'), 'npm run build');
});

test('drops only one trailing newline', () => {
    assert.equal(stripTrailingNewline('line one\nline two\n\n'), 'line one\nline two\n');
});

test('leaves text without a trailing newline untouched', () => {
    assert.equal(stripTrailingNewline('const x = 1;'), 'const x = 1;');
});

test('handles empty and newline-only input', () => {
    assert.equal(stripTrailingNewline(''), '');
    assert.equal(stripTrailingNewline('\n'), '');
});

test('keeps indentation and inner blank lines intact', () => {
    const source = 'if (x) {\n\n    return 1;\n}\n';
    assert.equal(stripTrailingNewline(source), 'if (x) {\n\n    return 1;\n}');
});
