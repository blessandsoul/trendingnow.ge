import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, HEAD } from './[offerId]/route';
import { discoveryItems } from '@/features/storefront/lib/discovery-pilot';
const reviewedAt = Math.max(...discoveryItems.map(item => Date.parse(item.checkedAt))) + 1;
const context = (offerId: string) => ({params:Promise.resolve({offerId})});
afterEach(()=>vi.restoreAllMocks());
describe('merchant redirect allowlist', () => {
  it('redirects only to a reviewed destination and ignores caller URL parameters', async () => {
    vi.spyOn(Date,'now').mockReturnValue(reviewedAt);
    const log=vi.spyOn(console,'info').mockImplementation(()=>{});
    const result=await GET(new Request('https://trendingnow.ge/go/pcshop-2?url=https://evil.example'),context('pcshop-2'));
    expect(result.status).toBe(307);
    expect(result.headers.get('location')).toBe('https://pcshop.ge/shop/logitech-pebble-2-m350s-bluetooth-white/');
    expect(result.headers.get('cache-control')).toBe('no-store');
    expect(log).toHaveBeenCalledTimes(1);
  });
  it('does not log HEAD probes', async()=>{
    vi.spyOn(Date,'now').mockReturnValue(reviewedAt);
    const log=vi.spyOn(console,'info').mockImplementation(()=>{});
    expect((await HEAD(new Request('https://trendingnow.ge/go/pcshop-2'),context('pcshop-2'))).status).toBe(200);
    expect(log).not.toHaveBeenCalled();
  });
  it('fails closed on unknown or expired offers', async()=>{
    vi.spyOn(Date,'now').mockReturnValue(reviewedAt + 31 * 86400000);
    expect((await GET(new Request('https://trendingnow.ge/go/x'),context('pcshop-2'))).status).toBe(410);
    const missing = await GET(new Request('https://trendingnow.ge/go/x'),context('evil'));
    expect(missing.status).toBe(410);
    expect(missing.headers.get('content-type')).toContain('text/html');
    expect(await missing.text()).toContain('href="/products"');
  });
});
