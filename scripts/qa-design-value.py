"""Read-only rendered route inventory for the design/value audit. No form submissions."""
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts/design-value-20260908'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:3014'
routes = ['/', '/products', '/products?search=lamp', '/products?search=none-34382',
          '/login', '/register', '/reset-password', '/verify-account', '/cart',
          '/about-us', '/contact', '/faq', '/delivery', '/warranty', '/payment-methods',
          '/corporate-offer', '/blog', '/blog/tags', '/blog/missing-qa', '/blog/tags/missing-qa',
          '/missing-qa', '/discovery-preview', '/editorial-preview', '/order-success/missing-qa',
          '/dashboard', '/dashboard/favorites', '/dashboard/orders', '/admin', '/admin/products',
          '/admin/categories', '/admin/homepage', '/admin/orders', '/admin/users', '/admin/sessions']
legacy = re.findall(r"id: '([0-9]+)'", (ROOT/'src/features/storefront/data/currentCatalog.ts').read_text(encoding='utf-8'))
offers = json.loads((ROOT/'src/features/storefront/data/discovery-pilot.json').read_text(encoding='utf-8'))
routes += [f'/products/product-{id}' for id in legacy]
routes += [f'/products/{item["slug"]}' for item in offers]
package = Path('C:/Users/User/Desktop/AGENT/agents/seo-autocontent/content/trendingnow-50-20260907/articles')
routes += ['/editorial-preview/'+file.stem for file in package.glob('*.json')]
routes += [prefix+route for prefix in ['/en','/ru'] for route in ['/','/products','/blog','/about-us','/login','/contact']]
extract = r'''() => {
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[aria-hidden="true"],nextjs-portal')};
 const desc=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {text:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,160),color:s.color,background:s.backgroundColor,font:s.fontFamily,fontSize:s.fontSize,weight:s.fontWeight,radius:s.borderRadius,width:Math.round(r.width),height:Math.round(r.height)}};
 return {title:document.title,lang:document.documentElement.lang,text:(document.querySelector('main')||document.body).innerText,
 headings:[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(e=>({tag:e.tagName,...desc(e)})),
 links:[...document.querySelectorAll('a[href]')].filter(visible).map(e=>({href:e.getAttribute('href'),...desc(e)})),
 buttons:[...document.querySelectorAll('button')].filter(visible).map(desc),
 images:[...document.images].filter(visible).map(e=>({src:e.getAttribute('src'),alt:e.alt,loaded:e.complete&&e.naturalWidth>0})),
 header:document.querySelector('header')?.innerText,footer:document.querySelector('footer')?.innerText,
 placeholderLinks:[...document.querySelectorAll('a[href="#"],a[href=""]')].filter(visible).map(desc),
 duplicateIDs:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((v,i,a)=>a.indexOf(v)!==i)};
}'''
report = OUT/'routes.json'
rows = json.loads(report.read_text(encoding='utf-8')) if report.exists() else []
done = {(row['route'],row['width']) for row in rows if not row.get('error')}
jobs=[(route,390) for route in dict.fromkeys(routes)]
jobs += [(route,1440) for route in routes[:24] if 'missing' not in route]
jobs += [(f'/products/product-{legacy[0]}',1440),(f'/products/{offers[0]["slug"]}',1440)]
with sync_playwright() as p:
 browser=p.chromium.launch()
 for index,(route,width) in enumerate(jobs):
  if (route,width) in done: continue
  page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
  errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  try:
   response=page.goto(BASE+route,wait_until='domcontentloaded',timeout=60000)
   page.evaluate('document.fonts.ready')
   page.wait_for_timeout(600)
   page.locator('h1').first.wait_for(timeout=8000)
   # Trigger lazy images before inventorying their load state.
   for y in range(0,min(page.locator('body').bounding_box()['height'],22000).__ceil__(),700):
    page.evaluate('(y)=>window.scrollTo(0,y)',y)
    page.wait_for_timeout(35)
   page.evaluate('window.scrollTo(0,0)')
   page.wait_for_timeout(300)
   data=page.evaluate(extract)
   filename=f'{index:03}-{width}.png'
   page.screenshot(path=str(OUT/filename),full_page=True)
   row={'route':route,'width':width,'status':response.status,'finalURL':page.url,'screenshot':filename,'pageErrors':errors,**data}
   # Discover public article/tag routes from the actual rendered index.
   if route in ['/blog','/blog/tags'] and width==390:
    for link in data['links']:
     href=link['href']
     if href.startswith('/blog/') and href not in routes:
      routes.append(href);jobs.append((href,390))
   print(json.dumps({'route':route,'width':width,'status':response.status,'errors':len(errors),'h1':[h['text'] for h in data['headings'] if h['tag']=='H1']}),flush=True)
  except Exception as exc:
   row={'route':route,'width':width,'error':str(exc)[:500]}
   print(json.dumps(row),flush=True)
  rows=[r for r in rows if (r['route'],r['width'])!=(route,width)]
  rows.append(row)
  report.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
  page.close()
 browser.close()
