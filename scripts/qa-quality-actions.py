"""Real browser interactions with disposable local storage and no external writes."""
import json
import argparse
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--base',default='http://127.0.0.1:3014')
parser.add_argument('--output',default=str(ROOT/'artifacts/quality-wave-20260908'))
args=parser.parse_args()
OUT=Path(args.output)
OUT.mkdir(parents=True,exist_ok=True)
BASE=args.base.rstrip('/')
proofs={}

def check(name, callback):
    try:
        proofs[name]={'pass':True, 'evidence':callback()}
    except Exception as error:
        proofs[name]={'pass':False, 'error':repr(error)[:1500]}
    (OUT/'actions.json').write_text(json.dumps(proofs,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({name:proofs[name]}),flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch()
    context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    blocked=[]
    def guard(route):
        if route.request.method not in ['GET','HEAD','OPTIONS']:
            blocked.append(route.request.url)
            route.abort()
        else: route.continue_()
    context.route('**/*',guard)
    page=context.new_page()
    page_errors=[]
    page.on('pageerror',lambda error: page_errors.append(str(error)))
    def visit(route):
        page.goto(BASE+route,wait_until='domcontentloaded')
        page.locator('h1').first.wait_for()
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(300)
    def card(item): return page.locator(f'[data-discovery-offer="{item}"]')
    def storage(key): return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)||"[]")',key)

    def search():
        visit('/en/products')
        field=page.locator('main input').first
        field.click()
        field.press_sequentially('mausi',delay=100)
        expect(field).to_have_value('mausi')
        expect(field).to_be_focused()
        field.press('Enter')
        expect(page.locator('[data-discovery-offer]')).to_have_count(3)
        assert set(page.locator('[data-discovery-offer]').evaluate_all('(els)=>els.map(e=>e.dataset.discoveryOffer)'))=={'pcshop-1','pcshop-2','elite-2'}
        page.wait_for_url('**/products?search=mausi')
        url=page.url
        page.reload(wait_until='domcontentloaded')
        expect(page.locator('main input').first).to_have_value('mausi')
        expect(page.locator('[data-discovery-offer]')).to_have_count(3)
        return {'queryURL':url,'matchingOffers':3,'focusKept':True,'reloadKeepsQuery':True}
    check('search_real_typing',search)

    def save():
        visit('/en/products')
        card('pcshop-1').get_by_role('button',name=re.compile('^Save product')).click()
        expect(card('pcshop-1').get_by_role('button',name=re.compile('^Remove from saved'))).to_have_attribute('aria-pressed','true')
        visit('/en/saved')
        expect(page.locator('main h2').filter(has_text='M650L')).to_have_count(1)
        page.reload(wait_until='domcontentloaded')
        expect(page.locator('main h2').filter(has_text='M650L')).to_have_count(1)
        ids=storage('trendingnow:saved-products:v1')
        assert ids==['pcshop-1'], ids
        page.get_by_role('button',name=re.compile('^Remove from saved:')).click()
        expect(page.locator('main h2').filter(has_text='M650L')).to_have_count(0)
        page.get_by_role('button',name=re.compile('Undo|Restore')).click()
        expect(page.locator('main h2').filter(has_text='M650L')).to_have_count(1)
        page.screenshot(path=str(OUT/'saved-populated-390.png'),full_page=True)
        return {'ids':ids,'persistedAfterReload':True,'removeAndUndo':True,'loginRequired':False}
    check('save_reload_remove_undo',save)

    def cross_tab():
        visit('/en/saved')
        second=context.new_page()
        second.goto(BASE+'/en/products',wait_until='domcontentloaded')
        second.locator('[data-discovery-offer="pcshop-2"]').get_by_role('button',name=re.compile('^Save product')).click()
        expect(page.locator('main h2').filter(has_text='M350S')).to_have_count(1)
        second.close()
        return {'updatedWithoutReload':True,'count':len(storage('trendingnow:saved-products:v1'))}
    check('saved_cross_tab',cross_tab)

    def compare():
        visit('/en/products')
        for item in ['pcshop-1','pcshop-2','elite-2']:
            card(item).get_by_role('button',name=re.compile('^Add to compare')).click()
        expect(card('pcshop-10').get_by_role('button',name=re.compile('compar',re.I))).to_be_disabled()
        visit('/en/compare')
        expect(page.locator('main table')).to_have_count(1)
        assert len(storage('trendingnow:compare-products:v1'))==3
        region=page.locator('[role="region"][aria-describedby="compare-scroll-hint"]')
        assert region.evaluate('(e)=>e.scrollWidth>e.clientWidth')
        page.get_by_role('button',name='Scroll table right',exact=True).click()
        page.wait_for_timeout(350)
        assert region.evaluate('(e)=>e.scrollLeft>0')
        page.get_by_role('button',name='Scroll table left',exact=True).click()
        page.wait_for_timeout(350)
        assert region.evaluate('(e)=>e.scrollLeft===0')
        page.screenshot(path=str(OUT/'compare-populated-390.png'),full_page=True)
        page.reload(wait_until='domcontentloaded')
        expect(page.locator('main table')).to_have_count(1)
        return {'sameTypeItems':3,'differentTypeBlocked':True,'localTableScroll':True,'arrowButtonsWork':True,'persisted':True}
    check('compare_constraints_and_persistence',compare)

    def header():
        visit('/en/products')
        page.evaluate('window.scrollTo(0,1400)')
        page.wait_for_timeout(350)
        expect(page.locator('header')).to_have_attribute('data-header-mode','hidden')
        page.evaluate('window.scrollTo(0,1250)')
        page.wait_for_timeout(350)
        expect(page.locator('header')).to_have_attribute('data-header-mode','search')
        bounds=page.locator('header').bounding_box()
        input_bounds=page.locator('header input').bounding_box()
        assert input_bounds['y']>=bounds['y'] and input_bounds['y']+input_bounds['height']<=bounds['y']+bounds['height']+1
        page.screenshot(path=str(OUT/'search-header-390.png'))
        page.evaluate('window.scrollTo(0,1100)')
        page.wait_for_timeout(350)
        expect(page.locator('header')).to_have_attribute('data-header-mode','full')
        return {'sequence':['hidden','search','full'],'inputContained':True,'inputWidth':input_bounds['width']}
    check('two_gesture_header',header)

    def trust():
        visit('/en/order-success/missing-qa')
        main=page.locator('main').inner_text()
        assert re.search('not found|not confirmed|cannot confirm|could not confirm|not available',main,re.I), main
        assert not re.search('successfully|order received|request received',main,re.I), main
        visit('/en/products/product-601100060835831')
        assert not page.locator('main button').filter(has_text=re.compile('Add to cart|Checkout',re.I)).count(), 'legacy cart CTA remains'
        schemas=page.locator('script[type="application/ld+json"]').all_text_contents()
        assert 'InStock' not in ''.join(schemas), 'legacy InStock schema remains'
        visit('/en/contact')
        assert page.locator('main a[href^="mailto:contact@ainow.ge"]').count()>0, 'missing main contact email'
        assert page.locator('main a[href^="tel:"]').count()>0, 'missing main contact phone'
        return {'arbitraryReceiptRejected':True,'legacyCheckoutAbsent':True,'fakeInStockAbsent':True,'contactActions':True}
    check('truth_and_contact',trust)

    def localized_menu():
        visit('/en/products')
        page.get_by_role('button',name='Open menu',exact=True).click()
        expect(page.get_by_role('dialog')).to_have_attribute('lang','en')
        assert not re.search('[\u10a0-\u10ff]',page.get_by_role('dialog').inner_text())
        page.keyboard.press('Escape')
        expect(page.get_by_role('button',name='Open menu',exact=True)).to_be_focused()
        return {'translated':True,'escapeFocusRestored':True}
    check('localized_accessible_menu',localized_menu)

    def fonts():
        visit('/')
        loaded=page.evaluate("() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)")
        assert 'Discovery Georgian' in loaded and 'Discovery Anton' in loaded
        assert 'BOG' not in loaded
        return loaded
    check('actual_font_loading',fonts)
    proofs['network']={'blockedMutations':blocked,'pageErrors':page_errors}
    (OUT/'actions.json').write_text(json.dumps(proofs,ensure_ascii=False,indent=2),encoding='utf-8')
    browser.close()
