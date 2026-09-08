import { describe, expect, it, vi } from 'vitest';
import { getLocalProducts } from '../data/local-storefront';
import { discoveryCatalogHref, normalizeCatalogParams } from './catalog-navigation';
import { apiClient } from '@/lib/api/axios.config';
import { storefrontService } from '../services/storefront.service';

vi.mock('@/lib/api/axios.config', () => ({ apiClient: { get: vi.fn() } }));

describe('discovery catalog navigation', () => {
  it.each(['home', 'tech', 'bag', 'gift', 'outdoor'])('resolves legacy %s links to real catalog results', (search) => {
    expect(getLocalProducts({ search }).items.length).toBeGreaterThan(0);
  });
  it('uses category filters and a labelled gift budget, not untranslated text search', () => {
    expect(discoveryCatalogHref('home')).toBe('/products?category=home');
    expect(discoveryCatalogHref('tech')).toBe('/products?category=tech');
    expect(discoveryCatalogHref('gift')).toBe('/products?maxPrice=60');
    expect(normalizeCatalogParams({ category: 'technology' }).category).toBe('tech');
    expect(normalizeCatalogParams({ category: 'office' }).category).toBe('workspace');
  });
  it('does not fabricate results for missing inventory or discard explicit filters', () => {
    expect(getLocalProducts({ search: 'lamp' }).items).toEqual([]);
    expect(getLocalProducts({ search: 'totally-missing-34991' }).items).toEqual([]);
    expect(getLocalProducts({ search: 'home', maxPrice: 0 }).items).toEqual([]);
    expect(normalizeCatalogParams({ category: 'care', search: 'home' })).toEqual({ category: 'care', search: 'home' });
  });
  it('sends the same normalized filters to the API', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { data: getLocalProducts({ category: 'home' }) } });
    await storefrontService.getProducts({ search: 'home' });
    expect(get).toHaveBeenCalledWith('/storefront/products', { params: { category: 'home', search: undefined } });
    get.mockRestore();
  });
});
