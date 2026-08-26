import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { guides } from './src/data/site.ts';

const guideLastModifiedByPath = Object.fromEntries(
  guides.map((guide) => [`/panduan/${guide.slug}/`, guide.dateModified]),
);

const lastModifiedByPath = {
  '/': '2026-08-24',
  '/hubungi/': '2026-08-26',
  '/panduan/': '2026-08-24',
  ...guideLastModifiedByPath,
  '/penapis-air-rumah/': '2026-08-24',
  '/privasi/': '2026-08-20',
  '/servis-penapis-air-pasir-gudang/': '2026-08-24',
  '/soalan-lazim/': '2026-08-24',
  '/tentang/': '2026-08-24',
  '/terma/': '2026-08-20',
  '/tukar-filter/': '2026-08-24',
};

export default defineConfig({
  site: 'https://penapisairkesihatan.my',
  output: 'static',
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = lastModifiedByPath[new URL(item.url).pathname];
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
