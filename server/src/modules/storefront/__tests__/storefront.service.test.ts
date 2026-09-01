import { describe, expect, it } from 'vitest';
import { getShippingAmount, mergeOrderItems } from '../storefront.service.js';

describe('storefront order rules', () => {
  it('merges duplicate product rows before calculating an order', () => {
    expect(mergeOrderItems([
      { productSlug: 'product-one', quantity: 2 },
      { productSlug: 'product-two', quantity: 1 },
      { productSlug: 'product-one', quantity: 3 },
    ])).toEqual([
      { productSlug: 'product-one', quantity: 5 },
      { productSlug: 'product-two', quantity: 1 },
    ]);
  });

  it('rejects a merged quantity above the per-product limit', () => {
    expect(() => mergeOrderItems([
      { productSlug: 'product-one', quantity: 60 },
      { productSlug: 'product-one', quantity: 40 },
    ])).toThrow('Maximum quantity per product is 99');
  });

  it('uses the server-owned delivery tariff', () => {
    expect(getShippingAmount('TBILISI')).toBe(5);
    expect(getShippingAmount('REGION')).toBe(8);
  });
});
