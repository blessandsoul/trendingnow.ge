"""Bounded interaction, redirect and repair rechecks; no checkout or external mutation."""
import ast
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts/quality-wave-20260908'
BASE = 'http://127.0.0.1:3014'
offers = json.loads((ROOT/'src/features/storefront/data/discovery-pilot.json').read_text(encoding='utf-8'))
text_scan = next(ast.literal_eval(node.value) for node in ast.parse((ROOT/'scripts/qa-responsive-text.py').read_text(encoding='utf-8')).body if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='scan' for t in node.targets))
parser = argparse.ArgumentParser()
parser.add_argument('--repairs-only', action='store_true')
args = parser.parse_args()
proofs = json.loads((OUT/'extra.json').read_text(encoding='utf-8')) if args.repairs_only and (OUT/'extra.json').exists() else {}
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    context.route('**/*', lambda r: r.continue_() if r.request.method in ['GET','HEAD','OPTIONS'] else r.abort())
    page = context.new_page()
    errors=[]
    page.on('pageerror', lambda error: errors.append(str(error)))
    def visit(route):
        page.goto(BASE+route,wait_until='domcontentloaded')
        page.locator('h1').first.wait_for()
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(400)
    def save():
        (OUT/'extra.json').write_text(json.dumps(proofs,ensure_ascii=False,indent=2),encoding='utf-8')
    def check(name,callback):
        try: proofs[name]={'pass':True,'evidence':callback()}
        except Exception as error: proofs[name]={'pass':False,'error':repr(error)[:1200]}
        save()
        print(json.dumps({name:proofs[name]}),flush=True)
    def back():
        visit('/en/products')
        field=page.locator('main input').first
        field.fill('mausi')
        field.press('Enter')
        page.wait_for_url('**/products?search=mausi')
        page.locator('[data-discovery-offer="pcshop-1"] h2 a').click()
        page.wait_for_url('**/products/find-pcshop-1')
        page.go_back(wait_until='domcontentloaded')
        expect(page.locator('main input').first).to_have_value('mausi')
        expect(page.locator('[data-discovery-offer]')).to_have_count(3)
        return {'restoredQuery':True,'restoredResults':3,'url':page.url,'scrollY':page.evaluate('scrollY')}
    if not args.repairs_only: check('back_from_product',back)
    def redirect_checks():
        rows=[]
        for offer in offers:
            head=context.request.head(BASE+'/go/'+offer['id'],max_redirects=0)
            response=context.request.get(BASE+'/go/'+offer['id'],max_redirects=0)
            assert head.status==200 and response.status==307, offer['id']
            assert response.headers['location']==offer['productUrl'], offer['id']
            rows.append({'id':offer['id'],'head':head.status,'get':response.status,'exactLocation':True})
        missing=context.request.get(BASE+'/go/missing-qa',max_redirects=0)
        assert missing.status==410 and 'href="/products"' in missing.text()
        return {'offers':rows,'missingOffer':410,'followedMerchantRedirects':False,'note':'18 synthetic redirect requests, not human clicks or purchases.'}
    if not args.repairs_only: check('exact_outbound_destinations',redirect_checks)
    def repaired_views():
        rows=[]
        for route in ['/cart','/login','/register','/en/login','/ru/login','/go/missing-qa','/products','/products/find-pcshop-1']:
            for width in [320,360,390,1440]:
                page.set_viewport_size({'width':width,'height':900})
                visit(route)
                data=page.evaluate(text_scan)
                data['overflow']=page.evaluate("() => ({width:innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth})")
                data['route']=route
                data['width']=width
                data['screenshot']=f'extra-{route.replace('/','_')}-{width}.png'
                page.screenshot(path=str(OUT/data['screenshot']),full_page=True)
                rows.append(data)
        failures=[r for r in rows if r.get('textIssues') or r['overflow']['body']>r['width']+2 or r['overflow']['html']>r['width']+2]
        proofs['repaired_view_rows']=rows
        assert not failures, [(r['route'],r['width'],r.get('textIssues'),r['overflow']) for r in failures]
        return {'renders':len(rows),'textOverflow':0}
    check('repaired_routes',repaired_views)
    def first_screen():
        rows=[]
        for width in [320,390,1440]:
            page.set_viewport_size({'width':width,'height':900})
            visit('/products')
            card=page.locator('[data-discovery-offer]').first.bounding_box()
            visit('/products/find-pcshop-1')
            action=page.locator('main a[href="/go/pcshop-1"]').bounding_box()
            rows.append({'width':width,'firstResultY':round(card['y']),'storeActionY':round(action['y'])})
        return rows
    if not args.repairs_only: check('primary_content_positions',first_screen)
    proofs['pageErrors']=errors
    save()
    browser.close()
