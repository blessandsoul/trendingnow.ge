"""Read-only local UI smoke; no external purchases or partner calls."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

base = 'http://127.0.0.1:3014'
screens = Path(__file__).resolve().parents[1] / 'artifacts' / 'discovery-pilot'
screens.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    results = []
    for width in [320, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        for route in ['/discovery-preview', '/products/find-pcshop-2', '/en/products/find-pcshop-2', '/ru/products/find-pcshop-2']:
            response = page.goto(base + route, wait_until='networkidle', timeout=90000)
            page.locator('h1').wait_for()
            overflow = page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
            cart = page.locator('a[href="/cart"], button:has-text("Add to cart")').count()
            robots = page.locator('meta[name="robots"]').get_attribute('content')
            assert response.status == 200, (route, response.status)
            assert not overflow, (route, width, 'overflow')
            assert not cart, (route, 'legacy cart')
            assert 'noindex' in robots, (route, 'pilot indexing')
            results.append({'route': route, 'width': width, 'status': response.status, 'overflow': overflow, 'cart': cart})
            if width in [390, 1440] and not route.startswith(('/en/', '/ru/')):
                name = 'catalog' if route == '/discovery-preview' else 'detail'
                page.screenshot(path=str(screens / f'{name}-{width}.png'), full_page=True)
    page.goto(base+'/discovery-preview', wait_until='networkidle')
    page.locator('input').fill('I31167')
    assert page.locator('article').count() == 1
    page.locator('article a').click()
    page.wait_for_url('**/products/find-pcshop-2')
    page.locator('a[href="/go/pcshop-2"]').wait_for(state='visible')
    assert page.locator('a[href="/go/pcshop-2"]').count() == 1
    redirect = page.request.get(base+'/go/pcshop-2?url=https://invalid.example', max_redirects=0)
    assert redirect.status == 307
    assert redirect.headers['location'] == 'https://pcshop.ge/shop/logitech-pebble-2-m350s-bluetooth-white/'
    assert page.request.get(base+'/go/unknown', max_redirects=0).status == 410
    assert not errors, errors
    print(json.dumps({'renders': results, 'search_and_detail': 'PASS', 'redirect': 'PASS', 'unknown_offer': 410, 'page_errors': errors, 'screenshots': str(screens)}, ensure_ascii=False))
    browser.close()
