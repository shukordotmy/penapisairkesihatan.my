import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

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
  <text x="112" y="260" fill="#0b3f6f" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800">Penapis air yang sesuai.</text>
  <text x="112" y="320" fill="#0b3f6f" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800">Servis yang tetap ada.</text>
  <text x="112" y="420" fill="#526579" font-family="Arial, Helvetica, sans-serif" font-size="23">Jualan · semakan filter · servis sistem sedia ada</text>
  <text x="112" y="526" fill="#176fbd" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">penapisairkesihatan.my</text>
  <circle cx="914" cy="315" r="208" fill="#eef8fa"/>
  <circle cx="914" cy="315" r="177" fill="none" stroke="#cbeef1" stroke-width="2"/>
</svg>`;

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
]);
