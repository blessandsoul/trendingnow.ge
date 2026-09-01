import { describe, expect, it } from 'vitest';

import type { StorefrontProduct } from '../types/storefront.types';
import { selectComparableProducts } from './product-comparison';

function product(id: string, category: string): StorefrontProduct {
  return {
    id,
    slug: id,
    name: id,
    description: null,
    brand: 'TrendingNow',
    imageUrl: '/test.webp',
    salePrice: 10,
    originalPrice: null,
    currency: 'GEL',
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    updatedAt: '2026-09-01T00:00:00.000Z',
    category: { id: category, slug: category, name: category },
  };
}

describe('selectComparableProducts', () => {
  it('keeps only unique products from the same category', () => {
    const current = product('sport-1', 'sport');
    const same = product('sport-2', 'sport');
    const unrelated = product('home-1', 'home');

    expect(selectComparableProducts(current, [unrelated, same, same])).toEqual([same]);
  });
});
