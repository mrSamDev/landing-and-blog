export type SearchItemType = 'page' | 'blog' | 'guide' | 'project' | 'aitip' | 'action';
export type CommandActionId = 'toggle-theme' | 'copy-url';

export type SearchItem = {
    id: string;
    type: SearchItemType;
    title: string;
    href: string;
    description?: string;
    keywords: string[];
    section: string;
    priority: number;
    actionId?: CommandActionId;
};

export type CommandPaletteElements = {
    root: HTMLElement;
    input: HTMLInputElement;
    results: HTMLElement;
    status: HTMLElement;
};

export type CommandPaletteState = {
    isOpen: boolean;
    query: string;
    activeIndex: number;
    results: SearchItem[];
    previousFocus: Element | null;
};
