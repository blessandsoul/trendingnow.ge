import { describe, expect, it } from 'vitest';

import { toStorefrontUppercase } from './format';

describe('toStorefrontUppercase', () => {
  it('converts Georgian card text to Mtavruli', () => {
    expect(toStorefrontUppercase('მაგალითად ასეთი')).toBe('ᲛᲐᲒᲐᲚᲘᲗᲐᲓ ᲐᲡᲔᲗᲘ');
  });

  it('uppercases mixed Latin and Georgian card text', () => {
    expect(toStorefrontUppercase('Baseus მაგნიტური ქეისი')).toBe('BASEUS ᲛᲐᲒᲜᲘᲢᲣᲠᲘ ᲥᲔᲘᲡᲘ');
  });
});
