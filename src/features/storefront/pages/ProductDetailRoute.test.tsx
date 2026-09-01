import { renderToStaticMarkup } from 'react-dom/server';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { getCopy } from '@/i18n/copy';
import type { StorefrontProductDetail } from '../types/storefront.types';

const productDetail: StorefrontProductDetail = {
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
    gallery: [],
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
};

vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('not found');
  }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/i18n/server', () => ({ getRequestCopy: vi.fn(async () => getCopy('ka')) }));
vi.mock('../lib/public-product', () => ({ getPublicProduct: vi.fn(async () => productDetail) }));
vi.mock('../hooks/useStorefront', () => ({
  useAddCartItem: () => ({ mutate: vi.fn(), isPending: false }),
  useFavoriteIds: () => ({ data: { productIds: [] } }),
  useProduct: (_slug: string, initialData?: StorefrontProductDetail) => ({ data: initialData, isLoading: false, error: null }),
  useToggleFavorite: () => ({ toggleFavorite: vi.fn(), isPending: false, variables: undefined }),
}));
vi.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ alt, src }: { alt: string; src: string }) => <span data-image-alt={alt} data-image-src={src} />,
}));
vi.mock('../components/StorefrontHeader', () => ({ StorefrontHeader: () => <header /> }));
vi.mock('../components/StorefrontFooter', () => ({ StorefrontFooter: () => <footer /> }));
vi.mock('../components/NewsletterBand', () => ({ NewsletterBand: () => null }));
vi.mock('../components/Reveal', () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe('ProductDetailRoute', () => {
  it('includes product content, canonical metadata, and both schemas in Georgian initial HTML', async () => {
    const { ProductDetailRoute } = await import('./ProductDetailRoute');
    const { generateMetadata } = await import('@/app/products/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: productDetail.product.slug }) });
    const page = await ProductDetailRoute({ slug: productDetail.product.slug });
    const html = renderToStaticMarkup(page);

    expect(metadata.alternates).toMatchObject({ canonical: 'https://trendingnow.ge/products/wireless-earbuds' });
    expect(html).toContain('<h1');
    expect(html).toContain('Wireless Earbuds');
    expect(html).toContain('Comfortable earbuds for every day.');
    expect(html).toContain('"@type":"Product"');
    expect(html).toContain('"@type":"BreadcrumbList"');
  }, 15_000);
});
