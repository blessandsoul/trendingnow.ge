"""Read-only production publication and responsive checks against the shipped bundle."""
import argparse, json
from pathlib import Path
from playwright.sync_api import sync_playwright

p = argparse.ArgumentParser()
p.add_argument('--base', required=True)
p.add_argument('--output', required=True)
p.add_argument('--slug', action='append')
a = p.parse_args()
root = Path(__file__).resolve().parents[1]
bundle = json.loads((root / 'src/features/blog/data/accepted-collections.json').read_text(encoding='utf-8-sig'))
records = bundle if isinstance(bundle, list) else bundle['collections']
assert len(records) == 35
all_records = records
if a.slug:
    records = [r for r in records if r['slug'] in a.slug]
    assert {r['slug'] for r in records} == set(a.slug)
out = Path(a.output).resolve()
out.mkdir(parents=True, exist_ok=False)
results = []
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for width in [360, 1440]:
        page = browser.new_page(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        page.route('**/*', lambda r: r.continue_() if r.request.method in ['GET', 'HEAD', 'OPTIONS'] else r.abort())
        for item in records:
            errors = []
            listener = lambda e: errors.append(str(e))
            page.on('pageerror', listener)
            url = a.base.rstrip('/') + '/blog/' + item['slug']
            try:
                response = page.goto(url, wait_until='domcontentloaded', timeout=45000)
                page.locator('h1').first.wait_for()
                page.evaluate('document.fonts.ready')
                page.locator('main img').evaluate_all('(imgs) => imgs.forEach(i => { i.loading = "eager"; })')
                page.locator('main img').evaluate_all('(imgs) => Promise.all(imgs.map(i => i.decode().catch(() => null)))')
                data = page.evaluate('''() => ({
                    title: document.querySelector('h1')?.textContent,
                    canonical: document.querySelector('link[rel=canonical]')?.href,
                    robots: document.querySelector('meta[name=robots]')?.content || '',
                    overflow: document.documentElement.scrollWidth > innerWidth + 2,
                    textOverflow: [...document.querySelectorAll('main h1,main h2,main h3,main p,main li')].filter(e => e.clientWidth > 2 && !e.classList.contains('sr-only') && e.scrollWidth > e.clientWidth + 2).map(e => e.textContent.slice(0,100)),
                    brokenImages: [...document.querySelectorAll('main img')].filter(i => !i.complete || i.naturalWidth < 2).map(i => i.src),
                    imageCount: document.querySelectorAll('main img').length,
                    products: [...document.querySelectorAll('main a[href^="/products/"]')].map(e => e.getAttribute('href'))
                })''')
                assert response.status == 200, response.status
                assert item['title'] in data['title'], data
                assert data['canonical'] == 'https://trendingnow.ge/blog/' + item['slug'], data
                assert 'noindex' not in data['robots'], data
                assert not errors and not data['overflow'] and not data['textOverflow'] and not data['brokenImages'], data
                assert data['imageCount'] >= len(item['productIDs']), data
                assert all('/products/find-' + x in data['products'] for x in item['productIDs']), data
                if len(results) % 10 == 0:
                    page.screenshot(path=str(out / f"{width}-{item['slug']}.png"), full_page=True)
                results.append({'url': url, 'width': width, 'pass': True, **data})
            except Exception as e:
                results.append({'url': url, 'width': width, 'pass': False, 'error': repr(e), 'pageErrors': errors})
            page.remove_listener('pageerror', listener)
            print(json.dumps({'checked': len(results), 'passed': sum(x['pass'] for x in results)}), flush=True)
        page.close()
    page = browser.new_page()
    for path in ['/', '/blog', '/products', '/saved', '/compare', '/login', '/faq', '/contact']:
        response = page.goto(a.base.rstrip('/') + path, wait_until='domcontentloaded')
        results.append({'url': path, 'pass': response.status == 200, 'status': response.status})
    response = page.goto(a.base.rstrip('/') + '/sitemap.xml')
    sitemap = response.text()
    results.append({'url': '/sitemap.xml', 'pass': response.status == 200 and all('https://trendingnow.ge/blog/' + x['slug'] + '</loc>' in sitemap for x in all_records)})
    response = page.goto(a.base.rstrip('/') + '/editorial-preview')
    results.append({'url': '/editorial-preview', 'pass': response.status == 404, 'status': response.status})
    browser.close()
(out / 'qa.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
raise SystemExit(0 if all(x['pass'] for x in results) else 1)
