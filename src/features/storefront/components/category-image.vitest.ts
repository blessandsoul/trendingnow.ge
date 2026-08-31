import { describe, expect, it } from 'vitest';

import { resolveCategoryImageUrl } from './category-image';

describe('resolveCategoryImageUrl', () => {
  it('uses an administrator-selected category image in preference to generated artwork', () => {
    expect(
      resolveCategoryImageUrl({
        slug: 'smart-watch',
        imageUrl: '/uploads/storefront/category/edited-smart-watch.webp',
      }),
    ).toBe('/uploads/storefront/category/edited-smart-watch.webp');
  });

  it('falls back to the generated artwork when a supported category has no saved image', () => {
    expect(resolveCategoryImageUrl({ slug: 'smart-watch', imageUrl: null })).toBe(
      '/storefront/categories/smart-watch-category.png',
    );
  });

  it('does not invent an image for unrelated categories', () => {
    expect(resolveCategoryImageUrl({ slug: 'kitchen-appliances', imageUrl: null })).toBeUndefined();
  });
});
