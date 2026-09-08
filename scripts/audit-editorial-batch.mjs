import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Mechanical inspection only: cannot certify factual support or Georgian quality.
const directory = process.argv[2];
if (!directory || !path.isAbsolute(directory)) throw new Error('Pass the absolute editorial package directory.');
const articleDirectory = path.join(directory, 'articles');
const knownProducts = new Set(JSON.parse(fs.readFileSync(new URL('../src/features/storefront/data/discovery-pilot.json', import.meta.url), 'utf8')).map(p => p.id));
const names = fs.existsSync(articleDirectory) ? fs.readdirSync(articleDirectory).filter(n=>n.endsWith('.json')).sort() : [];
const rows = [];
const technicalErrors = [];
const editorialWarnings = [];
const hashes = new Map();
const paragraphs = new Map();
const bodyShingles = [];
for (const name of names) {
  try {
    const raw = fs.readFileSync(path.join(articleDirectory, name), 'utf8');
    const data = JSON.parse(raw);
    for(const field of ['slug','title','excerpt','bodyMarkdown','category','reviewStatus']) if(typeof data[field] !== 'string' || !data[field].trim()) technicalErrors.push(`${name}: missing ${field}`);
    for(const field of ['tags','sourceURLs','productIDs','holdReasons']) if(!Array.isArray(data[field])) technicalErrors.push(`${name}: invalid ${field}`);
    if(`${data.slug}.json`!==name) technicalErrors.push(`${name}: filename/slug mismatch`);
    const body=String(data.bodyMarkdown || '');
    const title = String(data.title || '');
    const titleOccurrences = title ? body.split(title).length - 1 : 0;
    if(titleOccurrences > 1) editorialWarnings.push(`${name}: full title repeated ${titleOccurrences} times in body`);
    const normalized = (title ? body.split(title).join(' ') : body).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    const shingles = new Set(normalized.slice(0, -4).map((_, index) => normalized.slice(index, index + 5).join(' ')));
    for(const previous of bodyShingles) {
      const shared = [...shingles].filter(value => previous.shingles.has(value)).length;
      const containment = shared / Math.max(1, Math.min(shingles.size, previous.shingles.size));
      if(containment > 0.45) editorialWarnings.push(`${name}: ${Math.round(containment * 100)}% five-word overlap with ${previous.name}; editorial comparison required`);
    }
    bodyShingles.push({name, shingles});
    const words=body.split(/\s+/u).filter(Boolean).length;
    const digest=crypto.createHash('sha256').update(body).digest('hex');
    if(hashes.has(digest)) technicalErrors.push(`${name}: identical body to ${hashes.get(digest)}`);
    hashes.set(digest,name);
    if(words<400) editorialWarnings.push(`${name}: only ${words} whitespace-delimited words; batch target is 400-700`);
    if(/[\u0400-\u04ff]/u.test(`${data.title} ${body}`)) editorialWarnings.push(`${name}: Cyrillic in Georgian text`);
    if(!/[\u10a0-\u10ff\u1c90-\u1cbf]/u.test(body)) technicalErrors.push(`${name}: missing Georgian body`);
    if(/<script|javascript:|\bTODO\b|\bTBD\b|lorem ipsum/i.test(body)) technicalErrors.push(`${name}: unsafe or unfinished body marker`);
    for(const url of data.sourceURLs || []) { try {if(new URL(url).protocol!=='https:') throw new Error();}catch{technicalErrors.push(`${name}: invalid source URL ${url}`);} }
    if((data.sourceURLs || []).length<3) editorialWarnings.push(`${name}: fewer than 3 source URLs`);
    for(const id of data.productIDs || []) if(!knownProducts.has(id)) editorialWarnings.push(`${name}: product ${id} outside current exact catalog`);
    const linkedProductIDs = [...body.matchAll(/\]\((?:https:\/\/trendingnow\.ge)?\/products\/find-([a-z0-9-]+)\/?\)/g)].map(match => match[1]);
    if(!linkedProductIDs.length) editorialWarnings.push(`${name}: no same-site product link in article body`);
    for(const id of linkedProductIDs) if(!knownProducts.has(id) || !(data.productIDs || []).includes(id)) technicalErrors.push(`${name}: body product link ${id} does not match declared exact catalog products`);
    for(const paragraph of body.split(/\n\s*\n/u).map(p=>p.trim()).filter(p=>p.length>240)) {
      const pHash=crypto.createHash('sha256').update(paragraph).digest('hex');
      const previous=paragraphs.get(pHash);
      if(previous && previous!==name) editorialWarnings.push(`${name}: repeated long paragraph also in ${previous}`);
      paragraphs.set(pHash,name);
    }
    rows.push({slug:data.slug,title:data.title,words,sources:data.sourceURLs?.length || 0,products:data.productIDs || [],reviewStatus:data.reviewStatus,holdReasons:data.holdReasons || [],sha256:crypto.createHash('sha256').update(raw).digest('hex')});
  } catch(error) {technicalErrors.push(`${name}: ${error.message}`);}
}
console.log(JSON.stringify({target:50,files:names.length,drafted:rows.length,mechanicallyValid:technicalErrors.length===0,independentVerification:'not_measured',publication:'not_measured',totalWhitespaceWords:rows.reduce((n,r)=>n+r.words,0),technicalErrors,editorialWarnings,rows,limitations:'Mechanical inspection only. Source retrieval, claim entailment, semantic duplication, Georgian editing and publication admission remain separate.'},null,2));
if(technicalErrors.length) process.exitCode=1;
