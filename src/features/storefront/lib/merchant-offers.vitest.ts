import { describe, expect, it } from 'vitest';
import { toPublicMerchantOffer, type Merchant, type MerchantOffer } from './merchant-offers';

const now = Date.parse('2026-09-07T12:00:00Z');
const merchant: Merchant = { id: 'test-store', name: 'Test Store', productHosts: ['store.example'] };
const offer: MerchantOffer = {
  id: 'offer-1', productId: 'lamp-1', merchantId: merchant.id, merchantSku: 'LAMP-BLUE',
  productUrl: 'https://store.example/products/lamp-blue', status: 'reviewed', match: 'exact',
  checkedAt: '2026-09-07T10:00:00Z', price: 50, currency: 'GEL',
  availability: 'in_stock', relationship: 'editorial',
};
const resolve = (change: Partial<MerchantOffer> = {}) => toPublicMerchantOffer({ ...offer, ...change }, merchant, 'lamp-1', now);

describe('source-backed external offers', () => {
  it('publishes exact reviewed offers without inventing affiliation', () => {
    expect(resolve()).toMatchObject({ merchantName: 'Test Store', price: 50, disclosure: 'editorial' });
    expect(resolve()).not.toHaveProperty('merchantSku');
    expect(resolve()).not.toHaveProperty('agreementReference');
  });
  it.each(['draft', 'withdrawn'] as const)('withholds %s offers', (status) => expect(resolve({ status })).toBeNull());
  it('withholds unverified model/variant matches', () => expect(resolve({ match: 'unverified' })).toBeNull());
  it('cannot substitute another product or merchant', () => {
    expect(resolve({ productId: 'different' })).toBeNull();
    expect(resolve({ merchantId: 'different' })).toBeNull();
    expect(resolve({ merchantSku: ' ' })).toBeNull();
  });
  it.each([
    'javascript:alert(1)', 'http://store.example/products/lamp',
    'https://store.example.evil.test/products/lamp', 'https://evil.test/products/lamp',
    'https://store.example@evil.test/products/lamp', 'https://user:pass@store.example/products/lamp',
    'https://store.example:444/products/lamp', 'https://store.example/',
    'https://store.example/search?q=lamp', 'https://store.example/cart',
  ])('rejects unsafe or non-product destination %s', (productUrl) => expect(resolve({ productUrl })).toBeNull());
  it('expires price and availability at 24 hours, keeping the dated source link', () => {
    expect(resolve({ checkedAt: '2026-09-06T12:00:00Z' })).toMatchObject({ price: null, availability: 'unknown' });
  });
  it.each(['bad-date', '2026-09-08T12:00:00Z', '2026-08-08T12:00:00Z'])('withholds invalid/future/expired review %s', (checkedAt) => expect(resolve({ checkedAt })).toBeNull());
  it.each([0, -1, NaN, Infinity])('rejects invalid price %s', (price) => expect(resolve({ price })).toBeNull());
  it('allows an unknown price without implying free', () => expect(resolve({ price: null })?.price).toBeNull());
  it('requires evidence of a paid agreement and marks paid links', () => {
    expect(resolve({ relationship: 'affiliate' })).toBeNull();
    expect(resolve({ relationship: 'sponsored' })).toBeNull();
    expect(resolve({ relationship: 'affiliate', agreementReference: 'internal-agreement' })?.rel).toContain('sponsored');
  });
});
