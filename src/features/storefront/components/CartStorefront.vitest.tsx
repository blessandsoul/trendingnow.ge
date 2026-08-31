/* eslint-disable @next/next/no-img-element */

import type React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CartStorefront } from './CartStorefront';

const storefrontMocks = vi.hoisted(() => ({
  cart: {
    items: [
      {
        id: 'cart-item-1',
        quantity: 1,
        unitPrice: 129,
        lineTotal: 129,
        product: {
          id: 'product-1',
          slug: 'ergonomic-chair',
          name: 'Ergonomic Chair',
          description: null,
          brand: 'TrendingNow.ge',
          imageUrl: '/uploads/chair.webp',
          salePrice: 129,
          originalPrice: null,
          currency: 'GEL',
          isFeatured: false,
          isNew: false,
          isBestseller: false,
          category: { id: 'seating', slug: 'seating', name: 'Seating' },
        },
      },
    ],
    promo: null,
    summary: { itemCount: 1, subtotal: 129, discount: 0, shipping: 0, total: 129, currency: 'GEL' },
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ fill, alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    void fill;
    return <img alt={alt} {...props} />;
  },
}));

vi.mock('../hooks/useStorefront', () => ({
  useCart: () => ({ data: storefrontMocks.cart, isLoading: false }),
  useClearCart: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveCartItem: () => ({ mutate: vi.fn(), isPending: false }),
  useStorefrontHome: () => ({ data: { featuredProducts: [] } }),
  useUpdateCartItem: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('./NewsletterBand', () => ({ NewsletterBand: () => null }));
vi.mock('./OrderCheckoutDialog', () => ({ OrderCheckoutDialog: () => null }));
vi.mock('./ProductCard', () => ({ ProductCard: () => null }));
vi.mock('./StorefrontFooter', () => ({ StorefrontFooter: () => null }));
vi.mock('./StorefrontHeader', () => ({ StorefrontHeader: () => null }));

describe('CartStorefront', () => {
  it('links each cart product image and name to its localized detail page', () => {
    render(<CartStorefront />);

    const productLinks = screen.getAllByRole('link', { name: 'Ergonomic Chair' });

    expect(productLinks).toHaveLength(2);
    productLinks.forEach((link) => expect(link).toHaveAttribute('href', '/products/ergonomic-chair'));
  });
});
