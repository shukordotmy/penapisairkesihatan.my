# Project context

## Business

- Public-facing name: Penapis Air Kesihatan.
- The full public-facing brand is exactly `Penapis Air Kesihatan`; do not add a generic retail-location prefix.
- Registered operator: CAHAYA SUKMAR (JM0510596X / 200803055593), a Johor business commenced on 24 March 2008.
- Public address: 84, Jalan Intan 12, Taman Cahaya Masai, 81700 Pasir Gudang, Johor, Malaysia.
- Public phone and WhatsApp: +60 17-710 6169 (`60177106169` for `wa.me`).
- Public business email: info@penapisairkesihatan.my.
- Public evidence supports water-filter sales, selection help, and servicing of existing/older water filters.
- The owner confirmed on 24 August 2026 that the business sells and services RO and mineral water-filter systems and water dispensers, and services indoor and outdoor home water filters. Brand/model compatibility, parts, stock, pricing and the exact work required must still be checked for each enquiry.
- Owner records list registered activities covering food and beverage supply, retail goods, food/beverage distribution and packaging, water containers, and water-filter equipment. Registration scope is not proof of the current catalogue, stock, pricing, or availability.
- Associated public pages:
  - Google Maps: https://www.google.com/maps/?cid=1732927229402855681
  - Facebook: https://www.facebook.com/penapisairMalaysiamurajimat0177106169/

## Content safety

- Do not publish unverified prices, opening hours, service coverage, warranty terms, current brands/models, authorized-dealer status, or payment methods.
- Do not claim that every brand can be serviced. Ask customers to send the brand/model and a photo for compatibility checks.
- Do not publish medical, disease-prevention, germ-removal, filtration-percentage, NSF, SIRIM, halal, “nano”, or laboratory-performance claims without current product-specific evidence.
- Describe the registered business as existing since 2008; do not claim the storefront or water-filter service has operated continuously since 2008 unless the owner confirms it.

## Website

- Canonical production URL: https://penapisairkesihatan.my
- Malay (`ms-MY`) is the primary language.
- Use Astro static output, semantic HTML, hand-written CSS, and minimal client JavaScript.
- GitHub Actions builds and deploys the site to GitHub Pages from `main`.
- The production build runs `scripts/seo-audit.mjs`; deployment also runs the Playwright/axe
  route suite and submits genuinely changed canonical URLs to IndexNow after a successful push.
- Maintain accurate sitemap `lastmod` dates: guide dates come from `src/data/site.ts` and other
  route dates live in `astro.config.mjs`. Never substitute the build date for a meaningful
  content-update date.
- Conversion priority: WhatsApp, then phone, then Google Maps directions.
- Keep the design clean, concise, image-balanced and editorial; avoid crowded copy-heavy pages, generic stock photography, unsupported badges, fake testimonials, excessive cards, gradients, and animation.

## Brand assets

- The owner-approved final source-locked `Penapis Air Kesihatan` asset package was retrieved from the owner-connected Google Drive on 21 August 2026.
- Canonical source: 495 × 334 px with SHA-256 `2f6d5afc6d950dae1ef53c6b2f9aaf12309d248b991506f665d5d977882a3c7b`.
- Primary artwork is generated directly from the approved reference. Do not redraw or reconstruct the droplet, S-shaped negative space, typography, spacing, or alignment.
- Use the supplied PNG/JPG variants for normal web placement. `ExactArtwork` SVG/PDF files intentionally embed the approved raster artwork and are not editable vector masters.
- Use the full primary logo on white whenever space permits; use icon-only exports for favicons, app icons, avatars, and very small placements.
- Keep generous clear space. Never alter aspect ratio, rotate, skew, change the relative scale of icon/text, or replace the typography.
- Website-ready approved assets live in `public/brand-wordmark.png`, `public/brand-logo.png`, `public/brand-logo-transparent.png`, `public/brand-logo-reversed.png`, `public/brand-icon.png`, and `public/favicon.ico`.
- `public/business-storefront-blue.webp` is an editorial image prepared on 24 August 2026 from the verified exact-business photo `01_worldorgs_google_photo_storefront.jpg` in the owner-connected Google Drive. The dated temporary promotion, camera watermark, right-side unsupported claims, and upper-left green sign were removed; the green-sign area was replaced with plain blue wall at the owner's direction. Treat it as a historical premises image, not proof of current brands, products, prices, or stock.
- `public/home-products-hot-cold-hero-v3.webp` is an AI-generated product hero image created on 24 August 2026 from current manufacturer documentation for a dual-outlet hot/cold point-of-use dispenser, ceramic candle, carbon block, spun-polypropylene sediment cartridge, and residential 1812 RO membrane proportions. It is intentionally unbranded and illustrative; do not treat it as documentary evidence of current models, brands, products, or stock.

## Source provenance

- Business facts were grounded on 20 August 2026 in the owner-connected Google Drive company-research folder, plus current public sources.
- When facts conflict, owner records and current official sources take priority.
