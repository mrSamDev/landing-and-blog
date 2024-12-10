import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';
import { Copier } from './filescopier.ts';

// https://astro.build/config
export default defineConfig({
    site: 'https://sijosam.in',

    integrations: [
        mdx(),
        partytown({
            config: {
                forward: ['posthog']
            }
        }),
        sitemap(),
        tailwind({
            applyBaseStyles: false
        }),
        Copier()
    ],

    adapter: vercel()
});
