import type Fuse from 'fuse.js';
import { navigate } from 'astro:transitions/client';

import { createFuse, getAllItems, getResults, normalize } from './search';
import { renderResults } from './render';
import type { CommandPaletteElements, CommandPaletteState, SearchItem } from './types';
declare global {
    interface Window {
        __commandPaletteInitialized?: boolean;
        __commandPaletteItems?: SearchItem[];
        __commandPaletteFuse?: Fuse<SearchItem>;
    }
}

const STORAGE_KEY = 'command-palette-search-index';
const STORAGE_VERSION_KEY = 'command-palette-version';
const INDEX_VERSION = 1;
const INDEX_URL = '/search-index.json';
const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let elements: CommandPaletteElements | null = null;
const state: CommandPaletteState = {
    isOpen: false,
    query: '',
    activeIndex: 0,
    results: [],
    previousFocus: null
};
function bindElements() {
    const root = document.querySelector<HTMLElement>('[data-command-palette-root]');
    const input = root?.querySelector<HTMLInputElement>('#command-palette-input');
    const results = root?.querySelector<HTMLElement>('[data-command-palette-results]');
    const status = root?.querySelector<HTMLElement>('[data-command-palette-status]');
    if (!root || !input || !results || !status) {
        elements = null;
        return null;
    }
    elements = { root, input, results, status };
    return elements;
}
function focusInput() {
    requestAnimationFrame(() => {
        elements?.input.focus();
        elements?.input.select();
    });
}
function refreshFuse() {
    window.__commandPaletteFuse = createFuse(getAllItems(window.__commandPaletteItems || []));
}
function updateResults() {
    if (!elements) return;
    const query = normalize(state.query);
    const fuse = window.__commandPaletteFuse || createFuse(getAllItems(window.__commandPaletteItems || []));
    renderResults(elements, state, getResults(query, window.__commandPaletteItems || [], fuse));
}
function openPalette() {
    if (!elements && !bindElements()) return;
    if (state.isOpen) {
        focusInput();
        return;
    }
    state.previousFocus = document.activeElement;
    state.isOpen = true;
    state.query = '';
    state.activeIndex = 0;
    elements.root.hidden = false;
    document.body.classList.add('command-palette-open');
    updateResults();
    focusInput();
}
function closePalette() {
    if (!elements && !bindElements()) return;
    if (!state.isOpen) return;
    state.isOpen = false;
    state.query = '';
    elements.root.hidden = true;
    document.body.classList.remove('command-palette-open');
    if (state.previousFocus instanceof HTMLElement) {
        state.previousFocus.focus();
    }
}
async function runAction(item: SearchItem) {
    if (item.actionId === 'toggle-theme') {
        window.dispatchEvent(new CustomEvent('site:toggle-theme'));
        return;
    }
    if (item.actionId === 'copy-url') {
        try {
            await navigator.clipboard.writeText(window.location.href);
            elements?.status && (elements.status.textContent = 'Copied current URL');
        } catch {
            elements?.status && (elements.status.textContent = 'Unable to copy current URL');
        }
    }
}
async function activateResult(index: number, openInNewTab = false) {
    const item = state.results[index];
    if (!item) return;
    closePalette();
    if (item.type === 'action') {
        await runAction(item);
        return;
    }
    if (openInNewTab) {
        window.open(item.href, '_blank', 'noopener');
        return;
    }
    // Use Astro's SPA navigation
    await navigate(item.href);
}
function trapFocus(event: KeyboardEvent) {
    if (!state.isOpen || event.key !== 'Tab' || !elements) return;
    const focusable = [...elements.root.querySelectorAll<HTMLElement>(focusableSelector)].filter((node) => !node.hasAttribute('hidden'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}
function loadFromStorage(): SearchItem[] | null {
    try {
        const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
        if (storedVersion !== String(INDEX_VERSION)) return null;

        const cached = localStorage.getItem(STORAGE_KEY);
        if (!cached) return null;

        const items = JSON.parse(cached) as SearchItem[];
        return items.length ? items : null;
    } catch {
        return null;
    }
}

function saveToStorage(items: SearchItem[]) {
    try {
        localStorage.setItem(STORAGE_VERSION_KEY, String(INDEX_VERSION));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.warn('Failed to cache search index', error);
    }
}

async function loadSearchIndex(): Promise<SearchItem[]> {
    const cached = loadFromStorage();
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(INDEX_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const items = await response.json() as SearchItem[];
        saveToStorage(items);
        return items;
    } catch (error) {
        console.error('Failed to load search index:', error);
        return [];
    }
}

export async function initCommandPalette() {
    if (window.__commandPaletteInitialized) {
        return;
    }
    window.__commandPaletteInitialized = true;

    const items = await loadSearchIndex();
    window.__commandPaletteItems = items;
    window.__commandPaletteFuse = createFuse(getAllItems(items));

    bindElements();
    window.addEventListener('site:open-command-palette', openPalette);
    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (target?.closest('[data-open-command-palette]')) {
            event.preventDefault();
            openPalette();
            return;
        }
        const resultButton = target?.closest<HTMLElement>('[data-result-index]');
        if (resultButton) {
            void activateResult(Number(resultButton.dataset.resultIndex));
            return;
        }
        target?.closest('[data-command-palette-close]') && closePalette();
    });
    document.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            openPalette();
            return;
        }
        if (!state.isOpen) return;
        trapFocus(event);
        if (event.key === 'Escape') {
            event.preventDefault();
            closePalette();
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const delta = event.key === 'ArrowDown' ? 1 : -1;
            state.activeIndex = state.results.length ? (state.activeIndex + delta + state.results.length) % state.results.length : 0;
            updateResults();
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            void activateResult(state.activeIndex, event.metaKey || event.ctrlKey);
        }
    });
    document.addEventListener('input', (event) => {
        if (!state.isOpen || !elements || event.target !== elements.input) return;
        state.query = elements.input.value;
        state.activeIndex = 0;
        updateResults();
    });
    document.addEventListener('astro:page-load', () => {
        bindElements();
    });
    document.addEventListener('astro:after-swap', () => {
        bindElements();
        closePalette();
    });
}
