import { discoveryItems, getDiscoveryOffer } from '@/features/storefront/lib/discovery-pilot';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const item = discoveryItems.find(candidate => candidate.id === offerId);
  const offer = item ? getDiscoveryOffer(item, Date.now()) : null;
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
  if (!offer) return new Response(`<!doctype html><html lang="ka"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>შეთავაზება გადასამოწმებელია | TrendingNow.ge</title><style>@font-face{font-family:Discovery;src:url('/fonts/NotoSansGeorgian-Variable.ttf')}*{box-sizing:border-box}body{margin:0;background:#f4f2ed;color:#101010;font:16px/1.7 Discovery,system-ui,sans-serif}header{padding:20px;border-bottom:1px solid #101010}header a{font-weight:700;color:inherit}main{max-width:800px;margin:8vh auto;padding:24px}h1{font-size:clamp(26px,5vw,44px);line-height:1.25;overflow-wrap:anywhere}.action{display:inline-flex;margin-top:20px;min-height:48px;padding:12px 20px;background:#092bb4;color:#fff;text-decoration:none}.action:focus-visible{outline:3px solid #101010;outline-offset:4px}</style></head><body><header><a href="/">TrendingNow.ge</a></header><main><h1>შეთავაზება გადასამოწმებელია</h1><p>ამ ბმულს ახლა ვერ დაგიდასტურებთ. სხვა ნივთის მოსაძებნად დაბრუნდი კატალოგში.</p><a class="action" href="/products">კატალოგის ნახვა →</a></main></body></html>`, { status: 410, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });
  // A redirect request is not a unique human click, purchase or commission.
  console.info(JSON.stringify({ event: 'merchant_outbound_redirect', offerId: offer.id, merchantId: item!.merchantId, at: new Date().toISOString() }));
  return new Response(null, { status: 307, headers: { ...headers, Location: offer.href } });
}

// Link checkers must not create an outbound event.
export async function HEAD(_request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const item = discoveryItems.find(candidate => candidate.id === offerId);
  const offer = item ? getDiscoveryOffer(item, Date.now()) : null;
  return new Response(null, { status: offer ? 200 : 410, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
}
