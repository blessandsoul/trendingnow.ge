import { readFile } from 'node:fs/promises';

// Read-only probe. Evidence is printed for review, never auto-published.
const input = JSON.parse(await readFile(new URL('../docs/partners/pilot-candidates-2026-09-07.json', import.meta.url), 'utf8'));
function products(value) {
  if (Array.isArray(value)) return value.flatMap(products);
  if (!value || typeof value !== 'object') return [];
  const type = value['@type'];
  return [...(type === 'Product' || (Array.isArray(type) && type.includes('Product')) ? [value] : []), ...products(value['@graph'])];
}
async function check(item) {
  try {
    const response = await fetch(item.productUrl, { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'TrendingNow editorial link verification' } });
    const html = await response.text();
    const structured = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match => { try { return products(JSON.parse(match[1])); } catch { return []; } });
    const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]*>/g, '').trim());
    return { id: item.id, checkedAt: new Date().toISOString(), status: response.status, finalUrl: response.url, h1, products: structured.map(p => ({ name: p.name, sku: p.sku, brand: p.brand, offers: p.offers })), maintenance: /მიმდინარეობს ტექნიკური სამუშაოები/.test(html), bytes: html.length };
  } catch (error) { return { id: item.id, error: error.message, checkedAt: new Date().toISOString() }; }
}
for (let offset = 0; offset < input.products.length; offset += 3) {
  const results = await Promise.all(input.products.slice(offset, offset + 3).map(check));
  for (const result of results) console.log(JSON.stringify(result));
}
