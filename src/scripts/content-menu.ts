type ContentMenuNodes = {
    container: HTMLElement;
    menuButton: HTMLButtonElement;
    menuDropdown: HTMLElement;
};
function getContainer(target: Element | null) {
    return target?.closest<HTMLElement>('.content-menu-container') || null;
}
function getNodes(container: HTMLElement | null): ContentMenuNodes | null {
    if (!container) return null;
    const menuButton = container.querySelector<HTMLButtonElement>('.content-menu-button');
    const menuDropdown = container.querySelector<HTMLElement>('.content-menu-dropdown');
    if (!menuButton || !menuDropdown) return null;
    return { container, menuButton, menuDropdown };
}
function setMenuOpen(container: HTMLElement | null, isOpen: boolean) {
    const nodes = getNodes(container);
    if (!nodes) return;
    nodes.menuDropdown.toggleAttribute('hidden', !isOpen);
    nodes.menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
        nodes.menuDropdown.querySelector<HTMLElement>('.menu-item')?.focus();
    }
}
function getMarkdown(trigger: HTMLElement) {
    const title = trigger.dataset.title || '';
    const selector = trigger.dataset.selector || '.prose';
    const content = document.querySelector<HTMLElement>(selector);
    if (!content) return '';
    return `${title ? `# ${title}\n\n` : ''}${content.innerText}`;
}
async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error('Failed to copy markdown', error);
    }
}
function escapeHtml(text: string) {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (value) => map[value]);
}
function showMarkdownModal(markdown: string) {
    const modal = document.createElement('div');
    modal.className = 'markdown-modal';
    modal.innerHTML = `
        <div class="markdown-modal-overlay"></div>
        <div class="markdown-modal-content">
            <div class="markdown-modal-header">
                <h2>Markdown View</h2>
                <button class="markdown-modal-close" aria-label="Close">x</button>
            </div>
            <textarea class="markdown-modal-textarea" readonly>${escapeHtml(markdown)}</textarea>
            <div class="markdown-modal-footer">
                <button class="markdown-modal-copy-btn">Copy All</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const removeModal = () => modal.remove();
    const closeButton = modal.querySelector<HTMLButtonElement>('.markdown-modal-close');
    const copyButton = modal.querySelector<HTMLButtonElement>('.markdown-modal-copy-btn');
    const textArea = modal.querySelector<HTMLTextAreaElement>('.markdown-modal-textarea');
    closeButton?.addEventListener('click', removeModal);
    modal.querySelector('.markdown-modal-overlay')?.addEventListener('click', removeModal);
    copyButton?.addEventListener('click', async () => {
        if (!textArea) return;
        await copyToClipboard(textArea.value);
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2500);
    });
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        removeModal();
        document.removeEventListener('keydown', handleEscape);
    };
    document.addEventListener('keydown', handleEscape);
}
function updateExternalLinks() {
    const encodedUrl = encodeURIComponent(window.location.href);
    for (const container of document.querySelectorAll<HTMLElement>('.content-menu-container')) {
        container.querySelector<HTMLAnchorElement>('.open-claude-btn')?.setAttribute(
            'href',
            `https://claude.ai/new?q=Read%20from%20${encodedUrl}%20so%20I%20can%20ask%20questions%20about%20it.`
        );
        container.querySelector<HTMLAnchorElement>('.open-chatgpt-btn')?.setAttribute(
            'href',
            `https://chatgpt.com/?hints=search&prompt=Read+from+${encodedUrl}+so+I+can+ask+questions+about+it.`
        );
    }
}
export function initContentMenu() {
    updateExternalLinks();
    if ((window as typeof window & { __contentMenuInitialized?: boolean }).__contentMenuInitialized) {
        return;
    }
    (window as typeof window & { __contentMenuInitialized?: boolean }).__contentMenuInitialized = true;
    document.addEventListener('click', async (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const container = getContainer(target);
        if (target?.closest('.content-menu-button')) {
            event.preventDefault();
            event.stopPropagation();
            const isOpen = container?.querySelector('.content-menu-button')?.getAttribute('aria-expanded') === 'true';
            setMenuOpen(container, !isOpen);
            return;
        }
        const copyButton = target?.closest<HTMLElement>('.copy-markdown-btn');
        if (copyButton && container) {
            event.preventDefault();
            event.stopPropagation();
            const markdown = getMarkdown(copyButton);
            if (!markdown) return;
            await copyToClipboard(markdown);
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2500);
            setMenuOpen(container, false);
            container.querySelector<HTMLButtonElement>('.content-menu-button')?.focus();
            return;
        }
        const viewButton = target?.closest<HTMLElement>('.view-markdown-btn');
        if (viewButton && container) {
            event.preventDefault();
            event.stopPropagation();
            const markdown = getMarkdown(viewButton);
            if (!markdown) return;
            showMarkdownModal(markdown);
            setMenuOpen(container, false);
            container.querySelector<HTMLButtonElement>('.content-menu-button')?.focus();
            return;
        }
        if (!target?.closest('.content-menu-container')) {
            for (const menu of document.querySelectorAll<HTMLElement>('.content-menu-container')) {
                setMenuOpen(menu, false);
            }
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const container = getContainer(document.activeElement instanceof Element ? document.activeElement : null);
        const nodes = getNodes(container);
        const isOpen = nodes?.menuButton.getAttribute('aria-expanded') === 'true';
        if (!nodes || !isOpen) return;
        const items = [...nodes.menuDropdown.querySelectorAll<HTMLElement>('.menu-item')];
        const currentIndex = items.findIndex((item) => item === document.activeElement);
        if (event.key === 'Escape') {
            event.preventDefault();
            setMenuOpen(container, false);
            nodes.menuButton.focus();
            return;
        }
        if (!items.length) return;
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        items[(currentIndex + delta + items.length) % items.length]?.focus();
    });
    document.addEventListener('astro:page-load', updateExternalLinks);
    document.addEventListener('astro:after-swap', updateExternalLinks);
}
