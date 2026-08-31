import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { currentCatalog } from './currentCatalog';
import { getProductVisuals } from './product-media';

describe('generated product visuals', () => {
  it('provides six optimized local images for every catalog product', () => {
    expect(currentCatalog.products).toHaveLength(18);

    for (const product of currentCatalog.products) {
      const visuals = getProductVisuals(product.id);

      expect(visuals).toHaveLength(6);
      for (const visual of visuals) {
        expect(existsSync(path.join(process.cwd(), 'public', visual))).toBe(true);
      }
    }
  });
});
