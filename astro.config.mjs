import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    site: 'https://sijosam.in',

    integrations: [
        mdx(),
        sitemap(),
        tailwind({
            applyBaseStyles: false
        })
    ],

    adapter: vercel()
});
