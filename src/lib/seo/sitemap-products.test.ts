import { describe, expect, it, vi } from 'vitest';

import { collectProductSitemapEntries } from './sitemap-products';

describe('collectProductSitemapEntries', () => {
  it('collects every active product page and preserves its update timestamp', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          { slug: 'wireless-earbuds', updatedAt: '2026-07-10T10:00:00.000Z' },
          { slug: 'smart-watch', updatedAt: '2026-07-12T12:00:00.000Z' },
        ],
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [{ slug: 'phone-case', updatedAt: '2026-07-13T14:00:00.000Z' }],
        totalPages: 2,
      });

    await expect(collectProductSitemapEntries(fetchPage)).resolves.toEqual([
      { url: 'https://continuum.ge/products/wireless-earbuds', lastModified: new Date('2026-07-10T10:00:00.000Z') },
      { url: 'https://continuum.ge/products/smart-watch', lastModified: new Date('2026-07-12T12:00:00.000Z') },
      { url: 'https://continuum.ge/products/phone-case', lastModified: new Date('2026-07-13T14:00:00.000Z') },
    ]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('fails closed so the sitemap can retain its static and blog entries', async () => {
    await expect(collectProductSitemapEntries(vi.fn().mockRejectedValue(new Error('API unavailable')))).resolves.toEqual([]);
  });
});
