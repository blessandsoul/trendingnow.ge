import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.argv[2];
if(!root || !path.isAbsolute(root)) throw new Error('Absolute package path required');
const original=path.join(root,'versions/before-commercial-rewrite-20260908');
const baseline=JSON.parse(fs.readFileSync(path.join(original,'manifest.json'),'utf8'));
const catalog=new Map(JSON.parse(fs.readFileSync(new URL('../src/features/storefront/data/discovery-pilot.json',import.meta.url),'utf8')).map(p=>[p.id,p]));
const errors=[], rows=[];
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
for(const entry of baseline){
  const beforeRaw=fs.readFileSync(path.join(original,entry.path));
  if(sha(beforeRaw)!==entry.sha256) errors.push(`${entry.slug}: original backup changed`);
  const afterPath=path.join(root,entry.path);
  if(!fs.existsSync(afterPath)){errors.push(`${entry.slug}: missing current article`);continue;}
  const before=JSON.parse(beforeRaw), afterRaw=fs.readFileSync(afterPath), after=JSON.parse(afterRaw);
  const brief=after.commercialBrief;
  const changed=before.bodyMarkdown!==after.bodyMarkdown;
  const issues=[];
  if(!changed) issues.push('body not revised');
  if(after.slug!==before.slug) issues.push('slug changed');
  if(after.reviewStatus!=='DRAFTED_HOLD') issues.push('revision must not claim publication approval');
  for(const field of ['buyerDecision','primaryProductID','format','choiceReason','intentOverlapRisk']) if(typeof brief?.[field]!=='string' || !brief[field].trim()) issues.push(`missing commercialBrief.${field}`);
  if(!Array.isArray(brief?.alternativeProductIDs)) issues.push('missing alternativeProductIDs');
  const ids=after.productIDs || [];
  if(!ids.includes(brief?.primaryProductID)) issues.push('primary product not declared');
  for(const id of brief?.alternativeProductIDs || []) if(!ids.includes(id)) issues.push(`alternative ${id} not declared`);
  const links=[...after.bodyMarkdown.matchAll(/\]\(([^\s)]+)\)/g)].map(m=>m[1]);
  for(const href of links){
    const match=href.replace('https://trendingnow.ge','').match(/^\/products\/find-([a-z0-9-]+)\/?$/);
    if(match && !ids.includes(match[1])) issues.push(`linked product ${match[1]} not declared`);
  }
  for(const id of ids){
    const product=catalog.get(id);
    if(!product){issues.push(`unknown product ${id}`);continue;}
    if(!links.some(href=>href.replace('https://trendingnow.ge','').replace(/\/$/,'')===`/products/find-${id}`)) issues.push(`missing same-site product link ${id}`);
  }
  const primary=catalog.get(brief?.primaryProductID);
  if(primary && !links.includes(primary.productUrl)) issues.push('missing exact primary merchant CTA');
  if(/[\u0400-\u04ff]/u.test([after.title,after.excerpt,after.bodyMarkdown].join(' '))) issues.push('Cyrillic in Georgian copy');
  const visibleCopy=[after.title,after.excerpt,after.bodyMarkdown].join(' ').replace(/\]\([^)]+\)/g,']');
  if(/\b(?:merchant|dated|snapshot|observed|retail|shortlist|same-site|buyer brief|buyer job)\b/i.test(visibleCopy)) issues.push('untranslated editorial workflow wording in Georgian copy');
  rows.push({slug:entry.slug,revised:changed,buyerDecision:brief?.buyerDecision,format:brief?.format,primaryProductID:brief?.primaryProductID,intentOverlapRisk:brief?.intentOverlapRisk,sha256:sha(afterRaw),issues});
  errors.push(...issues.map(issue=>`${entry.slug}: ${issue}`));
}
console.log(JSON.stringify({originalFiles:baseline.length,preservedOriginals:!errors.some(e=>e.includes('backup changed')),revised:rows.filter(r=>r.revised).length,errors,rows,scope:'Revision and link contract only. Commercial relevance, distinctive intent, claim support and publication require independent editorial review.'},null,2));
if(errors.length) process.exitCode=1;
