# penapisairkesihatan.my

Official static website for Penapis Air Kesihatan in Taman Cahaya Masai, Pasir Gudang, Johor.

## Local development

```sh
npm install
npm run dev
```

Production validation and build:

```sh
npm run build
```

`npm run build` also runs the static SEO audit. For the multi-viewport browser and
accessibility suite, start the preview server and run:

```sh
npm run preview
npm run qa
```

The `main` branch is deployed automatically to GitHub Pages by `.github/workflows/deploy.yml`.
The deployment is blocked if build, SEO, browser, or accessibility checks fail. After a
successful push deployment, changed canonical URLs are submitted to participating IndexNow
search engines; Google discovery continues through the XML sitemap and Search Console.

## Content updates

Verified contact and business data live in `src/data/site.ts`. Read `AGENTS.md` before changing claims, services, or business details.
