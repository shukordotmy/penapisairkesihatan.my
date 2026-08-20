import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://penapisairkesihatan.my',
  output: 'static',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
