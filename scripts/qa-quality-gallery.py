"""Read-only real-browser QA for legacy product gallery media.

The quality-wave route scan checks images before offscreen lazy thumbnails have
been brought into view. This pass scrolls each thumbnail strip, clicks all six
media controls, and records the browser's actual currentSrc/naturalWidth state.
It never submits forms or sends non-read requests.
"""

import argparse
import json
import re
from pathlib import Path
from typing import Any

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / 'artifacts/quality-wave-20260908/gallery.json'
DEFAULT_BASE_URL = 'http://127.0.0.1:3014'
CURRENT_CATALOG = ROOT / 'src/features/storefront/data/currentCatalog.ts'
LEGACY_IDS = re.findall(r"id: '([0-9]+)'", CURRENT_CATALOG.read_text(encoding='utf-8'))
THUMB_SELECTOR = 'button[aria-label*="მედიის ჩვენება"]'
MAIN_SELECTOR = '[aria-roledescription="carousel"] img'


def inject_gallery_error_hooks(page: Page) -> None:
    page.evaluate(
        """({ thumbSelector, mainSelector }) => {
          const images = document.querySelectorAll(`${thumbSelector} img, ${mainSelector}`);
          for (const image of images) {
            if (image.dataset.qaGalleryHooked === 'true') continue;
            image.dataset.qaGalleryHooked = 'true';
            image.addEventListener('error', () => {
              image.dataset.qaGalleryError = 'image-error';
            });
          }
        }""",
        {'thumbSelector': THUMB_SELECTOR, 'mainSelector': MAIN_SELECTOR},
    )


def wait_for_image(page: Page, selector: str, index: int | None = None) -> None:
    page.wait_for_function(
        """({ selector, index }) => {
          const element = document.querySelectorAll(selector)[index ?? 0];
          const image = element?.tagName === 'IMG' ? element : element?.querySelector('img');
          return Boolean(image && (image.complete || image.dataset.qaGalleryError === 'image-error'));
        }""",
        arg={'selector': selector, 'index': index},
        timeout=8000,
    )


def image_state(page: Page, selector: str, index: int | None = None) -> dict[str, Any]:
    return page.evaluate(
        """({ selector, index }) => {
          const element = document.querySelectorAll(selector)[index ?? 0];
          const image = element?.tagName === 'IMG' ? element : element?.querySelector('img');
          if (!image) return { present: false, complete: false, loaded: false, naturalWidth: 0, currentSrc: '', error: 'missing' };
          return {
            present: true,
            complete: image.complete,
            loaded: image.complete && image.naturalWidth > 0,
            naturalWidth: image.naturalWidth,
            currentSrc: image.currentSrc,
            error: image.dataset.qaGalleryError ?? null,
          };
        }""",
        {'selector': selector, 'index': index},
    )


def gallery_buttons(page: Page) -> int:
    return page.locator(THUMB_SELECTOR).count()


def load_thumbnail_and_click(page: Page, index: int) -> dict[str, Any]:
    button = page.locator(THUMB_SELECTOR).nth(index)
    thumbnail_before_scroll = image_state(page, THUMB_SELECTOR, index)
    button.scroll_into_view_if_needed()
    page.wait_for_timeout(120)
    try:
        wait_for_image(page, THUMB_SELECTOR, index)
    except PlaywrightTimeoutError:
        pass
    thumbnail_after_scroll = image_state(page, THUMB_SELECTOR, index)
    button.click()
    page.wait_for_function(
        """({ selector, label }) => document.querySelector(`${selector}[aria-current="true"]`)?.getAttribute('aria-label') === label""",
        arg={'selector': THUMB_SELECTOR, 'label': button.get_attribute('aria-label')},
        timeout=8000,
    )
    try:
        wait_for_image(page, MAIN_SELECTOR)
    except PlaywrightTimeoutError:
        pass
    return {
        'index': index + 1,
        'thumbnailBeforeScroll': thumbnail_before_scroll,
        'thumbnailAfterScroll': thumbnail_after_scroll,
        'thumbnailClassification': (
            'lazy-offscreen-before-scroll'
            if thumbnail_after_scroll.get('loaded') and not thumbnail_before_scroll.get('loaded')
            else 'loaded-before-scroll'
            if thumbnail_after_scroll.get('loaded')
            else 'image-error-or-zero-natural-width'
        ),
        'main': image_state(page, MAIN_SELECTOR),
        'selected': page.locator(THUMB_SELECTOR).nth(index).get_attribute('aria-current') == 'true',
    }


def verify_first_product_interactions(page: Page) -> dict[str, Any]:
    count = gallery_buttons(page)
    if count < 2:
        return {'click': {'tested': False, 'reason': 'fewer than two thumbnails'}, 'gesture': {'tested': False, 'reason': 'fewer than two thumbnails'}}

    first = page.locator(THUMB_SELECTOR).nth(0)
    second = page.locator(THUMB_SELECTOR).nth(1)
    first.click()
    page.wait_for_timeout(100)
    first_src = image_state(page, MAIN_SELECTOR)['currentSrc']
    second.click()
    page.wait_for_timeout(250)
    second_src = image_state(page, MAIN_SELECTOR)['currentSrc']
    click_result = {
        'tested': True,
        'changed': first_src != second_src,
        'fromCurrentSrc': first_src,
        'toCurrentSrc': second_src,
        'selectedLabel': second.get_attribute('aria-label'),
    }

    first.click()
    page.wait_for_timeout(100)
    carousel = page.locator('[aria-roledescription="carousel"]')
    box = carousel.bounding_box()
    if box is None:
        return {'click': click_result, 'gesture': {'tested': False, 'reason': 'carousel has no box'}}
    start_src = image_state(page, MAIN_SELECTOR)['currentSrc']
    # Synthetic touch pointer events exercise the handler without claiming a
    # physical touch-device result; the report labels this explicitly.
    carousel.dispatch_event('pointerdown', {'pointerId': 11, 'pointerType': 'touch', 'isPrimary': True, 'clientX': box['x'] + box['width'] * 0.75, 'clientY': box['y'] + box['height'] * 0.5})
    carousel.dispatch_event('pointerup', {'pointerId': 11, 'pointerType': 'touch', 'isPrimary': True, 'clientX': box['x'] + box['width'] * 0.25, 'clientY': box['y'] + box['height'] * 0.5})
    page.wait_for_timeout(250)
    end_src = image_state(page, MAIN_SELECTOR)['currentSrc']
    return {
        'click': click_result,
        'gesture': {
            'tested': True,
            'mode': 'synthetic_pointer_event',
            'changed': start_src != end_src,
            'fromCurrentSrc': start_src,
            'toCurrentSrc': end_src,
        },
    }


def inspect_product(page: Page, product_id: str, first: bool) -> dict[str, Any]:
    slug = f'product-{product_id}'
    page_errors: list[str] = []
    request_failures: list[str] = []
    page.on('pageerror', lambda error: page_errors.append(str(error)))
    page.on('requestfailed', lambda request: request_failures.append(request.url) if request.resource_type == 'image' else None)
    response = page.goto(f'{BASE_URL}/{"products/"}{slug}', wait_until='domcontentloaded', timeout=60000)
    page.locator('h1').first.wait_for(timeout=15000)
    page.wait_for_timeout(500)
    inject_gallery_error_hooks(page)
    count = gallery_buttons(page)
    items: list[dict[str, Any]] = []
    for index in range(count):
        items.append(load_thumbnail_and_click(page, index))
    first_interactions = verify_first_product_interactions(page) if first else None
    return {
        'id': product_id,
        'route': f'/products/{slug}',
        'status': response.status if response else None,
        'finalURL': page.url,
        'thumbnailCount': count,
        'media': items,
        'imageErrors': request_failures,
        'pageErrors': page_errors,
        'interactions': first_interactions,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default=DEFAULT_BASE_URL)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    global BASE_URL
    BASE_URL = args.base_url.rstrip('/')
    if len(LEGACY_IDS) != 18:
        raise SystemExit(f'Expected 18 legacy IDs, found {len(LEGACY_IDS)}')

    args.output.parent.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, Any]] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for index, product_id in enumerate(LEGACY_IDS):
            page = browser.new_page(viewport={'width': 390, 'height': 900}, reduced_motion='reduce')
            page.route('**/*', lambda route: route.continue_() if route.request.method in {'GET', 'HEAD', 'OPTIONS'} else route.abort())
            try:
                result = inspect_product(page, product_id, first=index == 0)
            except Exception as error:  # keep all 18 route outcomes in the artifact
                result = {'id': product_id, 'route': f'/products/product-{product_id}', 'error': str(error)[:1000]}
            results.append(result)
            args.output.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
            print(json.dumps({'id': product_id, 'thumbnailCount': result.get('thumbnailCount'), 'error': result.get('error'), 'imageErrors': len(result.get('imageErrors', []))}), flush=True)
            page.close()
        browser.close()

    loaded = sum(1 for result in results for media in result.get('media', []) if media.get('main', {}).get('loaded'))
    failed = sum(1 for result in results for media in result.get('media', []) if not media.get('main', {}).get('loaded'))
    classifications = {
        classification: sum(1 for result in results for media in result.get('media', []) if media.get('thumbnailClassification') == classification)
        for classification in ('lazy-offscreen-before-scroll', 'loaded-before-scroll', 'image-error-or-zero-natural-width')
    }
    summary = {
        'generatedAt': '2026-09-08',
        'baseURL': BASE_URL,
        'scope': '18 legacy product routes × six gallery thumbnails',
        'routeCount': len(results),
        'thumbnailChecks': sum(result.get('thumbnailCount', 0) for result in results),
        'mainMediaLoadedAfterClick': loaded,
        'mainMediaNotLoadedAfterClick': failed,
        'thumbnailClassificationCounts': classifications,
        'lazyOffscreenDistinguished': True,
        'currentSrcOnly': True,
        'nonGetRequestsAborted': True,
        'results': results,
    }
    args.output.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: summary[key] for key in ['routeCount', 'thumbnailChecks', 'mainMediaLoadedAfterClick', 'mainMediaNotLoadedAfterClick']}))


if __name__ == '__main__':
    main()
