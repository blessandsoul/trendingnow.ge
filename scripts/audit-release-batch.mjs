/** Structural/link audit. Does not grant editorial or publication approval. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [packageRoot, originalRoot] = process.argv.slice(2);
if (![packageRoot, originalRoot].every(p => p && path.isAbsolute(p))) throw Error('Two absolute package paths required');
const catalog = new Map(JSON.parse(fs.readFileSync(new URL('../src/features/storefront/data/discovery-pilot.json', import.meta.url), 'utf8')).map(p => [p.id,p]));
const load = root => fs.readdirSync(path.join(root,'articles')).filter(f => f.endsWith('.json')).map(file => {
  const raw = fs.readFileSync(path.join(root,'articles',file));
  return {file, raw, article:JSON.parse(raw)};
});
const originals = load(originalRoot);
const current = load(packageRoot);
const problems = [];
const expected = new Set(originals.map(x => x.article.slug));
const found = new Set();
const rows = current.map(({file,raw,article:a}) => {
  const issues = [];
  if (!expected.has(a.slug) || found.has(a.slug) || file !== `${a.slug}.json`) issues.push('slug identity mismatch');
  found.add(a.slug);
  const visible = [a.title,a.excerpt,a.bodyMarkdown].join('\n');
  if (/[\u0400-\u04ff]/u.test(visible)) issues.push('Cyrillic in public copy');
  if (!a.commercialBrief?.buyerDecision || !a.commercialBrief?.choiceReason) issues.push('missing buyer decision');
  if (!Array.isArray(a.productIDs) || !a.productIDs.length) issues.push('no products');
  const links = [...a.bodyMarkdown.matchAll(/\]\(([^\s)]+)\)/g)].map(m => m[1]);
  const normalized = links.map(h => h.replace('https://trendingnow.ge','').replace(/\/$/,''));
  for (const id of a.productIDs ?? []) {
    const product = catalog.get(id);
    if (!product) { issues.push(`unknown product ${id}`); continue; }
    if (!normalized.includes(`/products/${product.slug}`)) issues.push(`missing product link ${id}`);
    if (!a.sourceURLs?.includes(product.productUrl)) issues.push(`missing exact merchant source ${id}`);
  }
  for (const href of normalized.filter(h => h.startsWith('/products/find-'))) {
    if (!(a.productIDs ?? []).includes(href.replace('/products/find-',''))) issues.push(`undeclared linked product ${href}`);
  }
  const old = originals.find(x => x.article.slug === a.slug)?.article;
  const row = {slug:a.slug, revised:old?.bodyMarkdown !== a.bodyMarkdown, words:a.bodyMarkdown.split(/\s+/u).filter(Boolean).length,
    products:a.productIDs, sha256:crypto.createHash('sha256').update(raw).digest('hex'), issues};
  problems.push(...issues.map(i => `${a.slug}: ${i}`));
  return row;
});
for (const slug of expected) if (!found.has(slug)) problems.push(`missing original slug ${slug}`);
if (current.length !== 50 || originals.length !== 50) problems.push('expected exactly 50 originals and 50 current articles');
const tokenize = text => new Set(text.toLowerCase().replace(/\]\([^)]+\)/g,']').match(/[\p{L}\p{N}]+/gu));
const similarities = [];
for (let i=0;i<current.length;i++) for(let j=i+1;j<current.length;j++) {
  const a=tokenize(current[i].article.bodyMarkdown), b=tokenize(current[j].article.bodyMarkdown);
  const shared=[...a].filter(t=>b.has(t)).length;
  const score=shared/(a.size+b.size-shared);
  if(score>=0.45) similarities.push({a:current[i].article.slug,b:current[j].article.slug,score:Number(score.toFixed(3))});
}
console.log(JSON.stringify({files:current.length,revised:rows.filter(r=>r.revised).length,problems,similarityReview:similarities.sort((a,b)=>b.score-a.score),rows,
  scope:'Structure and exact catalog links only. Similarity flags need independent editorial judgment; no factual or publication approval.'},null,2));
process.exitCode=problems.length?1:0;
