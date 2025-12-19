export const twoPi = Math.PI * 2;

export function lerp(start: number, end: number, amount: number): number {
    return start + (end - start) * amount;
}

export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}
