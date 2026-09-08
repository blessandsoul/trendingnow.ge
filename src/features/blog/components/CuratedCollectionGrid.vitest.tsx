import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CuratedCollectionGrid } from './CuratedCollectionGrid';
import type { AcceptedCollection } from '../lib/accepted-collections';

vi.mock('@/features/storefront/components/DiscoveryProductImage', () => ({
  DiscoveryProductImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

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
  disclosure: 'სარედაქციო ბმული.',
  locale: 'ka',
  isFallback: false,
  renderedBody: '<h2 id="არჩევანი">არჩევანი</h2>',
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

describe('curated collection index', () => {
  it('renders the exact discovery image and filters by the reviewed category', () => {
    const second = { ...collection, slug: 'kitchen-choice', category: 'სამზარეულო', title: 'სამზარეულოს არჩევანი' };
    render(<CuratedCollectionGrid collections={[collection, second]} locale="ka" />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: collection.products[0].name })[0]).toHaveAttribute('src', collection.products[0].imageUrl);
    expect(screen.getAllByRole('link', { name: /კოლექციის ნახვა/ })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'სამზარეულო' }));
    expect(screen.getAllByRole('link', { name: /კოლექციის ნახვა/ })).toHaveLength(1);
    expect(screen.getByText('სამზარეულოს არჩევანი')).toBeInTheDocument();
    expect(screen.queryByText(collection.title)).not.toBeInTheDocument();
  });

  it('accepts the empty public collection state without a fake card', () => {
    render(<CuratedCollectionGrid collections={[]} locale="ka" />);
    expect(screen.getAllByText('0 კოლექცია')).toHaveLength(2);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
