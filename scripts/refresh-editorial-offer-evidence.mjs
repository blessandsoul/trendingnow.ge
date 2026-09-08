import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Read-only merchant requests; writes an evidence receipt, never catalog stock.
const output = process.argv[2];
if (!output || !path.isAbsolute(output) || fs.existsSync(output)) throw new Error('Pass a new absolute receipt path.');
const catalog = JSON.parse(fs.readFileSync(new URL('../src/features/storefront/data/discovery-pilot.json', import.meta.url), 'utf8'));
function products(value) {
  if (Array.isArray(value)) return value.flatMap(products);
  if (!value || typeof value !== 'object') return [];
  return [...([value['@type']].flat().includes('Product') ? [value] : []), ...products(value['@graph'])];
}
const rows = [];
for (let offset = 0; offset < catalog.length; offset += 3) {
  rows.push(...await Promise.all(catalog.slice(offset, offset + 3).map(async item => {
    try {
      const response = await fetch(item.productUrl, {signal: AbortSignal.timeout(25000)});
      const html = await response.text();
      const structured = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match => {try{return products(JSON.parse(match[1]));}catch{return [];}});
      return {id:item.id, url:item.productUrl, checkedAt:new Date().toISOString(), status:response.status, finalUrl:response.url, htmlSha256:crypto.createHash('sha256').update(html).digest('hex'), h1:[...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>m[1].replace(/<[^>]*>/g,'').trim()), structuredProducts:structured.map(p=>({name:p.name,sku:p.sku,offers:p.offers})), stockVerification:'UNKNOWN', limitation:'Structured seller claims can disagree with visible stock. No independent availability confirmation.'};
    } catch(error) {return {id:item.id,url:item.productUrl,checkedAt:new Date().toISOString(),error:error.message,stockVerification:'UNKNOWN'};}
  })));
}
const receipt = {scope:'Merchant page retrieval, not product testing or publication approval',checkedAt:new Date().toISOString(),rows};
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({file:output,products:rows.length,http200:rows.filter(r=>r.status===200).length,errors:rows.filter(r=>r.error).length}));
