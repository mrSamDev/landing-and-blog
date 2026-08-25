import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GOLDEN_REVEAL_EVENT } from '../src/utils/golden-events.ts';

test('golden reveal event name is stable and shared', () => {
    assert.equal(GOLDEN_REVEAL_EVENT, 'golden-ratio:reveal');
    assert.ok(typeof GOLDEN_REVEAL_EVENT === 'string' && GOLDEN_REVEAL_EVENT.length > 0);
});
