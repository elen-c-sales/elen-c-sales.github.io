// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://elen.is-a.dev',
  integrations: [react(), mdx(), sitemap()],
  output: 'static',
  build: {
    assets: 'assets',
  },
  vite: {
    optimizeDeps: {
      include: ['zod'],
    },
  },
});