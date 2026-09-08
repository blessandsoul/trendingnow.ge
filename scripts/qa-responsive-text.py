"""Measure actual text fragments, including overflow hidden by page-level clipping."""
import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / 'artifacts/responsive-text'
out.mkdir(parents=True, exist_ok=True)
report = out / ('products.json' if '--products' in sys.argv else 'interactions.json' if '--interactions' in sys.argv else 'qa.json')
scan = r"""() => {
 const issues = []; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
 while(walker.nextNode()) {
  const node=walker.currentNode, el=node.parentElement;
  if(!node.textContent.trim() || !el || el.closest('script,style,noscript,nextjs-portal,[aria-hidden="true"],.sr-only')) continue;
  let box=el;
  while(box && ['inline','contents'].includes(getComputedStyle(box).display)) box=box.parentElement;
  if(!box) continue;
  const style=getComputedStyle(box), b=box.getBoundingClientRect();
  if(!b.width || !b.height || style.visibility==='hidden' || style.display==='none') continue;
  // Intentional ellipsis/line clamping is recorded separately, not overflowing copy.
  if(style.textOverflow==='ellipsis' || Number(style.webkitLineClamp)>0) continue;
  const range=document.createRange(); range.selectNodeContents(node);
  const rects=[...range.getClientRects()].filter(r=>r.width>0 && r.height>0);
  if(rects.some(r=>r.left < b.left-2 || r.right > b.right+2)) {
   issues.push({tag:box.tagName, text:node.textContent.trim().slice(0,110), width:Math.round(b.width), textRight:Math.round(Math.max(...rects.map(r=>r.right))-b.left), classes:box.className});
  }
 }
 return {pageWidth:document.documentElement.scrollWidth, viewport:innerWidth, textIssues:issues,
   headerSearchWidths:[...document.querySelectorAll('header input')].map(e=>e.getBoundingClientRect().width).filter(w=>w>0)};
}"""
public = ['/', '/products', '/products?search=none-34382', '/login', '/register', '/reset-password', '/verify-account', '/cart', '/about-us', '/contact', '/faq', '/delivery', '/warranty', '/payment-methods', '/corporate-offer', '/blog', '/blog/tags', '/blog/missing-qa', '/blog/tags/missing-qa', '/missing-qa', '/discovery-preview', '/editorial-preview', '/products/product-601100060835831', '/products/find-pcshop-10']
jobs = [('/', w) for w in [320,390,768,1024,1440]]
if '--products' in sys.argv:
    legacy = re.findall(r"id: '([0-9]+)'", (root/'src/features/storefront/data/currentCatalog.ts').read_text(encoding='utf-8'))
    offers = json.loads((root/'src/features/storefront/data/discovery-pilot.json').read_text(encoding='utf-8'))
    jobs = [(f'/products/product-{id}',320) for id in legacy] + [(f'/products/find-{item["id"]}',320) for item in offers]
if '--interactions' in sys.argv:
    jobs = [(route,w) for route in ['/','/products'] for w in [320,390,768,1024,1280,1440,1536]]
if '--all' in sys.argv:
    jobs = [(route,w) for route in public for w in [320,390,768,1440]]
    jobs += [(prefix+route,320) for prefix in ['/en','/ru'] for route in public if 'preview' not in route and 'find-' not in route]
    package = Path('C:/Users/User/Desktop/AGENT/agents/seo-autocontent/content/trendingnow-50-20260907/articles')
    jobs += [('/editorial-preview/'+file.stem,320) for file in package.glob('*.json')]
    jobs += [(route,320) for route in ['/dashboard','/dashboard/favorites','/dashboard/orders','/admin','/admin/products','/admin/categories','/admin/homepage','/admin/orders','/admin/users','/admin/sessions','/order-success/missing-qa']]
    jobs += [('/',1024),('/products',1024)]
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(reduced_motion='reduce')
    previous_route=None
    page_errors=[]
    rows=json.loads(report.read_text(encoding='utf-8')) if '--resume' in sys.argv else []
    completed={(r['route'],r['width']) for r in rows if not r.get('error') and not r.get('textIssues')}
    jobs=[job for job in jobs if job not in completed]
    for route,width in jobs:
        if previous_route != route:
            page.close()
            page=browser.new_page(reduced_motion='reduce')
            page_errors=[]
            page.on('pageerror',lambda error: page_errors.append(str(error)))
            previous_route=route
        page.set_viewport_size({'width':width,'height':900})
        try:
            url='http://127.0.0.1:3014'+route
            if page.url != url:
                response=page.goto(url,wait_until='domcontentloaded',timeout=60000)
            page.evaluate('document.fonts.ready')
            page.locator('body').wait_for()
            page.locator('h1').first.wait_for(timeout=10000)
            if '--interactions' in sys.argv:
                page.evaluate('window.scrollTo(0,0)')
                page.wait_for_timeout(350)
            result=page.evaluate(scan)
            result.update(route=route,width=width,status=response.status,finalURL=page.url,pageErrors=list(page_errors))
            if route=='/' or result['textIssues']:
                name=route.replace('/','_').replace('?','_').replace('=','_') or 'home'
                page.screenshot(path=str(out/f'{name}-{width}.png'),full_page=True)
            rows=[r for r in rows if (r['route'],r['width']) != (route,width)]
            rows.append(result)
            print(json.dumps({'route':route,'width':width,'issues':len(result['textIssues'])}),flush=True)
            if '--interactions' in sys.argv:
                if route=='/products' and width>=1024:
                    assert result['headerSearchWidths'] and min(result['headerSearchWidths'])>=160, result['headerSearchWidths']
                page.get_by_role('button',name=re.compile('მენიუ')).first.click()
                page.get_by_role('dialog').wait_for()
                states=[('menu',page.evaluate(scan))]
                page.keyboard.press('Escape')
                if route=='/products':
                    if width < 1024:
                        page.locator('button[aria-controls="catalog-filters"]').click()
                        states.append(('filters',page.evaluate(scan)))
                    page.evaluate('window.scrollTo(0,1200)')
                    page.wait_for_timeout(350)
                    for y in [1050,900]:
                        page.evaluate(f'window.scrollTo(0,{y})')
                        page.wait_for_timeout(350)
                        mode=page.locator('[data-header-mode]').get_attribute('data-header-mode')
                        states.append((mode,page.evaluate(scan)))
                result['states']=[{'state':name,**data} for name,data in states]
        except Exception as error:
            rows.append({'route':route,'width':width,'error':str(error)[:400]})
            print(json.dumps(rows[-1]),flush=True)
        report.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    browser.close()
