import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeHtml,
  extractProductEvidence,
  makeProposedUpdatesJSON,
  normalizeSku,
  refreshOffer,
  refreshOffers,
  safeImageUrls,
  summarizeFailures,
} from './offer-refresh-lib.mjs';

const validHtml = ({
  sku = 'I31167',
  name = 'Logitech Pebble 2 M350S Bluetooth White',
  currency = 'GEL',
  price = '75.00',
  extraProducts = '',
  offers = `{"@type":"Offer","price":"${price}","priceCurrency":"${currency}","availability":"https://schema.org/InStock","url":"https://pcshop.ge/shop/logitech-pebble-2-m350s-bluetooth-white/"}`,
  image = 'https://cdn.pcshop.ge/images/pebble.jpg',
} = {}) => `<html><body><h1>${name}</h1><script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  sku,
  image: [image, 'javascript:alert(1)', 'http://cdn.pcshop.ge/unsafe.jpg', 'https://other.example/no.jpg'],
  offers: JSON.parse(offers),
})}</script>${extraProducts}</body></html>`;

function response(html, { status = 200, url = 'https://pcshop.ge/shop/logitech-pebble-2-m350s-bluetooth-white/' } = {}) {
  return { status, url, text: async () => html };
}

const item = {
  id: 'pcshop-2',
  merchantId: 'pcshop',
  merchantSku: ' I31167 ',
  productUrl: 'https://pcshop.ge/shop/logitech-pebble-2-m350s-bluetooth-white/',
};

test('SKU normalization only folds whitespace and case', () => {
  assert.equal(normalizeSku('  I31167\n  '), 'i31167');
  assert.equal(normalizeSku('I 31167'), 'i 31167');
  assert.equal(normalizeSku('I&amp;31167'), 'i&amp;31167');
  assert.notEqual(normalizeSku('I-31167'), normalizeSku('I31167'));
});

test('invalid numeric HTML entities remain literal and never reach fromCodePoint', () => {
  assert.equal(decodeHtml('ok &#x1F600; &#99999999; &#xD800;'), 'ok 😀 &#99999999; &#xD800;');
});

test('valid evidence keeps source claim separate from independent availability', () => {
  const evidence = extractProductEvidence({
    html: validHtml(),
    expectedSku: item.merchantSku,
    requestedUrl: item.productUrl,
    finalUrl: item.productUrl,
  });
  assert.equal(evidence.valid, true);
  assert.equal(evidence.exactMatchSKU, true);
  assert.equal(evidence.sourceSku, 'I31167');
  assert.equal(evidence.sourcePrice, 75);
  assert.equal(evidence.sourceCurrency, 'GEL');
  assert.equal(evidence.sourceAvailabilityClaim, 'https://schema.org/InStock');
  assert.deepEqual(evidence.imageCandidateURLs, ['https://cdn.pcshop.ge/images/pebble.jpg']);
});

test('name and H1 identity tolerates only the bounded multiplication glyph variant', () => {
  const html = validHtml({ name: 'Gembird SPG6-B-6C 6x1.8m Grey' }).replace(
    '<h1>Gembird SPG6-B-6C 6x1.8m Grey</h1>',
    '<h1>Gembird SPG6-B-6C 6×1.8m Grey</h1>',
  );
  const evidence = extractProductEvidence({ html, expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(evidence.valid, true);
});

test('same-SKU multiple Product records fail closed', () => {
  const duplicate = JSON.stringify({ '@type': 'Product', name: 'Duplicate', sku: 'I31167', offers: { '@type': 'Offer', price: '75', priceCurrency: 'GEL' } });
  const evidence = extractProductEvidence({ html: validHtml({ extraProducts: `<script type="application/ld+json">${duplicate}</script>` }), expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(evidence.valid, false);
  assert.ok(evidence.validationErrors.includes('ambiguous_product'));
  assert.ok(evidence.validationErrors.includes('ambiguous_product_records'));
});

test('wrong currency and malformed price fail closed', () => {
  const wrongCurrency = extractProductEvidence({ html: validHtml({ currency: 'USD' }), expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(wrongCurrency.valid, false);
  assert.ok(wrongCurrency.validationErrors.includes('wrong_currency'));
  const badPrice = extractProductEvidence({ html: validHtml({ price: '0' }), expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(badPrice.valid, false);
  assert.ok(badPrice.validationErrors.includes('bad_price'));
});

test('missing SKU, malformed JSON-LD, and missing H1 fail closed', () => {
  const missingSku = extractProductEvidence({ html: validHtml({ sku: '' }), expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(missingSku.valid, false);
  assert.ok(missingSku.validationErrors.includes('missing_sku'));
  const malformed = extractProductEvidence({ html: '<h1>Product</h1><script type="application/ld+json">{"@type":"Product"</scriptX>', expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(malformed.valid, false);
  assert.ok(malformed.validationErrors.includes('missing_product'));
  const missingH1 = extractProductEvidence({ html: validHtml().replace(/<h1>[\s\S]*?<\/h1>/u, ''), expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(missingH1.valid, false);
  assert.ok(missingH1.validationErrors.includes('missing_h1'));
});

test('multiple current offers fail closed while a list price alone is not current evidence', () => {
  const multiple = validHtml({ offers: JSON.stringify([
    { '@type': 'Offer', price: '75', priceCurrency: 'GEL' },
    { '@type': 'Offer', price: '76', priceCurrency: 'GEL' },
  ]) });
  const evidence = extractProductEvidence({ html: multiple, expectedSku: 'I31167', requestedUrl: item.productUrl, finalUrl: item.productUrl });
  assert.equal(evidence.valid, false);
  assert.ok(evidence.validationErrors.includes('ambiguous_offers'));
});

test('redirect, bad status, and fetch errors are rejected without pretending stock was checked', async () => {
  const redirectRow = await refreshOffer(item, { fetchImpl: async () => response(validHtml(), { url: 'https://evil.example/product' }) });
  assert.equal(redirectRow.valid, false);
  assert.ok(redirectRow.validationErrors.includes('cross_host_redirect'));
  const statusRow = await refreshOffer(item, { fetchImpl: async () => response(validHtml(), { status: 503 }) });
  assert.equal(statusRow.valid, false);
  assert.ok(statusRow.validationErrors.includes('source_status_bad'));
  assert.equal(statusRow.independentAvailability, 'unknown');
  const errorRow = await refreshOffer(item, { fetchImpl: async () => { throw new Error('network down'); } });
  assert.equal(errorRow.valid, false);
  assert.ok(errorRow.validationErrors.includes('source_fetch_error'));
});

test('a same-host sibling Offer URL is rejected and cannot be adopted by host-only matching', async () => {
  const html = validHtml({ offers: JSON.stringify({
    '@type': 'Offer',
    price: '75',
    priceCurrency: 'GEL',
    url: 'https://pcshop.ge/shop/another-product/',
  }) });
  const row = await refreshOffer(item, { fetchImpl: async () => response(html) });
  assert.equal(row.valid, false);
  assert.ok(row.validationErrors.includes('offer_url_mismatch'));
});

test('safe image URL filtering never returns javascript, HTTP, or unrelated hosts', () => {
  const product = { image: ['https://static.pcshop.ge/a.jpg', '//pcshop.ge/b.jpg', 'javascript:alert(1)', 'http://pcshop.ge/c.jpg', 'https://evil.example/d.jpg', 'https://static.pcshop.ge/a.jpg'] };
  assert.deepEqual(safeImageUrls(product, item.productUrl), ['https://static.pcshop.ge/a.jpg', 'https://pcshop.ge/b.jpg']);
});

test('proposed updates reject a non-canonical checkedAt instead of carrying it forward', () => {
  assert.throws(() => makeProposedUpdatesJSON({ rows: [{ valid: true, id: 'bad-time', checkedAt: 'yesterday' }] }), /checkedAt/);
});

test('refreshOffers uses at most three concurrent GETs and reports auditable counts', async () => {
  let active = 0;
  let maximum = 0;
  const calls = [];
  const items = Array.from({ length: 7 }, (_, index) => ({ ...item, id: `row-${index}` }));
  const receipt = await refreshOffers(items, {
    maxConcurrency: 3,
    now: () => new Date('2026-09-08T08:00:00.000Z'),
    fetchImpl: async (url, init) => {
      active += 1;
      maximum = Math.max(maximum, active);
      calls.push({ url, method: init.method });
      await new Promise((resolve) => setTimeout(resolve, 2));
      active -= 1;
      return response(validHtml());
    },
  });
  assert.equal(maximum, 3);
  assert.equal(calls.length, 7);
  assert.ok(calls.every((call) => call.method === 'GET'));
  assert.equal(receipt.validatedRowCount, 7);
  assert.equal(receipt.proposedUpdatesJSON.validatedRowCount, 7);
  assert.ok(receipt.rows.every((row) => row.independentAvailability === 'unknown'));
  assert.deepEqual(summarizeFailures(receipt), {});
});
