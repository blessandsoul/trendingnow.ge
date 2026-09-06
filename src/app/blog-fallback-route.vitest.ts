import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = path.resolve(process.cwd(), 'src', 'app');

const fallbackRoutes = [
  'blog/[slug]/page.tsx',
  'blog/tags/[tag]/page.tsx',
  '[locale]/blog/[slug]/page.tsx',
  '[locale]/blog/tags/[tag]/page.tsx',
];

describe('blog fallback routes', () => {
  it('keeps missing post and tag decisions request-dynamic', () => {
    for (const route of fallbackRoutes) {
      const source = fs.readFileSync(path.join(sourceRoot, route), 'utf8');
      expect(source, route).toContain("export const dynamic = 'force-dynamic';");
    }
  });
});
