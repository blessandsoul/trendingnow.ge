import { describe, expect, it } from 'vitest';

import { toStorefrontUppercase } from './format';

describe('toStorefrontUppercase', () => {
  it('keeps Georgian text in readable Mkhedruli', () => {
    expect(toStorefrontUppercase('მაგალითად ასეთი')).toBe('მაგალითად ასეთი');
  });

  it('uppercases Latin while preserving Georgian', () => {
    expect(toStorefrontUppercase('Baseus მაგნიტური ქეისი')).toBe('BASEUS მაგნიტური ქეისი');
  });
});
