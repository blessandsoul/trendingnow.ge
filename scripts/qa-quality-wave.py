"""Rendered local release checks. Never submits forms or visits merchant checkout."""
import argparse
import ast
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts/quality-wave-20260908'
BASE = 'http://127.0.0.1:3014'
parser = argparse.ArgumentParser()
parser.add_argument('--smoke', action='store_true')
args = parser.parse_args()
OUT.mkdir(parents=True, exist_ok=True)
offers = json.loads((ROOT / 'src/features/storefront/data/discovery-pilot.json').read_text(encoding='utf-8'))
# Reuse the existing measured text-fragment check without executing its runner.
text_scan = next(ast.literal_eval(node.value) for node in ast.parse((ROOT/'scripts/qa-responsive-text.py').read_text(encoding='utf-8')).body if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == 'scan' for target in node.targets))
core = ['/', '/products', '/products?search=მაუსი', '/products?search=none-34382', '/saved', '/compare',
        '/login', '/register', '/reset-password', '/verify-account', '/cart', '/about-us', '/contact', '/faq',
        '/delivery', '/warranty', '/payment-methods', '/corporate-offer', '/blog', '/blog/tags', '/missing-qa',
        '/order-success/missing-qa', '/products/find-pcshop-1']
jobs = [(route, width) for route in (core[:6] if args.smoke else core) for width in ([390, 1440] if args.smoke else [360, 768, 1440])]
if not args.smoke:
    jobs += [(prefix+route, 390) for prefix in ['/en', '/ru'] for route in ['/', '/products', '/saved', '/compare', '/about-us', '/contact', '/login']]
    jobs += [('/', width) for width in [320, 1280, 1536, 1920]]
    jobs += [(f'/products/{item["slug"]}', 390) for item in offers]
    legacy = re.findall(r"id: '([0-9]+)'", (ROOT/'src/features/storefront/data/currentCatalog.ts').read_text(encoding='utf-8'))
    jobs += [(f'/products/product-{item}', 390) for item in legacy]
    package = Path('C:/Users/User/Desktop/AGENT/agents/seo-autocontent/content/trendingnow-50-20260907/articles')
    jobs += [('/editorial-preview/'+file.stem, 390) for file in package.glob('*.json')]
    jobs += [(route, 390) for route in ['/dashboard', '/dashboard/favorites', '/dashboard/orders', '/admin', '/admin/products', '/admin/categories', '/admin/homepage', '/admin/orders', '/admin/users', '/admin/sessions']]

extract = r'''() => {
 const visible = e => { const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[aria-hidden="true"],nextjs-portal'); };
 const clipped = e => { for(let p=e.parentElement;p;p=p.parentElement) {const x=getComputedStyle(p).overflowX;if(['auto','scroll','hidden','clip'].includes(x)&&p!==document.documentElement&&p!==document.body)return true;}return false; };
 const all=[...document.querySelectorAll('body *')].filter(visible);
 const overflow=all.filter(e=>{const r=e.getBoundingClientRect();return (r.right>innerWidth+2||r.left < -2)&&!clipped(e)}).map(e=>({tag:e.tagName,text:(e.textContent||'').trim().slice(0,100),right:Math.round(e.getBoundingClientRect().right)})).slice(0,30);
 return {h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),title:document.title,lang:document.documentElement.lang,
  overflow,bodyWidth:document.body.scrollWidth,viewport:innerWidth,headers:document.querySelectorAll('header[data-header-mode]').length,
  footer:document.querySelectorAll('[data-discovery-footer]').length,font:getComputedStyle(document.querySelector('main')||document.body).fontFamily,
  duplicateIDs:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((v,i,a)=>a.indexOf(v)!==i),
  brokenImages:[...document.images].filter(visible).filter(e=>!e.complete||e.naturalWidth===0).map(e=>e.getAttribute('src')),
  offers:document.querySelectorAll('[data-discovery-offer]').length,
  canonical:document.querySelector('link[rel="canonical"]')?.href,
  robots:document.querySelector('meta[name="robots"]')?.content,
  mainText:(document.querySelector('main')||document.body).innerText};
}'''
rows=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    for index,(route,width) in enumerate(dict.fromkeys(jobs)):
        page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.route('**/*',lambda request: request.continue_() if request.request.method in ['GET','HEAD','OPTIONS'] else request.abort())
        try:
            response=page.goto(BASE+route,wait_until='domcontentloaded',timeout=60000)
            page.locator('h1').first.wait_for(timeout=15000)
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(350)
            height=page.locator('body').bounding_box()['height']
            for y in range(0,min(int(height),16000),850):
                page.evaluate('(y)=>window.scrollTo(0,y)',y)
                page.wait_for_timeout(20)
            page.evaluate('window.scrollTo(0,0)')
            page.wait_for_timeout(350)
            data=page.evaluate(extract)
            data.update(page.evaluate(text_scan))
            data['loadedFonts']=page.evaluate("() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)")
            filename=f'{index:03}-{width}.png'
            page.screenshot(path=str(OUT/filename),full_page=True)
            row={'route':route,'width':width,'status':response.status,'finalURL':page.url,'screenshot':filename,'errors':errors,**data}
            print(json.dumps({key:row[key] for key in ['route','width','status','offers','overflow','errors']}),flush=True)
        except Exception as error:
            row={'route':route,'width':width,'error':str(error)[:500]}
            print(json.dumps(row),flush=True)
        rows.append(row)
        (OUT/('smoke.json' if args.smoke else 'routes.json')).write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
        page.close()
    browser.close()
