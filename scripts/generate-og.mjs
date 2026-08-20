import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
await mkdir(publicDir, { recursive: true });

const socialSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f6f3eb"/>
  <rect x="42" y="42" width="1116" height="546" rx="18" fill="#123d38"/>
  <path d="M912 42h246v546H766c76-65 111-143 105-233-6-97-69-174-169-231 77-55 147-82 210-82Z" fill="#cfe9df"/>
  <circle cx="1000" cy="205" r="80" fill="none" stroke="#123d38" stroke-width="3"/>
  <path d="M1000 140c31 39 56 69 56 104a56 56 0 1 1-112 0c0-35 25-65 56-104Z" fill="#123d38"/>
  <path d="M973 248c6 16 18 25 34 25 11 0 21-4 28-12" fill="none" stroke="#f6f3eb" stroke-width="7" stroke-linecap="round"/>
  <text x="112" y="142" fill="#a9d8cc" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="3">PASIR GUDANG · JOHOR</text>
  <text x="112" y="258" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="70" font-weight="700">Penapis air yang sesuai.</text>
  <text x="112" y="340" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="70" font-weight="700">Servis yang tetap ada.</text>
  <line x1="112" y1="405" x2="650" y2="405" stroke="#608c84" stroke-width="2"/>
  <text x="112" y="458" fill="#dcebe6" font-family="Arial, Helvetica, sans-serif" font-size="29">Kedai Penapis Air Kesihatan</text>
  <text x="112" y="505" fill="#a9d8cc" font-family="Arial, Helvetica, sans-serif" font-size="23">Jualan · semakan filter · servis sistem sedia ada</text>
  <text x="806" y="520" fill="#123d38" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">penapisairkesihatan.my</text>
</svg>`;

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#123d38"/>
  <path d="M256 70c79 97 140 171 140 255a140 140 0 1 1-280 0c0-84 61-158 140-255Z" fill="#cfe9df"/>
  <path d="M177 340c13 45 47 70 87 70 27 0 51-11 69-31" fill="none" stroke="#123d38" stroke-width="25" stroke-linecap="round"/>
  <path d="M210 284h92" fill="none" stroke="#123d38" stroke-width="25" stroke-linecap="round"/>
</svg>`;

await Promise.all([
  sharp(Buffer.from(socialSvg)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'social-preview.png')),
  sharp(Buffer.from(iconSvg)).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'apple-touch-icon.png')),
]);
