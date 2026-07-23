import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config';
import { sortItemsByDateDesc } from '../utils/data-utils';

export async function GET(context: APIContext) {
    // Gather all published written content
    const [blog, guides] = await Promise.all([
        getCollection('blog', ({ data }) => data.isPublished !== false),
        getCollection('guides', ({ data }) => data.isPublished !== false)
    ]);

    const items = [...blog, ...guides].sort(sortItemsByDateDesc);

    // Map each entry to its canonical URL path based on its collection
    const linkFor = (item: (typeof items)[number]) =>
        item.collection === 'guides' ? `/guides/${item.id}/` : `/blog/${item.id}/`;

    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site ?? 'https://sijosam.in',
        items: items.map((item) => ({
            title: item.data.title,
            description: item.data.excerpt,
            pubDate: item.data.publishDate,
            link: linkFor(item),
            categories: item.data.tags ?? []
        })),
        customData: `<language>en-us</language>`
    });
}