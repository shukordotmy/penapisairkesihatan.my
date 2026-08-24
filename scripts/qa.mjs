import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));

if (!executablePath) {
  throw new Error('Chrome/Chromium not found. Set CHROME_PATH before running npm run qa.');
}

const routes = [
  '/',
  '/servis-penapis-air-pasir-gudang/',
  '/penapis-air-rumah/',
  '/tukar-filter/',
  '/panduan/',
  '/panduan/cara-pilih-penapis-air-rumah/',
  '/panduan/bila-perlu-tukar-filter-penapis-air/',
  '/panduan/tanda-penapis-air-perlu-servis/',
  '/panduan/penapis-air-ro-atau-mineral/',
  '/panduan/penapis-air-indoor-atau-outdoor/',
  '/tentang/',
  '/hubungi/',
  '/soalan-lazim/',
  '/privasi/',
  '/terma/',
  '/definitely-not-found/',
];

const browser = await chromium.launch({ executablePath, headless: true });
const report = [];
let failed = false;

for (const viewport of [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  const context = await browser.newContext({ viewport });

  for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const audit = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const overflow = [...document.querySelectorAll('body *')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === 'string' ? element.className : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((item) => item.width > 0 && (item.right > viewportWidth + 2 || item.left < -2))
        .slice(0, 12);

      const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => {
        try {
          JSON.parse(script.textContent || '');
          return true;
        } catch {
          return false;
        }
      });

      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        lang: document.documentElement.lang,
        h1Count: document.querySelectorAll('h1').length,
        jsonLd,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth,
        overflow,
        unnamedLinks: [...document.querySelectorAll('a')].filter((link) => !(link.textContent || '').trim() && !link.getAttribute('aria-label')).length,
        imagesMissingAlt: [...document.querySelectorAll('img')].filter((image) => !image.hasAttribute('alt')).length,
      };
    });

    await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
    const axe = await page.evaluate(async () => {
      const result = await globalThis.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
        targets: violation.nodes.slice(0, 4).map((node) => node.target.join(' ')),
      }));
    });

    if (route === '/') {
      await page.screenshot({ path: path.join(os.tmpdir(), `penapis-home-${viewport.name}-playwright.png`), fullPage: true });
    }

    const problems = [
      response?.status() !== (route === '/definitely-not-found/' ? 404 : 200) && `status ${response?.status()}`,
      audit.h1Count !== 1 && `h1 count ${audit.h1Count}`,
      !audit.title && 'missing title',
      !audit.description && 'missing description',
      !audit.canonical && 'missing canonical',
      audit.lang !== 'ms-MY' && `lang ${audit.lang}`,
      audit.jsonLd.some((valid) => !valid) && 'invalid JSON-LD',
      audit.scrollWidth > audit.viewportWidth + 2 && `horizontal overflow ${audit.scrollWidth}/${audit.viewportWidth}`,
      audit.unnamedLinks > 0 && `${audit.unnamedLinks} unnamed links`,
      audit.imagesMissingAlt > 0 && `${audit.imagesMissingAlt} images missing alt`,
      consoleErrors.length > 0 && route !== '/definitely-not-found/' && `${consoleErrors.length} console errors`,
      pageErrors.length > 0 && `${pageErrors.length} page errors`,
      axe.some((violation) => ['critical', 'serious'].includes(violation.impact)) && 'serious axe violations',
    ].filter(Boolean);

    if (problems.length) failed = true;
    report.push({ viewport: viewport.name, route, status: response?.status(), problems, audit, axe, consoleErrors, pageErrors });
    await page.close();
  }

  await context.close();
}

await browser.close();
const failures = report.filter((item) => item.problems.length > 0);
const summary = {
  checks: report.length,
  passed: report.length - failures.length,
  failed: failures.length,
  failures: failures.map((item) => ({
    viewport: item.viewport,
    route: item.route,
    problems: item.problems,
    axe: item.axe,
    overflow: item.audit.scrollWidth > item.audit.viewportWidth + 2 ? item.audit.overflow : [],
    consoleErrors: item.consoleErrors,
    pageErrors: item.pageErrors,
  })),
};
console.log(JSON.stringify(process.env.QA_VERBOSE === '1' ? report : summary, null, 2));
if (failed) process.exitCode = 1;
