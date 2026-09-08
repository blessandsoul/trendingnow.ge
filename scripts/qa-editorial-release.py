"""Read-only rendered QA for every article in an explicit local batch."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:3014')
parser.add_argument('--package', required=True)
parser.add_argument('--prefix', default='/editorial-preview')
parser.add_argument('--output', required=True)
parser.add_argument('--slug', action='append', help='Recheck named changed articles while retaining the full package hash manifest')
args = parser.parse_args()
out = Path(args.output).resolve()
out.mkdir(parents=True, exist_ok=False)
sources = sorted((Path(args.package) / 'articles').glob('*.json'))
before = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sources}
started_at = datetime.now(timezone.utc).isoformat()
articles = [json.loads(p.read_text(encoding='utf-8-sig')) for p in sources]
assert len(articles) == 50, f'Expected 50 articles, got {len(articles)}'
assert len({a['slug'] for a in articles}) == 50
if args.slug:
    requested = set(args.slug)
    articles = [a for a in articles if a['slug'] in requested]
    assert {a['slug'] for a in articles} == requested, 'Unknown requested article'
rows = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for width in [360, 768, 1440]:
        page = browser.new_page(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        page.route('**/*', lambda route: route.continue_() if route.request.method in ['GET', 'HEAD', 'OPTIONS'] else route.abort())
        for article in articles:
            errors = []
            listener = lambda error: errors.append(str(error))
            page.on('pageerror', listener)
            route = f"{args.prefix}/{article['slug']}"
            try:
                response = page.goto(args.base + route, wait_until='domcontentloaded')
                page.locator('h1').first.wait_for()
                page.evaluate('document.fonts.ready')
                page.locator('main img').evaluate_all('(images) => Promise.all(images.map(i => i.decode().catch(() => null)))')
                data = page.evaluate('''() => ({
                  title: document.querySelector('h1')?.textContent,
                  overflow: document.documentElement.scrollWidth > innerWidth + 2,
                  textOverflow: [...document.querySelectorAll('main h1,main h2,main h3,main p,main li')].filter(e => e.clientWidth > 2 && !e.classList.contains('sr-only') && e.scrollWidth > e.clientWidth + 2).map(e => e.textContent.slice(0,100)),
                  brokenImages: [...document.querySelectorAll('main img')].filter(i => !i.complete || i.naturalWidth < 2).map(i => i.src),
                  brokenAnchors: [...document.querySelectorAll('main a[href^="#"]')].filter(a => a.hash.length > 1 && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
                  productLinks: [...document.querySelectorAll('main a[href^="/products/"]')].map(a => a.getAttribute('href')),
                  robots: document.querySelector('meta[name="robots"]')?.content
                })''')
                assert response.status == 200, response.status
                assert article['title'] in data['title'], data['title']
                assert not errors and not data['overflow'] and not data['textOverflow'] and not data['brokenImages'] and not data['brokenAnchors'], data
                for product in article['productIDs']:
                    assert '/products/find-' + product in data['productLinks'], product
                if args.prefix == '/editorial-preview':
                    assert 'noindex' in (data['robots'] or ''), data
                if len(rows) % 10 == 0:
                    page.screenshot(path=str(out / f"top-{width}-{article['slug']}.png"))
                    page.screenshot(path=str(out / f"{width}-{article['slug']}.png"), full_page=True)
                rows.append({'route': route, 'width': width, 'pass': True, **data})
            except Exception as error:
                rows.append({'route': route, 'width': width, 'pass': False, 'error': repr(error), 'pageErrors': errors})
            page.remove_listener('pageerror', listener)
            print(json.dumps({'checked': len(rows), 'passed': sum(r['pass'] for r in rows)}), flush=True)
        page.close()
    browser.close()
(out / 'qa.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
after = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((Path(args.package) / 'articles').glob('*.json'))}
unchanged = before == after
(out / 'copy-freeze.json').write_text(json.dumps({
    'startedAt': started_at, 'finishedAt': datetime.now(timezone.utc).isoformat(),
    'unchangedDuringRun': unchanged, 'sha256': before,
    'boundary': 'Binds local copy to this render run; does not grant editorial or publication approval.'
}, indent=2), encoding='utf-8')
raise SystemExit(0 if all(r['pass'] for r in rows) and unchanged else 1)
