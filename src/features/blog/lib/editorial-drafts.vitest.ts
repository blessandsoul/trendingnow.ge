import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEditorialDrafts, renderEditorialMarkdown, editorialDraftSchema } from './editorial-drafts';

afterEach(()=>vi.unstubAllEnvs());
describe('development-only editorial reviewer',()=>{
  it('preserves an optional buying brief without treating it as publication approval',()=>{
    const data={slug:'buying-choice',title:'სათაური',excerpt:'არჩევანი',bodyMarkdown:'ტექსტი',category:'home',tags:[],sourceURLs:[],productIDs:['elite-6'],reviewStatus:'DRAFTED_HOLD',holdReasons:['review pending'],commercialBrief:{buyerDecision:'Выбор кофеварки',primaryProductID:'elite-6',format:'comparison',alternativeProductIDs:[],choiceReason:'Сопоставить затраты и удобство',intentOverlapRisk:'needs review'}};
    const parsed=editorialDraftSchema.parse(data);
    expect(parsed.commercialBrief?.buyerDecision).toBe('Выбор кофеварки');
    expect(parsed.reviewStatus).toBe('DRAFTED_HOLD');
    expect(editorialDraftSchema.safeParse({...data,commercialBrief:{...data.commercialBrief,primaryProductID:''}}).success).toBe(false);
  });
  it('keeps canonical same-site product links inside the local reviewer',()=>{
    expect(renderEditorialMarkdown('[product](https://trendingnow.ge/products/find-pcshop-1/)')).toContain('href="/products/find-pcshop-1/"');
    expect(renderEditorialMarkdown('[store](https://pcshop.ge/shop/item/)')).toContain('href="https://pcshop.ge/shop/item/"');
    expect(renderEditorialMarkdown('[odd](https://trendingnow.ge//example.com/path)')).not.toContain('href="//example.com');
  });
  it('reserves the single page h1 for the article title',()=>{
    expect(renderEditorialMarkdown('# Title\n\n## Section')).toBe('<h2>Title</h2><h2>Section</h2>');
  });
  it('never loads draft files in production, even with configured source directory',()=>{
    vi.stubEnv('NODE_ENV','production');
    vi.stubEnv('TRENDINGNOW_EDITORIAL_DRAFT_DIR','C:/Users/User/Desktop/AGENT');
    expect(getEditorialDrafts()).toEqual([]);
  });
  it('fails closed without an absolute configured directory',()=>{
    vi.stubEnv('NODE_ENV','development');
    vi.stubEnv('TRENDINGNOW_EDITORIAL_DRAFT_DIR','../secret');
    expect(getEditorialDrafts()).toEqual([]);
  });
  it('escapes raw HTML, removes image fetches, rejects unsafe links',()=>{
    const html=renderEditorialMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert%281%29)\n\n![remote](https://example.com/tracker.png)\n\n[store](https://pcshop.ge/shop/item/)');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="https://pcshop.ge/shop/item/"');
  });
  it('rejects missing content and source paths disguised as filenames',()=>{
    expect(editorialDraftSchema.safeParse({slug:'../../secret',title:'x'}).success).toBe(false);
  });
});
