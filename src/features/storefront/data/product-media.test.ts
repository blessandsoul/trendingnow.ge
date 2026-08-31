import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { currentCatalog } from './currentCatalog';
import {
  PRODUCT_IMAGE_SLOTS,
  PRODUCT_IMAGE_STANDARD_VERSION,
  getProductVisualEntries,
  getProductVisuals,
} from './product-media';

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

  it('enforces one semantic six-slot sequence for every product', () => {
    expect(PRODUCT_IMAGE_STANDARD_VERSION).toBe('tn-product-images.v1');
    expect(PRODUCT_IMAGE_SLOTS.map((slot) => slot.key)).toEqual([
      'hero',
      'catalog',
      'detail',
      'context',
      'benefit',
      'complete',
    ]);
    expect(new Set(PRODUCT_IMAGE_SLOTS.map((slot) => slot.filename)).size).toBe(6);

    for (const product of currentCatalog.products) {
      const entries = getProductVisualEntries(product.id);

      expect(entries.map((entry) => entry.key)).toEqual(PRODUCT_IMAGE_SLOTS.map((slot) => slot.key));
      expect(entries.map((entry) => entry.url)).toEqual(getProductVisuals(product.id));
    }
  });
});
