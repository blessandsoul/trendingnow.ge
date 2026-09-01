import { describe, expect, it } from 'vitest';

import { formatStorefrontDate, toStorefrontUppercase } from './format';

describe('toStorefrontUppercase', () => {
  it('keeps Georgian text in readable Mkhedruli', () => {
    expect(toStorefrontUppercase('მაგალითად ასეთი')).toBe('მაგალითად ასეთი');
  });

  it('uppercases Latin while preserving Georgian', () => {
    expect(toStorefrontUppercase('Baseus მაგნიტური ქეისი')).toBe('BASEUS მაგნიტური ქეისი');
  });
});

describe('formatStorefrontDate', () => {
  it('uses deterministic storefront month names for every public locale', () => {
    const value = '2026-08-27T15:25:32Z';

    expect(formatStorefrontDate(value, 'ka')).toBe('27 აგვისტო 2026');
    expect(formatStorefrontDate(value, 'en')).toBe('27 Aug 2026');
    expect(formatStorefrontDate(value, 'ru')).toBe('27 августа 2026');
  });
});
