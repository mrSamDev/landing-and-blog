import { getQueryTokens, getTypeLabel } from './search';
import type { CommandPaletteElements, CommandPaletteState, SearchItem } from './types';

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return map[character];
    });
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(value: string | undefined, query: string) {
    const text = value || '';
    const tokens = [...new Set(getQueryTokens(query))];

    if (!text || !tokens.length) {
        return escapeHtml(text);
    }

    const pattern = tokens
        .sort((a, b) => b.length - a.length)
        .map((token) => escapeRegExp(token))
        .join('|');

    if (!pattern) {
        return escapeHtml(text);
    }

    return escapeHtml(text).replace(new RegExp(`(${pattern})`, 'gi'), '<mark class="command-palette-highlight">$1</mark>');
}

export function renderResults(elements: CommandPaletteElements, state: CommandPaletteState, results: SearchItem[]) {
    state.results = results;

    if (state.activeIndex >= state.results.length) {
        state.activeIndex = Math.max(0, state.results.length - 1);
    }

    if (!state.results.length) {
        elements.results.innerHTML = '<li class="command-palette-empty">No matches</li>';
        elements.status.textContent = 'No matches';
        return;
    }

    elements.results.innerHTML = state.results
        .map((item, index) => {
            const isActive = index === state.activeIndex;
            const meta = item.description || item.href || '';

            return `
                <li>
                    <button
                        type="button"
                        class="command-palette-option${isActive ? ' is-active' : ''}"
                        role="option"
                        aria-selected="${isActive ? 'true' : 'false'}"
                        data-result-index="${index}"
                    >
                        <span class="command-palette-option-main">
                            <span class="command-palette-option-title">${highlightText(item.title, state.query)}</span>
                            <span class="command-palette-option-meta">${highlightText(meta, state.query)}</span>
                        </span>
                        <span class="command-palette-option-type">${escapeHtml(getTypeLabel(item))}</span>
                    </button>
                </li>
            `;
        })
        .join('');

    elements.status.textContent = `${state.results.length} result${state.results.length === 1 ? '' : 's'}`;
}
