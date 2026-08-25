// Golden Ratio math + Fibonacci spiral geometry.
// Pure functions: no DOM, no side effects. Used both at build time (Astro
// frontmatter) and by node:test.

export const PHI = (1 + Math.sqrt(5)) / 2;

export function goldenRatio(): number {
    return PHI;
}

export function goldenInverse(): number {
    return 1 / PHI;
}

/** First `count` Fibonacci numbers: [1, 1, 2, 3, 5, ...]. */
export function fibonacci(count: number): number[] {
    if (count <= 0) return [];
    const seq = [1];
    if (count === 1) return seq;
    seq.push(1);
    for (let i = 2; i < count; i++) {
        seq.push(seq[i - 1] + seq[i - 2]);
    }
    return seq;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/**
 * Quarter-circle SVG arc. Follows the classic golden-spiral construction:
 * the arc lives inside a Fibonacci-sized square, centered on one of the
 * square's corners.
 */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const sweep = endDeg - startDeg <= 180 ? 0 : 1;
    return {
        d: `M ${start.x} ${start.y} A ${r} ${r} 0 ${sweep} 0 ${end.x} ${end.y}`,
        length: (r * Math.PI) / 2
    };
}

export type GoldenSquare = {
    value: number;
    x: number;
    y: number;
    size: number;
    arc: { d: string; length: number };
};

export type GoldenSpiral = {
    squares: GoldenSquare[];
    width: number;
    height: number;
    minX: number;
    minY: number;
};

/**
 * Lay out `count` Fibonacci squares + their inscribed quarter arcs to form a
 * golden spiral. Squares are returned in ascending size order so the reveal
 * animation can build 1 → 1 → 2 → 3 → 5 → ...  The resulting spiral is a
 * single continuous curve (each arc's end is the next smaller arc's start).
 */
export function goldenSpiralSquares(count = 10): GoldenSpiral {
    const seq = fibonacci(count);
    const n = seq.length;
    const gutter = 1;

    const height = seq[n - 1];
    const width = height + seq[n - 2];

    // Positions are computed largest-first (each square abuts the one before
    // it in the spiral), then returned in ascending order for the build-up.
    const raw: Array<{
        x: number;
        y: number;
        size: number;
        cx: number;
        cy: number;
        startDeg: number;
        endDeg: number;
    }> = new Array(n);

    let prevX = gutter / 2;
    let prevY = gutter / 2;
    let prevDi = 0;

    for (let i = n - 1; i >= 0; i--) {
        const size = seq[i];
        let x: number, y: number, startDeg: number, endDeg: number, cx: number, cy: number;
        switch (i % 4) {
            case 3:
                x = prevX;
                y = Math.max(prevY - size, gutter / 2);
                cx = x + size;
                cy = y + size;
                startDeg = 270;
                endDeg = 360;
                break;
            case 2:
                x = prevX + prevDi;
                y = prevY;
                cx = x;
                cy = y + size;
                startDeg = 0;
                endDeg = 90;
                break;
            case 1:
                x = prevX + prevDi - size;
                y = prevY + prevDi;
                cx = x;
                cy = y;
                startDeg = 90;
                endDeg = 180;
                break;
            default:
                x = prevX - size;
                y = prevY + prevDi - size;
                cx = x + size;
                cy = y;
                startDeg = 180;
                endDeg = 270;
                break;
        }
        raw[i] = { x, y, size, cx, cy, startDeg, endDeg };
        prevX = x;
        prevY = y;
        prevDi = size;
    }

    const squares = raw.map((s) => ({
        value: s.size,
        x: s.x,
        y: s.y,
        size: s.size,
        arc: arcPath(s.cx, s.cy, s.size, s.startDeg, s.endDeg)
    }));

    const xs = squares.flatMap((s) => [s.x, s.x + s.size]);
    const ys = squares.flatMap((s) => [s.y, s.y + s.size]);

    return {
        squares,
        width,
        height,
        minX: Math.min(...xs),
        minY: Math.min(...ys)
    };
}
