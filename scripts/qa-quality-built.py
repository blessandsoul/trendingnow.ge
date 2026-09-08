"""Small production-build render check, separate from dev and live deployment."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parents[1]/'artifacts/quality-wave-20260908'
rows=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    for path in ['/', '/products', '/products/find-pcshop-1', '/saved', '/compare', '/login', '/contact']:
        for width in [390,1440]:
            page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.route('**/*',lambda r:r.continue_() if r.request.method in ['GET','HEAD','OPTIONS'] else r.abort())
            try:
                response=page.goto('http://127.0.0.1:3015'+path,wait_until='domcontentloaded')
                page.locator('h1').first.wait_for()
                page.evaluate('document.fonts.ready')
                page.wait_for_timeout(250)
                data=page.evaluate("() => ({font:getComputedStyle(document.body).fontFamily, loadedFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family), width:innerWidth, body:document.body.scrollWidth, headings:[...document.querySelectorAll('h1')].map(e=>e.textContent), offers:document.querySelectorAll('[data-discovery-offer]').length})")
                screenshot=f'built-{path.replace('/','_')}-{width}.png'
                page.screenshot(path=str(OUT/screenshot),full_page=True)
                row={'route':path,'width':width,'status':response.status,'errors':errors,'screenshot':screenshot,**data}
                assert response.status==200 and not errors and data['body']<=width+2, row
                assert 'Discovery Georgian' in data['loadedFonts'] and 'Discovery Anton' in data['loadedFonts'], row
                if path=='/products': assert data['offers']==18, row
                row['pass']=True
            except Exception as error:
                row={'route':path,'width':width,'pass':False,'error':repr(error)[:2000]}
            rows.append(row)
            (OUT/'built.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
            print(json.dumps(row),flush=True)
            page.close()
    browser.close()
