import { describe, expect, it } from 'vitest';
import { discoveryItems, getDiscoveryItem, getDiscoveryOffer, searchDiscovery } from './discovery-pilot';

const now = Math.max(...discoveryItems.map(item => Date.parse(item.checkedAt))) + 1;
describe('source-backed discovery pilot', () => {
  it('keeps 18 reviewed products distinct from legacy inventory', () => {
    expect(discoveryItems).toHaveLength(18);
    expect(new Set(discoveryItems.map(p => p.id)).size).toBe(18);
    expect(new Set(discoveryItems.map(p => p.productUrl)).size).toBe(18);
    expect(discoveryItems.every(p => p.slug.startsWith('find-') && typeof p.imageUrl === 'string' && p.imageUrl.startsWith('https://'))).toBe(true);
    expect(getDiscoveryItem('product-601100060835831')).toBeUndefined();
  });
  it('exposes only exact dated store offers', () => {
    for (const item of discoveryItems) {
      const offer = getDiscoveryOffer(item, Date.parse(item.checkedAt) + 1);
      expect(offer?.price).toBeGreaterThan(0);
      expect(offer?.disclosure).toBe('editorial');
      expect(offer?.href).toBe(item.productUrl);
    }
  });
  it('expires price and availability before expiring the link', () => {
    const item = discoveryItems[0];
    const checked = Date.parse(item.checkedAt);
    expect(getDiscoveryOffer(item, checked + 86400000)?.price).toBeNull();
    expect(getDiscoveryOffer(item, checked + 86400000)?.availability).toBe('unknown');
    expect(getDiscoveryOffer(item, checked + 30 * 86400000)).toBeNull();
  });
  it('does not promote a draft or accept arbitrary destination hosts', () => {
    expect(getDiscoveryOffer({ ...discoveryItems[0], status: 'draft' }, now)).toBeNull();
    expect(getDiscoveryOffer({ ...discoveryItems[0], productUrl: 'https://evil.example/item' }, now)).toBeNull();
  });
  it('searches exact model or SKU, understands Georgian/transliterated terms, and intersects category', () => {
    expect(searchDiscovery(' I31167 ', 'workspace', now).map(p=>p.id)).toEqual(['pcshop-2']);
    expect(searchDiscovery(' I31167 ', 'care', now)).toEqual([]);
    expect(searchDiscovery('მაუსი', '', now).map(p => p.id)).toEqual(['pcshop-1', 'pcshop-2', 'elite-2']);
    expect(searchDiscovery('laptop', '', now).map(p => p.id)).toEqual(['pcshop-10', 'pcshop-11', 'pcshop-12']);
    expect(searchDiscovery('mouse graphite', '', now).map(p => p.id)).toEqual(['pcshop-1']);
    expect(searchDiscovery('', '', now + 31 * 86400000)).toEqual([]);
  });
});
