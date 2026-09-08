"""Verify actual decoded product images in disposable local browser contexts."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts/card-photos-20260908'
OUT.mkdir(parents=True, exist_ok=True)
catalog = json.loads((ROOT / 'src/features/storefront/data/discovery-pilot.json').read_text(encoding='utf-8'))
items = catalog if isinstance(catalog, list) else catalog['items']
rows = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in [390, 1440]:
        context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        context.add_init_script("localStorage.setItem('trendingnow:saved-products:v1', JSON.stringify(['pcshop-1','pcshop-2'])); localStorage.setItem('trendingnow:compare-products:v1', JSON.stringify(['pcshop-1','pcshop-2']));")
        page = context.new_page()
        paths = ['/products', '/en/saved', '/en/compare'] + ['/products/' + item['slug'] for item in items]
        for path in paths:
            errors = []
            handler = lambda error: errors.append(str(error))
            page.on('pageerror', handler)
            try:
                response = page.goto('http://localhost:3014' + path, wait_until='domcontentloaded')
                page.locator('h1').first.wait_for()
                expected = 18 if path == '/products' else 2 if path in ['/en/saved', '/en/compare'] else 1
                images = page.locator('main img')
                expect(images).to_have_count(expected)
                for img in images.all():
                    img.scroll_into_view_if_needed()
                    img.evaluate('(img) => img.decode()')
                data = images.evaluate_all('(imgs) => imgs.map(i => ({src:i.currentSrc,alt:i.alt,width:i.naturalWidth,height:i.naturalHeight,fit:getComputedStyle(i).objectFit}))')
                assert all(i['width'] > 50 and i['height'] > 50 and i['alt'] and i['fit'] == 'contain' for i in data), data
                assert response.status == 200 and not errors, {'status': response.status, 'errors': errors}
                bounds = page.evaluate('({body:document.body.scrollWidth,viewport:innerWidth})')
                assert bounds['body'] <= bounds['viewport'] + 2, bounds
                overflow = page.locator('main h1,main h2,main p').evaluate_all('(els)=>els.filter(e=>!e.classList.contains("sr-only") && e.clientWidth && e.scrollWidth>e.clientWidth+2).map(e=>({text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth}))')
                assert not overflow, overflow
                page.evaluate('scrollTo(0,0)')
                screenshot = f'{width}-{path.strip("/").replace("/", "-")}.png'
                page.screenshot(path=str(OUT / screenshot), full_page=True)
                rows.append({'path': path, 'width': width, 'pass': True, 'images': data, 'screenshot': screenshot})
            except Exception as error:
                rows.append({'path': path, 'width': width, 'pass': False, 'error': repr(error), 'pageErrors': errors})
            page.remove_listener('pageerror', handler)
        context.close()
    browser.close()
(OUT / 'qa.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'pass': sum(r['pass'] for r in rows), 'total': len(rows), 'output': str(OUT)}))
raise SystemExit(0 if all(r['pass'] for r in rows) else 1)
