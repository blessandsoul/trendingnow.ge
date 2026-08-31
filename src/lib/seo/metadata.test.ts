import { describe, expect, it } from 'vitest';

import {
  buildCatalogMetadata,
  buildPrivateMetadata,
  buildProductMetadataPolicy,
  buildPublicMetadata,
  hasCatalogRefinement,
} from './metadata';

describe('SEO metadata', () => {
  it('builds a self-canonical translated public page with locale alternates', () => {
    const metadata = buildPublicMetadata(
      { title: 'Delivery | TrendingNow.ge', description: 'Delivery information.' },
      'en',
      '/delivery',
    );

    expect(metadata.alternates).toEqual({
      canonical: 'https://trendingnow.ge/en/delivery',
      languages: {
        ka: 'https://trendingnow.ge/delivery',
        en: 'https://trendingnow.ge/en/delivery',
        ru: 'https://trendingnow.ge/ru/delivery',
        'x-default': 'https://trendingnow.ge/delivery',
      },
    });
  });

  it('marks transactional pages as noindex while keeping links followable', () => {
    expect(buildPrivateMetadata({ title: 'Cart', description: 'Shopping cart.' }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it('indexes Georgian product URLs and canonicalizes untranslated variants to Georgian', () => {
    expect(buildProductMetadataPolicy('ka', 'wireless-earbuds')).toEqual({
      canonical: 'https://trendingnow.ge/products/wireless-earbuds',
      index: true,
    });
    expect(buildProductMetadataPolicy('en', 'wireless-earbuds')).toEqual({
      canonical: 'https://trendingnow.ge/products/wireless-earbuds',
      index: false,
    });
  });

  it('gives unfiltered localized catalog pages self canonicals and locale alternates', () => {
    expect(buildCatalogMetadata({ title: 'Products', description: 'Catalog.' }, 'en')).toMatchObject({
      alternates: {
        canonical: 'https://trendingnow.ge/en/products',
        languages: {
          ka: 'https://trendingnow.ge/products',
          en: 'https://trendingnow.ge/en/products',
          ru: 'https://trendingnow.ge/ru/products',
          'x-default': 'https://trendingnow.ge/products',
        },
      },
      robots: { index: true, follow: true },
    });
  });

  it('canonicalizes filtered and sorted catalog URLs to the Georgian catalog', () => {
    expect(buildCatalogMetadata({ title: 'Products', description: 'Catalog.' }, 'en', true)).toMatchObject({
      alternates: { canonical: 'https://trendingnow.ge/products' },
    });
    expect(hasCatalogRefinement({ category: 'audio' })).toBe(true);
    expect(hasCatalogRefinement({ sort: 'price-asc' })).toBe(true);
    expect(hasCatalogRefinement({})).toBe(false);
  });
});
