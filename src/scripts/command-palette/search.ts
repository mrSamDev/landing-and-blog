import Fuse from 'fuse.js';

import type { SearchItem, SearchItemType } from './types';

const PINNED_PATHS = new Set(['/', '/blog', '/projects', '/guides', '/ai-tips', '/resume', '/about', '/contact']);

export const ACTIONS: SearchItem[] = [
    {
        id: 'action:home',
        type: 'action',
        title: 'Go Home',
        href: '/',
        description: 'Jump back to the home page',
        section: 'Action',
        priority: 120,
        keywords: ['home', 'start', 'landing']
    },
    {
        id: 'action:theme',
        type: 'action',
        title: 'Toggle Theme',
        href: '#toggle-theme',
        actionId: 'toggle-theme',
        description: 'Switch between light and dark mode',
        section: 'Action',
        priority: 110,
        keywords: ['theme', 'dark', 'light', 'color']
    },
    {
        id: 'action:copy-url',
        type: 'action',
        title: 'Copy Current URL',
        href: '#copy-current-url',
        actionId: 'copy-url',
        description: 'Copy the page link to your clipboard',
        section: 'Action',
        priority: 105,
        keywords: ['copy', 'url', 'share', 'link']
    }
];

export function normalize(value: string) {
    return value.toLowerCase().trim();
}

export function getQueryTokens(query: string) {
    return normalize(query)
        .split(/[\s/-]+/)
        .map((token) => token.trim())
        .filter(Boolean);
}

export function getTypeLabel(item: SearchItem) {
    const labels: Record<SearchItemType, string> = {
        page: 'Page',
        blog: 'Blog',
        guide: 'Guide',
        project: 'Project',
        aitip: 'AI Tip',
        action: 'Action'
    };

    return labels[item.type] || 'Item';
}

export function getAllItems(items: SearchItem[]) {
    return [...ACTIONS, ...items];
}

export function createFuse(items: SearchItem[]) {
    return new Fuse(items, {
        includeScore: true,
        ignoreLocation: true,
        threshold: 0.36,
        keys: [
            { name: 'title', weight: 0.5 },
            { name: 'keywords', weight: 0.25 },
            { name: 'description', weight: 0.15 },
            { name: 'section', weight: 0.1 }
        ]
    });
}

export function getPinnedResults(items: SearchItem[]) {
    return getAllItems(items)
        .filter((item) => item.type === 'action' || PINNED_PATHS.has(item.href))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);
}

export function getResults(query: string, items: SearchItem[], fuse: Fuse<SearchItem>) {
    if (!query) {
        return getPinnedResults(items);
    }

    const rawResults = fuse.search(query, { limit: 12 });
    const tokens = getQueryTokens(query);

    return rawResults
        .map(({ item, score = 1 }) => {
            let rank = item.priority + Math.round((1 - score) * 200);
            const title = normalize(item.title);
            const description = normalize(item.description || '');
            const keywords = normalize(item.keywords.join(' '));

            if (title === query) rank += 220;
            else if (title.startsWith(query)) rank += 140;
            else if (title.includes(query)) rank += 90;

            for (const token of tokens) {
                if (title.startsWith(token)) rank += 45;
                else if (title.includes(token)) rank += 25;
                if (keywords.includes(token)) rank += 18;
                if (description.includes(token)) rank += 12;
            }

            if (PINNED_PATHS.has(item.href)) rank += 10;
            return { item, rank };
        })
        .filter(({ rank, item }) => rank > item.priority)
        .sort((a, b) => b.rank - a.rank)
        .map(({ item }) => item)
        .slice(0, 8);
}
