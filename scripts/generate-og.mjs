import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { guides } from '../src/data/site.ts';

const publicDir = path.resolve('public');
await mkdir(publicDir, { recursive: true });

const primaryLogo = await sharp(path.join(publicDir, 'brand-logo-transparent.png'))
  .resize({ width: 300 })
  .png()
  .toBuffer();

const appIcon = await sharp(path.join(publicDir, 'brand-icon.png'))
  .resize({ width: 144, height: 144, fit: 'contain' })
  .png()
  .toBuffer();

const socialSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f8fbfc"/>
  <rect x="42" y="42" width="1116" height="546" rx="24" fill="#ffffff" stroke="#d8e4ec" stroke-width="2"/>
  <rect x="42" y="94" width="12" height="442" fill="#78cacf"/>
  <text x="112" y="128" fill="#006d75" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="3">PASIR GUDANG · JOHOR</text>
  <text x="112" y="260" fill="#0b3f6f" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800">Pilih dengan maklumat tepat.</text>
  <text x="112" y="320" fill="#0b3f6f" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800">Semak model sebelum servis.</text>
  <text x="112" y="420" fill="#526579" font-family="Arial, Helvetica, sans-serif" font-size="23">Jualan · semakan filter · servis sistem sedia ada</text>
  <text x="112" y="526" fill="#176fbd" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">penapisairkesihatan.my</text>
  <circle cx="914" cy="315" r="208" fill="#eef8fa"/>
  <circle cx="914" cy="315" r="177" fill="none" stroke="#cbeef1" stroke-width="2"/>
</svg>`;

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapTitle(value, maxCharacters = 26) {
  const lines = [];
  for (const word of value.split(/\s+/)) {
    const candidate = lines.length ? `${lines.at(-1)} ${word}` : word;
    if (lines.length && candidate.length > maxCharacters) lines.push(word);
    else if (lines.length) lines[lines.length - 1] = candidate;
    else lines.push(candidate);
  }
  return lines.slice(0, 3);
}

const articleSocialPromises = guides.map((guide) => {
  const titleLines = wrapTitle(guide.title);
  const titleMarkup = titleLines
    .map((line, index) => `<text x="84" y="${230 + (index * 64)}" fill="#0b3f6f" font-family="Arial, Helvetica, sans-serif" font-size="51" font-weight="800">${escapeXml(line)}</text>`)
    .join('');
  const articleSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#f8fbfc"/>
    <rect x="42" y="42" width="1116" height="546" rx="24" fill="#ffffff" stroke="#d8e4ec" stroke-width="2"/>
    <rect x="42" y="42" width="12" height="546" fill="#78cacf"/>
    <text x="84" y="112" fill="#006d75" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="2.5">${escapeXml(guide.category.toUpperCase())}</text>
    ${titleMarkup}
    <text x="84" y="520" fill="#526579" font-family="Arial, Helvetica, sans-serif" font-size="22">Panduan Penapis Air Kesihatan</text>
    <text x="84" y="554" fill="#176fbd" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">penapisairkesihatan.my</text>
    <circle cx="970" cy="315" r="142" fill="#eef8fa"/>
    <circle cx="970" cy="315" r="116" fill="none" stroke="#cbeef1" stroke-width="2"/>
  </svg>`;

  return sharp(Buffer.from(articleSvg))
    .composite([{ input: appIcon, left: 898, top: 243 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, `panduan-${guide.slug}-social.png`));
});

await Promise.all([
  sharp(Buffer.from(socialSvg))
    .composite([{ input: primaryLogo, left: 764, top: 213 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'social-preview.png')),
  sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([{ input: appIcon, left: 18, top: 18 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png')),
  sharp(path.join(publicDir, 'brand-wordmark.png'))
    .resize({ width: 384, withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(publicDir, 'brand-wordmark-384.png')),
  ...[768, 1200].map((width) =>
    sharp(path.join(publicDir, 'home-products-hot-cold-hero-v3.webp'))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(path.join(publicDir, `home-products-hot-cold-hero-${width}.webp`)),
  ),
  ...[768, 1200].map((width) =>
    sharp(path.join(publicDir, 'business-storefront-blue.webp'))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(path.join(publicDir, `business-storefront-blue-${width}.webp`)),
  ),
  ...articleSocialPromises,
]);
