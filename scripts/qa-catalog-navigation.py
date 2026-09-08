"""Local rendered catalog checks. No external writes or authenticated actions."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

base = 'http://127.0.0.1:3014'
out = Path(__file__).resolve().parents[1] / 'artifacts/catalog-navigation'
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page_errors = []
    page.on('pageerror', lambda error: page_errors.append(str(error)))
    rows = []
    for width in [390, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        page.goto(base, wait_until='networkidle')
        links = page.locator('a[href^="/products"]').evaluate_all('(nodes) => [...new Set(nodes.map(n => n.getAttribute("href")))]')
        assert not any(term in link for link in links for term in ['search=lamp', 'search=coffee', 'search=headphones', 'search=kitchen'])
        for route in list(dict.fromkeys(links + ['/products?search=home', '/products?search=tech', '/products?search=bag', '/products?search=gift'])):
            response = page.goto(base + route, wait_until='networkidle')
            assert response.status == 200
            cards = page.locator('#catalog-products [data-product-card]')
            assert cards.count() > 0, (width, route)
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), (width, route)
            rows.append({'width': width, 'route': route, 'cards': cards.count()})
        page.goto(base + '/products?search=missing-product-39392', wait_until='networkidle')
        assert page.locator('#catalog-products [data-product-card]').count() == 0
        page.locator('#catalog-products').get_by_role('button', name='ყველა პროდუქტი', exact=True).click()
        page.wait_for_url(base + '/products')
        assert page.locator('#catalog-products [data-product-card]').count() > 0
        page.screenshot(path=str(out / f'catalog-{width}.png'), full_page=True)
        page.goto(base + '/products/product-601100060835831', wait_until='domcontentloaded', timeout=60000)
        card = page.locator('[data-product-card="compact"]').first
        card.wait_for(state='visible', timeout=60000)
        button = card.locator('button[aria-pressed]')
        assert button.bounding_box()['width'] == 44
        assert button.locator('span').bounding_box()['width'] == 24
        assert button.locator('svg').bounding_box()['width'] == 14
        card.screenshot(path=str(out / f'compact-card-{width}.png'))
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    assert not page_errors, page_errors
    result = {'routes': rows, 'pageErrors': page_errors, 'emptyReset': 'PASS', 'favoriteVisual': '24px / icon14px / target44px'}
    (out / 'qa.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))
    browser.close()
