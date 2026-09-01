import { describe, expect, it } from 'vitest';

import { buildSupportMailto } from './support-mailto';

describe('buildSupportMailto', () => {
  it('prefills a support email without losing product or order context', () => {
    const href = buildSupportMailto('TrendingNow.ge · TN-42', ['Product: Test item', 'SKU: TN-42']);
    const url = new URL(href);

    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('contact@ainow.ge');
    expect(url.searchParams.get('subject')).toContain('TN-42');
    expect(url.searchParams.get('body')).toContain('SKU: TN-42');
  });
});
