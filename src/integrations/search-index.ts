import type { AstroIntegration } from 'astro';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

type SearchItem = {
    id: string;
    type: string;
    title: string;
    href: string;
    description?: string;
    keywords: string[];
    section: string;
    priority: number;
};

export default function searchIndex(): AstroIntegration {
    return {
        name: 'search-index',
        hooks: {
            'astro:config:setup': async ({ config, logger, command }) => {
                if (command !== 'build') return;

                logger.info('Generating search index...');

                const contentDir = join(fileURLToPath(config.srcDir), 'content');
                const siteConfig = parseSiteConfig(
                    readFileSync(join(fileURLToPath(config.srcDir), 'data', 'site-config.ts'), 'utf-8')
                );

                const items: SearchItem[] = [];

                // Nav links
                for (const link of siteConfig.headerNavLinks) {
                    items.push({
                        id: `nav:${link.href}`,
                        type: 'page',
                        title: link.text,
                        href: link.href,
                        section: 'Navigation',
                        priority: 100,
                        keywords: normalizeKeywords([link.text, 'navigation', link.href])
                    });
                }

                // Pages
                for (const page of readCollection(contentDir, 'pages')) {
                    items.push({
                        id: `page:${page.id}`,
                        type: 'page',
                        title: page.data.title,
                        href: `/${page.id}`,
                        description: page.data.seo?.description,
                        section: 'Page',
                        priority: page.id === 'about' || page.id === 'contact' ? 95 : 80,
                        keywords: normalizeKeywords([page.data.title, page.id, page.data.seo?.description])
                    });
                }

                // Blog posts
                for (const post of readCollection(contentDir, 'blog')) {
                    if (!post.data.isPublished) continue;
                    items.push({
                        id: `blog:${post.id}`,
                        type: 'blog',
                        title: post.data.title,
                        href: `/blog/${post.id}/`,
                        description: post.data.excerpt,
                        section: 'Blog',
                        priority: post.data.isFeatured ? 90 : 60,
                        keywords: normalizeKeywords([post.data.title, post.data.excerpt, ...(post.data.tags || []), 'blog'])
                    });
                }

                // Guides
                for (const guide of readCollection(contentDir, 'guides')) {
                    if (guide.data.isPublished === false) continue;
                    items.push({
                        id: `guide:${guide.id}`,
                        type: 'guide',
                        title: guide.data.title || '',
                        href: `/guides/${guide.id}/`,
                        description: guide.data.excerpt,
                        section: 'Guide',
                        priority: 65,
                        keywords: normalizeKeywords([guide.data.title, guide.data.excerpt, ...(guide.data.tags || []), 'guide', 'guides'])
                    });
                }

                // Projects
                for (const project of readCollection(contentDir, 'projects')) {
                    items.push({
                        id: `project:${project.id}`,
                        type: 'project',
                        title: project.data.title,
                        href: `/projects/${project.id}/`,
                        description: project.data.description,
                        section: 'Project',
                        priority: project.data.isFeatured ? 85 : 55,
                        keywords: normalizeKeywords([project.data.title, project.data.description, 'project', 'projects'])
                    });
                }

                // AI Tips
                for (const tip of readCollection(contentDir, 'aitips')) {
                    if (tip.data.isPublished === false) continue;
                    items.push({
                        id: `aitip:${tip.id}`,
                        type: 'aitip',
                        title: tip.data.title || '',
                        href: `/ai-tips#${tip.data.key}`,
                        description: tip.data.reference,
                        section: 'AI Tip',
                        priority: 50,
                        keywords: normalizeKeywords([tip.data.title, tip.data.key, tip.data.reference, 'ai', 'tip', 'prompt'])
                    });
                }

                // Dedupe by href, keep highest priority
                const deduped = new Map<string, SearchItem>();
                for (const item of items) {
                    const existing = deduped.get(item.href);
                    if (!existing || item.priority > existing.priority) {
                        deduped.set(item.href, item);
                    }
                }

                const index = [...deduped.values()];
                const srcPath = join(fileURLToPath(config.srcDir), 'generated', 'search-index.json');
                const publicPath = join(fileURLToPath(config.publicDir), 'search-index.json');

                mkdirSync(dirname(srcPath), { recursive: true });
                writeFileSync(srcPath, JSON.stringify(index), 'utf-8');
                writeFileSync(publicPath, JSON.stringify(index), 'utf-8');

                logger.info(`✓ Search index generated: ${index.length} items`);
            }
        }
    };
}

function normalizeKeywords(values: Array<string | undefined | null>): string[] {
    return [...new Set(values.flatMap((v) => (v ? v.toLowerCase().split(/\s+/).filter(Boolean) : [])))];
}

function readCollection(contentDir: string, collection: string): any[] {
    const dir = join(contentDir, collection);
    let files: string[];
    try {
        files = readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
    } catch {
        return [];
    }
    return files.map((file) => {
        const content = readFileSync(join(dir, file), 'utf-8');
        const { data } = parseFrontmatter(content);
        return { id: file.replace(/\.(mdx|md)$/, ''), data };
    });
}

function parseFrontmatter(content: string): { data: Record<string, any> } {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { data: {} };

    const data: Record<string, any> = {};
    let currentKey: string | null = null;
    let arrayBuffer: string[] = [];

    for (const line of match[1].split('\n')) {
        if (line.trim().startsWith('- ')) {
            arrayBuffer.push(line.trim().slice(2).replace(/^['"]|['"]$/g, ''));
            continue;
        }

        if (currentKey && arrayBuffer.length) {
            data[currentKey] = arrayBuffer;
            arrayBuffer = [];
            currentKey = null;
        }

        const [key, ...parts] = line.split(':');
        if (key && parts.length) {
            const value = parts.join(':').trim().replace(/^['"]|['"]$/g, '');
            if (value === '') {
                currentKey = key.trim();
            } else {
                data[key.trim()] = value === 'true' ? true : value === 'false' ? false : value;
            }
        }
    }

    if (arrayBuffer.length && currentKey) {
        data[currentKey] = arrayBuffer;
    }

    return { data };
}

function parseSiteConfig(content: string): { headerNavLinks: Array<{ text: string; href: string }> } {
    const match = content.match(/headerNavLinks:\s*\[([\s\S]*?)\]/);
    if (!match) return { headerNavLinks: [] };

    const texts = [...match[1].matchAll(/text:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const hrefs = [...match[1].matchAll(/href:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);

    return {
        headerNavLinks: texts.map((text, i) => ({ text, href: hrefs[i] }))
    };
}
