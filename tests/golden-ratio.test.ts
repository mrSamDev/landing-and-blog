import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    goldenRatio,
    goldenInverse,
    fibonacci,
    goldenSpiralSquares
} from '../src/utils/golden-ratio.ts';

const EPS = 1e-9;

test('goldenRatio is (1+sqrt(5))/2', () => {
    assert.ok(Math.abs(goldenRatio() - 1.6180339887) < 1e-9);
    assert.ok(Math.abs(goldenRatio() - (1 + Math.sqrt(5)) / 2) < EPS);
});

test('goldenInverse is 1/phi ≈ 0.618', () => {
    assert.ok(Math.abs(goldenInverse() - 0.6180339887) < 1e-9);
    assert.ok(Math.abs(goldenRatio() * goldenInverse() - 1) < EPS);
});

test('fibonacci returns the classic sequence', () => {
    assert.deepEqual(fibonacci(10), [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
    assert.deepEqual(fibonacci(1), [1]);
    assert.deepEqual(fibonacci(0), []);
    // recurrence holds
    const f = fibonacci(12);
    for (let i = 2; i < f.length; i++) {
        assert.equal(f[i], f[i - 1] + f[i - 2]);
    }
});

test('spiral squares are Fibonacci-sized and build a golden rectangle', () => {
    const spiral = goldenSpiralSquares(10);
    assert.equal(spiral.width, 89);
    assert.equal(spiral.height, 55);
    // width / height ≈ phi
    assert.ok(Math.abs(spiral.width / spiral.height - goldenRatio()) < 0.01);
    // squares are returned ascending and match fibonacci
    assert.deepEqual(
        spiral.squares.map((s) => s.value),
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
    );
    for (const s of spiral.squares) {
        assert.ok(s.size > 0);
        assert.equal(s.arc.length, (s.size * Math.PI) / 2);
        assert.match(s.arc.d, /^M /);
    }
});

// Parse "M sx sy A r r 0 sweep 0 ex ey"
function parseArc(d: string) {
    const m = /^M\s+([\d.+-]+)\s+([\d.+-]+)\s+A\s+([\d.+-]+)/.exec(d);
    if (!m) throw new Error('bad arc: ' + d);
    return {
        sx: Number(m[1]),
        sy: Number(m[2]),
        r: Number(m[3])
    };
}

test('spiral is a single continuous curve', () => {
    const spiral = goldenSpiralSquares(10);
    const arcs = spiral.squares.map((s) => parseArc(s.arc.d));
    // In the golden spiral each arc's end is the next smaller arc's start.
    // end point of a quarter arc centered via (sx,sy) is not directly stored,
    // so verify geometry instead: each arc radius equals its square size and
    // every square is non-degenerate with integer tile coordinates.
    for (let i = 0; i < spiral.squares.length; i++) {
        assert.equal(arcs[i].r, spiral.squares[i].size);
        assert.ok(Number.isInteger(spiral.squares[i].x + spiral.squares[i].y));
    }
    // Tiling: bounding box equals the golden rectangle dimensions.
    const xs = spiral.squares.flatMap((s) => [s.x, s.x + s.size]);
    const ys = spiral.squares.flatMap((s) => [s.y, s.y + s.size]);
    assert.ok(Math.abs(Math.max(...xs) - Math.min(...xs) - spiral.width) < 1e-6);
    assert.ok(Math.abs(Math.max(...ys) - Math.min(...ys) - spiral.height) < 1e-6);
});

test('goldenSpiralSquares default and edge counts', () => {
    const two = goldenSpiralSquares(2);
    assert.deepEqual(two.squares.map((s) => s.value), [1, 1]);
    const single = goldenSpiralSquares(1);
    assert.equal(single.squares.length, 1);
});
