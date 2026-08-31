import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceRoot = process.argv[2];
const outputRoot = path.join(projectRoot, 'public', 'storefront', 'products-ai');

if (!sourceRoot) {
  throw new Error('Pass the generated product-render directory as the first argument.');
}

const productDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (productDirectories.length !== 18) {
  throw new Error(`Expected 18 product directories, found ${productDirectories.length}.`);
}

let imageCount = 0;
let totalBytes = 0;

for (const productId of productDirectories) {
  const productSource = path.join(sourceRoot, productId);
  const productOutput = path.join(outputRoot, productId);
  const sourceFiles = (await readdir(productSource))
    .filter((name) => /^0[1-6]-.+\.png$/u.test(name))
    .sort();

  if (sourceFiles.length !== 6) {
    throw new Error(`Expected 6 PNG files for ${productId}, found ${sourceFiles.length}.`);
  }

  await mkdir(productOutput, { recursive: true });

  for (const sourceName of sourceFiles) {
    const outputName = `${sourceName.slice(0, 2)}.webp`;
    const info = await sharp(path.join(productSource, sourceName))
      .resize({ width: 1000, height: 1250, fit: 'cover', position: 'attention' })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(path.join(productOutput, outputName));

    imageCount += 1;
    totalBytes += info.size;
  }
}

console.log(JSON.stringify({ products: productDirectories.length, images: imageCount, totalBytes, outputRoot }));
