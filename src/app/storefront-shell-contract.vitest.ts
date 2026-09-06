import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = path.resolve(process.cwd(), 'src');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(sourceRoot, relativePath), 'utf8');
}

function collectPageFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPageFiles(absolute);
    return entry.name === 'page.tsx' || entry.name === 'error.tsx' || entry.name === 'not-found.tsx'
      ? [absolute]
      : [];
  });
}

const storefrontShells = [
  'features/auth/components/AuthPageShell.tsx',
  'features/blog/pages/BlogShell.tsx',
  'features/storefront/components/CartStorefront.tsx',
  'features/storefront/components/FavoritesDashboard.tsx',
  'features/storefront/components/HomeStorefront.tsx',
  'features/storefront/components/OrderSuccessPage.tsx',
  'features/storefront/components/OrdersDashboard.tsx',
  'features/storefront/components/ProductDetailStorefront.tsx',
  'features/storefront/components/ProductsStorefront.tsx',
  'features/storefront/components/StorefrontInfoPage.tsx',
  'app/error.tsx',
  'app/not-found.tsx',
];

describe('storefront shell contract', () => {
  it('turns former generic layout entrances into aliases of the shared Bold shell', () => {
    expect(read('components/layout/Header.tsx')).toContain('export { StorefrontHeader as Header }');
    expect(read('components/layout/Footer.tsx')).toContain('export { StorefrontFooter as Footer }');
    expect(read('components/layout/MainLayout.tsx')).toContain('className="tn-page flex min-h-dvh flex-col"');
  });

  it('keeps every consumer surface on the shared header and footer', () => {
    for (const file of storefrontShells) {
      const source = read(file);
      expect(source, file).toContain('StorefrontHeader');
      expect(source, file).toContain('StorefrontFooter');
    }
  });

  it('prevents a public route from bypassing the protected compatibility entrances', () => {
    const forbidden = /@\/components\/layout\/(?:Header|Footer|MainLayout)|\.\.\/components\/layout\/(?:Header|Footer|MainLayout)/;
    const publicRouteFiles = collectPageFiles(path.join(sourceRoot, 'app'))
      .filter((file) => !file.includes(`${path.sep}admin${path.sep}`));

    for (const file of publicRouteFiles) {
      expect(fs.readFileSync(file, 'utf8'), path.relative(sourceRoot, file)).not.toMatch(forbidden);
    }
  });
});
