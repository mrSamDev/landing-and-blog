import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config';

export type SearchItemType = 'page' | 'blog' | 'guide' | 'project' | 'aitip';

export type SearchItem = {
    id: string;
    type: SearchItemType;
    title: string;
    href: string;
    description?: string;
    keywords: string[];
    section: string;
    priority: number;
};

function normalizeKeywords(values: Array<string | undefined | null>) {
    return [...new Set(values.flatMap((value) => (value ? value.toLowerCase().split(/\s+/).filter(Boolean) : [])))];
}

function makeItem(item: SearchItem) {
    return {
        ...item,
        keywords: normalizeKeywords(item.keywords)
    };
}

export async function getSearchIndex() {
    const [pages, blogPosts, guides, projects, aiTips] = await Promise.all([
        getCollection('pages'),
        getCollection('blog'),
        getCollection('guides'),
        getCollection('projects'),
        getCollection('aitips')
    ]);

    const items: SearchItem[] = [];

    for (const link of siteConfig.headerNavLinks || []) {
        items.push(
            makeItem({
                id: `nav:${link.href}`,
                type: 'page',
                title: link.text,
                href: link.href,
                section: 'Navigation',
                priority: 100,
                keywords: [link.text, 'navigation', link.href]
            })
        );
    }

    for (const page of pages) {
        items.push(
            makeItem({
                id: `page:${page.id}`,
                type: 'page',
                title: page.data.title,
                href: `/${page.id}`,
                description: page.data.seo?.description,
                section: 'Page',
                priority: page.id === 'about' || page.id === 'contact' ? 95 : 80,
                keywords: [page.data.title, page.id, page.data.seo?.description]
            })
        );
    }

    for (const post of blogPosts.filter((entry) => entry.data.isPublished)) {
        items.push(
            makeItem({
                id: `blog:${post.id}`,
                type: 'blog',
                title: post.data.title,
                href: `/blog/${post.id}/`,
                description: post.data.excerpt,
                section: 'Blog',
                priority: post.data.isFeatured ? 90 : 60,
                keywords: [post.data.title, post.data.excerpt, ...(post.data.tags || []), 'blog']
            })
        );
    }

    for (const guide of guides.filter((entry) => entry.data.isPublished)) {
        items.push(
            makeItem({
                id: `guide:${guide.id}`,
                type: 'guide',
                title: guide.data.title,
                href: `/guides/${guide.id}/`,
                description: guide.data.excerpt,
                section: 'Guide',
                priority: 65,
                keywords: [guide.data.title, guide.data.excerpt, ...(guide.data.tags || []), 'guide', 'guides']
            })
        );
    }

    for (const project of projects) {
        items.push(
            makeItem({
                id: `project:${project.id}`,
                type: 'project',
                title: project.data.title,
                href: `/projects/${project.id}/`,
                description: project.data.description,
                section: 'Project',
                priority: project.data.isFeatured ? 85 : 55,
                keywords: [project.data.title, project.data.description, 'project', 'projects']
            })
        );
    }

    for (const tip of aiTips.filter((entry) => entry.data.isPublished)) {
        items.push(
            makeItem({
                id: `aitip:${tip.id}`,
                type: 'aitip',
                title: tip.data.title,
                href: `/ai-tips#${tip.data.key}`,
                description: tip.data.reference,
                section: 'AI Tip',
                priority: 50,
                keywords: [tip.data.title, tip.data.key, tip.data.reference, 'ai', 'tip', 'prompt']
            })
        );
    }

    const deduped = new Map<string, SearchItem>();

    for (const item of items) {
        const existing = deduped.get(item.href);
        if (!existing || item.priority > existing.priority) {
            deduped.set(item.href, item);
        }
    }

    return [...deduped.values()];
}
