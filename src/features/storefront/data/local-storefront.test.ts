import { beforeEach, describe, expect, it } from 'vitest';

import {
  addLocalCartItem,
  clearLocalCart,
  getLocalCart,
  getLocalProducts,
  localProducts,
} from './local-storefront';

beforeEach(() => {
  clearLocalCart();
});

describe('getLocalProducts pagination', () => {
  it('clamps an out-of-range page to the final real page', () => {
    const result = getLocalProducts({ page: 99, limit: 12 });

    expect(result.pagination.totalPages).toBeGreaterThan(0);
    expect(result.pagination.page).toBe(result.pagination.totalPages);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it('reports only the number of real pages', () => {
    const result = getLocalProducts({ page: 1, limit: 12 });

    expect(result.pagination.totalPages).toBe(Math.ceil(result.pagination.totalItems / 12));
  });
});

describe('local cart persistence', () => {
  it('writes cart quantities to localStorage and restores the current cart view', () => {
    const product = localProducts[0];
    addLocalCartItem(product.slug, 2);

    expect(getLocalCart().items[0]).toMatchObject({
      quantity: 2,
      product: { slug: product.slug },
    });
    expect(JSON.parse(window.localStorage.getItem('trendingnow.cart.v1') ?? '[]')).toEqual([
      [product.slug, 2],
    ]);
  });
});
