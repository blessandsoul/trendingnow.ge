"""Local read-only checks for the priority offer refresh; never a live release."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:3014')
parser.add_argument('--output', required=True)
parser.add_argument('--drafts', help='Optional local priority package to check in the development-only reviewer')
args = parser.parse_args()
out = Path(args.output).resolve()
out.mkdir(parents=True, exist_ok=False)
rows = []
paths = ['/products', '/products?search=I31167', '/products/find-pcshop-2', '/en/products/find-pcshop-2']
drafts = []
if args.drafts:
    drafts = [json.loads(file.read_text(encoding='utf-8')) for file in sorted((Path(args.drafts) / 'articles').glob('*.json'))]
    paths += ['/editorial-preview'] + ['/editorial-preview/' + draft['slug'] for draft in drafts]
with sync_playwright() as p:
    browser = p.chromium.launch()
    for path in paths:
        for width in [390, 1440]:
            page = browser.new_page(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route('**/*', lambda route: route.continue_() if route.request.method in ['GET', 'HEAD', 'OPTIONS'] else route.abort())
            try:
                response = page.goto(args.base + path, wait_until='domcontentloaded')
                page.locator('h1').first.wait_for()
                page.evaluate('document.fonts.ready')
                page.wait_for_timeout(300)
                data = page.evaluate('''() => ({width: innerWidth, body: document.body.scrollWidth,
                    headings: [...document.querySelectorAll('h1')].map(e => e.textContent),
                    offers: document.querySelectorAll('[data-discovery-offer]').length,
                    textOverflow: [...document.querySelectorAll('main h1, main h2, main h3, main p, main li')].filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 2).map(e => e.textContent.slice(0,120)),
                    priceText: document.querySelector('main')?.innerText,
                    storeLinks: [...document.querySelectorAll('main a[href^="/go/"]')].map(e => ({href:e.getAttribute('href'),target:e.target}))})''')
                assert response.status == 200 and not errors and not data['textOverflow'] and data['body'] <= width + 2, data
                if path == '/products': assert data['offers'] == 18, data
                if '?search=' in path: assert data['offers'] == 1, data
                if 'find-pcshop-2' in path:
                    assert 'I31167' in data['priceText'] and data['storeLinks'] == [{'href':'/go/pcshop-2','target':'_blank'}], data
                    page.locator('main a[href="/go/pcshop-2"]').click(trial=True)
                if path.startswith('/editorial-preview'):
                    assert 'noindex' in (page.locator('meta[name="robots"]').get_attribute('content') or ''), path
                    if path == '/editorial-preview': assert str(len(drafts)) in data['headings'][0], data
                screenshot = f'page-{len(rows)+1}-{width}.png'
                page.screenshot(path=str(out / screenshot), full_page=True)
                rows.append({'route':path,'width':width,'pass':True,'errors':errors,'screenshot':screenshot,**data})
            except Exception as error:
                rows.append({'route':path,'width':width,'pass':False,'error':repr(error),'errors':errors})
            page.close()
    browser.close()
(out / 'qa.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'passed':sum(row['pass'] for row in rows),'total':len(rows),'output':str(out)}))
raise SystemExit(0 if all(row['pass'] for row in rows) else 1)
