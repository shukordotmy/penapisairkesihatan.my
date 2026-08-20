import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
await mkdir(publicDir, { recursive: true });

const socialSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f8fbfc"/>
  <rect x="42" y="42" width="1116" height="546" rx="24" fill="#ffffff" stroke="#d8e4ec" stroke-width="2"/>
  <rect x="42" y="94" width="12" height="442" fill="#08b8be"/>
  <text x="112" y="128" fill="#006d75" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="3">PASIR GUDANG · JOHOR</text>
  <text x="112" y="222" fill="#063b7a" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="800" letter-spacing="2">PENAPIS AIR</text>
  <line x1="112" y1="262" x2="182" y2="262" stroke="#08b8be" stroke-width="5"/>
  <text x="202" y="273" fill="#08b8be" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="10">KESIHATAN</text>
  <line x1="500" y1="262" x2="570" y2="262" stroke="#08b8be" stroke-width="5"/>
  <text x="112" y="365" fill="#0a2342" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700">Penapis air yang sesuai.</text>
  <text x="112" y="413" fill="#0a2342" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700">Servis yang tetap ada.</text>
  <text x="112" y="470" fill="#526579" font-family="Arial, Helvetica, sans-serif" font-size="23">Jualan · semakan filter · servis sistem sedia ada</text>
  <text x="112" y="526" fill="#063b7a" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">penapisairkesihatan.my</text>
  <circle cx="914" cy="315" r="208" fill="#eef8fa"/>
  <circle cx="914" cy="315" r="177" fill="none" stroke="#cbeef1" stroke-width="2"/>
  <g transform="translate(779 153) scale(.9)">
    <path d="M148 8c-21 59-53 90-80 123-34 41-44 82-33 130 12 49 49 79 98 90-23-22-24-57-5-83 20-27 52-40 80-60 29-20 42-42 38-67-3-23-21-44-41-65-22-23-43-48-57-68Z" fill="#063b7a"/>
    <path d="M252 166c-7 28-24 51-51 67-29 18-56 32-64 59-7 23 2 46 18 60 47 0 87-24 106-63 19-38 14-84-9-123Z" fill="#08b8be"/>
  </g>
</svg>`;

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#ffffff"/>
  <circle cx="256" cy="256" r="210" fill="#eef8fa"/>
  <g transform="translate(106 76)">
    <path d="M148 8c-21 59-53 90-80 123-34 41-44 82-33 130 12 49 49 79 98 90-23-22-24-57-5-83 20-27 52-40 80-60 29-20 42-42 38-67-3-23-21-44-41-65-22-23-43-48-57-68Z" fill="#063b7a"/>
    <path d="M252 166c-7 28-24 51-51 67-29 18-56 32-64 59-7 23 2 46 18 60 47 0 87-24 106-63 19-38 14-84-9-123Z" fill="#08b8be"/>
  </g>
</svg>`;

await Promise.all([
  sharp(Buffer.from(socialSvg)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'social-preview.png')),
  sharp(Buffer.from(iconSvg)).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'apple-touch-icon.png')),
]);
