import { describe, expect, it } from 'vitest';
import { getDiscoveryFacts } from './discovery-facts';

describe('exact-device buyer facts', () => {
  it('binds each statement to the reviewed merchant SKU', () => {
    expect(getDiscoveryFacts({ id: 'pcshop-2', merchantSku: 'I31167' })?.en.join(' ')).toContain('not included');
    expect(getDiscoveryFacts({ id: 'pcshop-2', merchantSku: 'OTHER' })).toBeNull();
    expect(getDiscoveryFacts({ id: 'unknown', merchantSku: 'I31167' })).toBeNull();
  });
  it('keeps original source, review date and all three locales', () => {
    for (const item of [{id:'pcshop-1',merchantSku:'I28705'}, {id:'pcshop-2',merchantSku:'I31167'}]) {
      const facts = getDiscoveryFacts(item)!;
      expect(new URL(facts.source).protocol).toBe('https:');
      expect(facts.checkedAt).toBe('2026-09-08');
      for (const locale of ['ka', 'en', 'ru'] as const) expect(facts[locale]).toHaveLength(2);
    }
  });
});
