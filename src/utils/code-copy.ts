// Shiki appends one newline; copying it makes a pasted command run immediately.
export function stripTrailingNewline(text: string): string {
    return text.endsWith('\n') ? text.slice(0, -1) : text;
}
