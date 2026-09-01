import { describe, expect, it } from 'vitest';

import { buildProductStructuredData } from './product-structured-data';

describe('buildProductStructuredData', () => {
  it('creates Product and BreadcrumbList schema from sellable product data', () => {
    const { breadcrumbJsonLd, productJsonLd } = buildProductStructuredData(
      {
        product: {
          id: 'product-1',
          slug: 'wireless-earbuds',
          name: 'Wireless Earbuds',
          description: '<p>Comfortable earbuds for every day.</p>',
          brand: 'TrendingNow.ge',
          imageUrl: '/uploads/earbuds.png',
          salePrice: 199,
          originalPrice: 249,
          currency: 'GEL',
          isFeatured: true,
          isNew: true,
          isBestseller: false,
          updatedAt: '2026-07-16T10:00:00.000Z',
          category: { id: 'audio', slug: 'audio', name: 'Audio' },
          gallery: [
            { type: 'image', url: '/uploads/earbuds.png', thumbnailUrl: '/uploads/earbuds-thumb.png', alt: 'Earbuds' },
            { type: 'video', url: '/uploads/earbuds.mp4', thumbnailUrl: '/uploads/earbuds-thumb.png', alt: 'Video' },
          ],
          attributes: {
            sku: 'CONT-EARBUDS',
            highlights: [],
            specificationGroups: [],
            featureCards: [],
            benefits: [],
            delivery: [],
            questions: [],
          },
        },
        relatedProducts: [],
        recentProducts: [],
      },
      'https://trendingnow.ge/products/wireless-earbuds',
    );

    expect(productJsonLd).toMatchObject({
      '@type': 'Product',
      name: 'Wireless Earbuds',
      sku: 'CONT-EARBUDS',
      brand: { '@type': 'Brand', name: 'TrendingNow.ge' },
      offers: {
        '@type': 'Offer',
        price: '199',
        priceCurrency: 'GEL',
        availability: 'https://schema.org/InStock',
        url: 'https://trendingnow.ge/products/wireless-earbuds',
      },
    });
    expect(productJsonLd.image).toEqual(['http://localhost:8000/uploads/earbuds.png']);
    expect(breadcrumbJsonLd.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'TrendingNow.ge', item: 'https://trendingnow.ge/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://trendingnow.ge/products' },
      { '@type': 'ListItem', position: 3, name: 'Wireless Earbuds', item: 'https://trendingnow.ge/products/wireless-earbuds' },
    ]);
  });
});
