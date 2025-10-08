import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
    site: 'https://sijosam.in',

    integrations: [
        mermaid({
            theme: 'dark',
            autoTheme: true
        }),
        mdx(),
        partytown({
            config: {
                forward: ['posthog']
            }
        }),
        sitemap()
    ],

    output: 'static',
    adapter: vercel(),
    vite: {
        plugins: [tailwindcss()]
    }
});
