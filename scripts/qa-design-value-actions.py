"""Bounded read-only interaction proofs; mutation requests are blocked, not sent."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parents[1]/'artifacts/design-value-20260908'
BASE='http://127.0.0.1:3014'
proofs={}
with sync_playwright() as p:
 browser=p.chromium.launch()
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 blocked=[]
 def protect(route):
  if route.request.method not in ['GET','HEAD','OPTIONS']:
   blocked.append({'method':route.request.method,'url':route.request.url});route.abort()
  else: route.continue_()
 page.route('**/*',protect)
 page.goto(BASE+'/products',wait_until='domcontentloaded')
 page.locator('[data-product-card]').first.wait_for()
 page.evaluate('document.fonts.ready')
 proofs['firstProductTop390']=round(page.locator('[data-product-card]').first.bounding_box()['y'])
 page.locator('[data-product-card]').first.scroll_into_view_if_needed()
 page.screenshot(path=str(OUT/'catalog-cards-390.png'))
 page.locator('input[type=email]').fill('audit@example.invalid')
 before=page.locator('body').inner_text()
 requests=[]
 page.on('request',lambda request:requests.append({'method':request.method,'url':request.url}))
 page.get_by_role('button',name='გამოწერა',exact=True).click()
 page.wait_for_timeout(600)
 proofs['newsletter']={'bodyUnchanged':before==page.locator('body').inner_text(),'requests':requests.copy(),'blocked':blocked.copy()}
 page.goto(BASE+'/products',wait_until='domcontentloaded')
 page.wait_for_timeout(1200)
 page.locator('[data-product-card] button[aria-pressed]').first.click()
 try: page.wait_for_url('**/login?from=**',wait_until='domcontentloaded',timeout=8000)
 except Exception as error: proofs['favoriteWaitError']=str(error)[:150]
 proofs['favoriteGuest']={'finalURL':page.url,'blocked':blocked.copy()}
 page.goto(BASE+'/contact',wait_until='domcontentloaded')
 proofs['contact']={'mailtoLinks':page.locator('a[href^="mailto:"]').count(),'telLinks':page.locator('a[href^="tel:"]').count(),'socialLinks':page.locator('a[href*="facebook.com"],a[href*="instagram.com"]').count()}
 page.goto(BASE+'/products/product-601100060835831',wait_until='domcontentloaded')
 page.locator('h1').wait_for()
 page.locator('main').screenshot(path=str(OUT/'legacy-detail-main.png'))
 proofs['legacyDetail']={'outboundShopLinks':page.locator('main a[href^="/go/"]').count(),'buyerFacts':page.locator('[data-pain-id] article').all_inner_texts()}
 page.goto(BASE+'/products/find-pcshop-10',wait_until='domcontentloaded')
 page.locator('h1').wait_for()
 page.screenshot(path=str(OUT/'merchant-detail-390.png'),full_page=True)
 proofs['merchantDetail']={'mainText':page.locator('main').inner_text(),'outboundShopLinks':page.locator('main a[href^="/go/"]').count(),'saveButtons':page.locator('button[aria-pressed]').count()}
 page.goto(BASE+'/en/products',wait_until='domcontentloaded')
 page.wait_for_timeout(1000)
 page.get_by_role('button',name='Open menu',exact=True).click()
 proofs['englishMenu']={'text':page.get_by_role('dialog').inner_text(),'lang':page.get_by_role('dialog').get_attribute('lang')}
 page.screenshot(path=str(OUT/'english-menu-390.png'))
 OUT.joinpath('actions.json').write_text(json.dumps(proofs,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(proofs,ensure_ascii=False,indent=2))
 browser.close()
