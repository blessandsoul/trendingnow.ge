import { describe, expect, it } from 'vitest';

import {
  DESCRIPTION_IMAGE_PRESETS,
  clampDescriptionImageWidth,
  createUploadedDescriptionImageAttributes,
  isProductDescriptionImageSrc,
  normalizeDescriptionImageAlign,
  serializeDescriptionImageAttributes,
} from './description-image-layout';

describe('description image layout', () => {
  it('exposes the named description-image width presets', () => {
    expect(DESCRIPTION_IMAGE_PRESETS).toEqual({
      small: 320,
      standard: 520,
      large: 720,
      full: 960,
    });
  });

  it('clamps drag widths to the supported range', () => {
    expect(clampDescriptionImageWidth(84)).toBe(160);
    expect(clampDescriptionImageWidth(615.8)).toBe(616);
    expect(clampDescriptionImageWidth(1_280)).toBe(960);
  });

  it('normalizes image alignment to a safe center fallback', () => {
    expect(normalizeDescriptionImageAlign('left')).toBe('left');
    expect(normalizeDescriptionImageAlign('right')).toBe('right');
    expect(normalizeDescriptionImageAlign('unexpected')).toBe('center');
    expect(normalizeDescriptionImageAlign(undefined)).toBe('center');
  });

  it('serializes only the persisted product image attributes', () => {
    expect(
      serializeDescriptionImageAttributes({
        src: '/uploads/storefront/product/detail-image.webp',
        alt: 'Example product',
        width: 1_450,
        align: 'right',
      }),
    ).toEqual({
      src: '/uploads/storefront/product/detail-image.webp',
      alt: 'Example product',
      width: 960,
      'data-align': 'right',
    });
  });

  it('creates standard, centered persisted metadata for every uploaded image', () => {
    const first = createUploadedDescriptionImageAttributes({
      src: '/uploads/storefront/product/first-detail.webp',
      alt: 'First product image',
    });
    const second = createUploadedDescriptionImageAttributes({
      src: '/uploads/storefront/product/second-detail.webp',
      alt: 'Second product image',
    });

    expect(first).toEqual({
      src: '/uploads/storefront/product/first-detail.webp',
      alt: 'First product image',
      width: 520,
      'data-align': 'center',
    });
    expect(second).toEqual({
      src: '/uploads/storefront/product/second-detail.webp',
      alt: 'Second product image',
      width: 520,
      'data-align': 'center',
    });
    expect(Object.keys(first)).toEqual(['src', 'alt', 'width', 'data-align']);
  });

  it('accepts a Unicode product filename returned by the uploader', () => {
    expect(
      isProductDescriptionImageSrc('/uploads/storefront/product/baseus-მაგნიტური-დამტენი-ქეისი-product-mrgio8ms.webp'),
    ).toBe(true);
  });
});
