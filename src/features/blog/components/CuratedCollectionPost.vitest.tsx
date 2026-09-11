import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CuratedCollectionPost } from './CuratedCollectionPost';
import type { AcceptedCollection } from '../lib/accepted-collections';

vi.mock('@/features/storefront/components/DiscoveryProductImage', () => ({
  DiscoveryProductImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('./TableOfContents', () => ({ TableOfContents: () => <nav data-testid="toc" /> }));

const collection = {
  schemaVersion: 1,
  slug: 'workspace-choice',
  status: 'READY',
  reviewStatus: 'accepted',
  reviewedAt: '2026-09-08T12:00:00.000Z',
  contentHash: 'a'.repeat(64),
  reviewedHash: 'a'.repeat(64),
  title: 'სამუშაო სივრცის ზუსტი არჩევანი',
  excerpt: 'ერთი კონკრეტული არჩევანი სამუშაო მაგიდისთვის.',
  bodyMarkdown: '## არჩევანი',
  category: 'სამუშაო სივრცე',
  tags: ['სამუშაო'],
  productIDs: ['pcshop-1'],
  sourceURLs: ['https://pcshop.ge/shop/logitech-signature-m650l-bluetooth-graphite/'],
  sourceDate: '2026-09-08',
  disclosure: 'სარედაქციო ბმული; ეს არ არის ფასიანი განთავსება.',
  locale: 'ka',
  isFallback: false,
  renderedBody: '<h2 id="არჩევანი">არჩევანი</h2><p>შეზღუდვები წყაროს მიხედვით.</p>',
  products: [{
    id: 'pcshop-1',
    slug: 'find-pcshop-1',
    name: 'Logitech Signature M650L Bluetooth Graphite',
    category: 'workspace' as const,
    imageUrl: 'https://pcshop.ge/wp-content/uploads/I28705.jpg',
    merchantName: 'PCShop',
    merchantSku: 'I28705',
    productUrl: 'https://pcshop.ge/shop/logitech-signature-m650l-bluetooth-graphite/',
    checkedAt: '2026-09-08T10:03:36.384Z',
    price: 99,
  }],
} satisfies AcceptedCollection;

describe('curated collection detail', () => {
  it('shows exact products before the body, dated price, source, disclosure and local product link', () => {
    render(<CuratedCollectionPost collection={collection} locale="ka" />);

    const productHeading = screen.getByRole('heading', { name: 'პროდუქტის მოკლე შეფასება' });
    const bodyText = screen.getByText('შეზღუდვები წყაროს მიხედვით.');
    expect(productHeading.compareDocumentPosition(bodyText) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole('img', { name: collection.products[0].name })[0]).toHaveAttribute('src', collection.products[0].imageUrl);
    expect(screen.getByText(/დაფიქსირებული ფასი/)).toBeInTheDocument();
    expect(screen.getByText(/99/)).toBeInTheDocument();
    expect(screen.getByText(collection.disclosure)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /პროდუქტის დეტალები/ })[0]).toHaveAttribute('href', '/products/find-pcshop-1');
    expect(screen.queryByRole('link', { name: /კალათ/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('collection-products')).toHaveAttribute('data-collection-format', 'single-product-review');
    expect(screen.getByTestId('collection-products').closest('article')).toHaveClass('storefront-reading-container');
    expect(screen.getByRole('heading', { name: 'პროდუქტის მოკლე შეფასება' })).toBeInTheDocument();
  });

  it('keeps comparison layouts for articles with more than one exact product', () => {
    render(<CuratedCollectionPost collection={{ ...collection, products: [collection.products[0], { ...collection.products[0], id: 'pcshop-2' }] }} locale="ka" />);

    expect(screen.getByTestId('collection-products')).toHaveAttribute('data-collection-format', 'multi-product-collection');
    expect(screen.getByRole('heading', { name: 'ზუსტი პროდუქტები' })).toBeInTheDocument();
  });
});
