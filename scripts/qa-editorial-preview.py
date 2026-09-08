"""Read-only checks of local editorial review UI, not publication approval."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

base = 'http://127.0.0.1:3014'
screens = Path(__file__).resolve().parents[1] / 'artifacts' / 'editorial-preview'
screens.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    console_errors = []
    page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
    rows = []
    for width in [320, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        response = page.goto(base + '/editorial-preview', wait_until='networkidle')
        assert response.status == 200
        links = page.locator('a[href^="/editorial-preview/"]')
        assert links.count() > 0
        article_routes = links.evaluate_all('(nodes) => nodes.map(node => node.getAttribute("href"))')
        routes = article_routes if '--all' in sys.argv and width in [390, 1440] else article_routes[:1]
        for route in ['/editorial-preview', *routes]:
            response = page.goto(base + route, wait_until='networkidle')
            assert response.status == 200
            assert 'noindex' in page.locator('meta[name="robots"]').get_attribute('content')
            assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), (route, width)
            assert page.locator('h1').count() == 1
            rows.append({'width': width, 'route': route, 'status': response.status})
            if width in [390, 1440] and route in ['/editorial-preview', article_routes[0]]:
                name = 'index' if route == '/editorial-preview' else 'article'
                page.screenshot(path=str(screens / f'{name}-{width}.png'), full_page=True, caret='initial')
    page.goto(base + '/editorial-preview', wait_until='networkidle')
    initial_count = page.locator('article').count()
    first_route = page.locator('a[href^="/editorial-preview/"]').first.get_attribute('href')
    page.get_by_role('textbox', name='Поиск материалов').fill(first_route.split('/')[-1])
    assert page.locator('article').count() == 1
    page.get_by_role('textbox', name='Поиск материалов').fill('no-such-editorial-topic-734928')
    assert page.locator('article').count() == 0
    assert not errors, errors
    assert not console_errors, console_errors
    result = {'renders': rows, 'pageErrors': errors, 'consoleErrors': console_errors, 'indexedDrafts': initial_count, 'search': 'PASS'}
    (screens / 'browser-qa.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))
    browser.close()
