"""Read-only local checks for editorial search, TOC and production draft isolation."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 360, 'height': 900}, reduced_motion='reduce')
    page.goto('http://localhost:3015/editorial-preview')
    search = page.locator('main input').first
    search.fill('home-eufy-homebase-check')
    page.get_by_text('Показано: 1 / 50.', exact=False).wait_for()
    search.fill('zzzznotfound')
    page.get_by_text('Показано: 0 / 50.', exact=False).wait_for()
    print('PASS: index search and empty result')
    page.goto('http://localhost:3015/editorial-preview/workspace-mouse-ergonomic')
    anchor = page.locator('main a[href^="#"]:visible').first
    anchor.wait_for()
    target = anchor.get_attribute('href')[1:]
    anchor.click()
    page.wait_for_function('(id) => Math.abs(document.getElementById(id).getBoundingClientRect().top - 112) < 4', arg=target)
    print('PASS: mobile contents scroll to actual heading')
    for route in ['/editorial-preview', '/editorial-preview/home-espresso-workflow']:
        response = page.goto('http://localhost:3016' + route)
        assert response.status == 404, (route, response.status)
    response = page.goto('http://localhost:3016/blog')
    assert response.status == 200
    print('PASS: local production build hides draft index/details; public blog responds')
    browser.close()
