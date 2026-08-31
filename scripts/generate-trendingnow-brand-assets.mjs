import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const fontPath = path.join(projectRoot, 'public', 'fonts', 'NotoSans-Bold.ttf');
const brandDirectory = path.join(projectRoot, 'public', 'storefront', 'trendingnow');
const fontBase64 = (await readFile(fontPath)).toString('base64');

function wordmarkSvg({ dark }) {
  const primary = dark ? '#FFFFFF' : '#11141B';
  const suffix = dark ? '#C9CED7' : '#69717E';

  return Buffer.from(`
    <svg width="1600" height="320" viewBox="0 0 1600 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7C3AED"/>
          <stop offset="0.56" stop-color="#EC4899"/>
          <stop offset="1" stop-color="#FF4057"/>
        </linearGradient>
        <style>
          @font-face { font-family: 'TNBrand'; src: url(data:font/ttf;base64,${fontBase64}); font-weight: 700; }
          .brand { font-family: 'TNBrand', sans-serif; font-weight: 700; }
        </style>
      </defs>
      <g transform="translate(38 34)">
        <text class="brand" x="0" y="190" font-size="168" letter-spacing="-8" fill="${primary}">trending</text>
        <text class="brand" x="718" y="190" font-size="168" letter-spacing="-7" fill="url(#brand)">NOW</text>
        <text class="brand" x="1095" y="190" font-size="112" letter-spacing="-5" fill="${suffix}">.ge</text>
        <g transform="translate(1314 67) skewX(-18)">
          <rect x="0" y="98" width="72" height="42" rx="21" fill="#7C3AED"/>
          <rect x="82" y="54" width="72" height="86" rx="24" fill="#EC4899"/>
          <rect x="164" y="0" width="72" height="140" rx="26" fill="#10B981"/>
        </g>
      </g>
    </svg>
  `);
}

const faviconSvg = Buffer.from(`
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#191C23"/>
        <stop offset="1" stop-color="#090A0D"/>
      </linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#11141B" flood-opacity="0.24"/>
      </filter>
    </defs>
    <rect x="44" y="44" width="424" height="424" rx="122" fill="url(#tile)" filter="url(#shadow)"/>
    <g transform="translate(98 91) skewX(-18)">
      <rect x="0" y="192" width="92" height="106" rx="38" fill="#7C3AED"/>
      <rect x="112" y="104" width="92" height="194" rx="40" fill="#EC4899"/>
      <rect x="224" y="0" width="92" height="298" rx="42" fill="#10B981"/>
    </g>
    <circle cx="382" cy="374" r="25" fill="#FFFFFF"/>
  </svg>
`);

const lightLogo = await sharp(wordmarkSvg({ dark: false })).png({ compressionLevel: 9 }).toBuffer();
const darkLogo = await sharp(wordmarkSvg({ dark: true })).png({ compressionLevel: 9 }).toBuffer();
const favicon = await sharp(faviconSvg).png({ compressionLevel: 9 }).toBuffer();

await Promise.all([
  writeFile(path.join(brandDirectory, 'logo.png'), lightLogo),
  writeFile(path.join(brandDirectory, 'logo-dark.png'), darkLogo),
  writeFile(path.join(brandDirectory, 'favicon.png'), favicon),
  writeFile(path.join(projectRoot, 'src', 'app', 'icon.png'), favicon),
]);

console.log(JSON.stringify({
  logo: path.join(brandDirectory, 'logo.png'),
  darkLogo: path.join(brandDirectory, 'logo-dark.png'),
  favicon: path.join(brandDirectory, 'favicon.png'),
  appIcon: path.join(projectRoot, 'src', 'app', 'icon.png'),
}));
