import crypto from 'node:crypto';

export const DEFAULT_MAX_CONCURRENCY = 3;
export const DEFAULT_TIMEOUT_MS = 25_000;
export const EXPECTED_PILOT_ROW_COUNT = 18;
export const READ_ONLY_USER_AGENT = 'TrendingNow read-only offer refresh/1.0';

const HTML_ENTITIES = new Map([
  ['amp', '&'],
  ['apos', "'"],
  ['gt', '>'],
  ['lt', '<'],
  ['quot', '"'],
  ['nbsp', ' '],
]);

const FAILURE_MESSAGES = {
  invalid_source_url: 'The configured product URL is not a safe HTTPS URL.',
  source_fetch_error: 'The public GET failed before a source response could be recorded.',
  source_status_bad: 'The public source did not return HTTP 200.',
  cross_host_redirect: 'The public URL redirected to a different hostname.',
  malformed_jsonld: 'The page contained malformed JSON-LD that could not be audited safely.',
  missing_product: 'No schema.org Product record was found.',
  ambiguous_product: 'The page contained multiple Product records and was rejected as ambiguous.',
  ambiguous_product_records: 'More than one Product record matched the requested SKU.',
  missing_sku: 'The exact Product record did not contain a SKU.',
  mismatched_sku: 'The source Product SKU did not match the requested merchant SKU.',
  missing_name: 'The exact Product record did not contain a product name.',
  missing_h1: 'The page did not expose exactly one non-empty H1 identity.',
  ambiguous_h1: 'The page exposed more than one non-empty H1 identity.',
  name_h1_mismatch: 'The source Product name and H1 identity did not match.',
  malformed_offers: 'The Product offers field was malformed.',
  missing_offer: 'The exact Product did not expose an Offer.',
  ambiguous_offers: 'The exact Product exposed multiple offers or current prices.',
  wrong_currency: 'The current source price was not denominated in GEL.',
  bad_price: 'The current source price was missing, non-positive, or malformed.',
  unsafe_offer_url: 'The source Offer URL was not a safe same-host HTTPS URL.',
  offer_url_mismatch: 'The source Offer URL did not identify the exact fetched product page.',
};

export function normalizeWhitespace(value) {
  return String(value ?? '').replace(/\s+/gu, ' ').trim();
}

export function decodeHtml(value) {
  let decoded = String(value ?? '');
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/giu, (match, token) => {
      const lower = token.toLowerCase();
      if (lower.startsWith('#x')) {
        const codePoint = Number.parseInt(lower.slice(2), 16);
        return isUnicodeScalar(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      if (lower.startsWith('#')) {
        const codePoint = Number.parseInt(lower.slice(1), 10);
        return isUnicodeScalar(codePoint) ? String.fromCodePoint(codePoint) : match;
      }
      return HTML_ENTITIES.get(lower) ?? match;
    });
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function isUnicodeScalar(value) {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff);
}

/** SKU equality is deliberately conservative: only trim/collapse whitespace and case-fold. */
export function normalizeSku(value) {
  return normalizeWhitespace(value).toLowerCase();
}

export function normalizeIdentity(value) {
  return normalizeWhitespace(decodeHtml(value)).replace(/×/gu, 'x').toLowerCase();
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function typeIncludes(value, expected) {
  const expectedLower = expected.toLowerCase();
  if (typeof value === 'string') return value.toLowerCase() === expectedLower;
  if (Array.isArray(value)) return value.some((entry) => typeIncludes(entry, expected));
  return false;
}

function stripTags(value) {
  return decodeHtml(String(value ?? '').replace(/<[^>]*>/gu, ''));
}

export function extractH1s(html) {
  return [...String(html ?? '').matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)]
    .map((match) => normalizeWhitespace(stripTags(match[1])))
    .filter(Boolean);
}

export function parseJsonLdScripts(html) {
  const scripts = [...String(html ?? '').matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)];
  const values = [];
  const parseErrors = [];
  for (const [index, match] of scripts.entries()) {
    const raw = match[1].trim();
    if (!raw) {
      parseErrors.push({ index, reason: 'empty_jsonld_script' });
      continue;
    }
    try {
      values.push({ index, value: JSON.parse(raw), raw });
    } catch (error) {
      parseErrors.push({ index, reason: 'invalid_jsonld', message: error instanceof Error ? error.message : String(error) });
    }
  }
  return { scripts, values, parseErrors };
}

function collectProductRecords(value, path = 'root', seen = new WeakSet(), output = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectProductRecords(entry, `${path}[${index}]`, seen, output));
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  if (seen.has(value)) return output;
  seen.add(value);
  if (typeIncludes(value['@type'], 'Product')) output.push({ product: value, path });
  for (const [key, child] of Object.entries(value)) {
    if (key === '@context') continue;
    collectProductRecords(child, `${path}.${key}`, seen, output);
  }
  return output;
}

export function findProductRecords(parsedJsonLd) {
  return parsedJsonLd.values.flatMap(({ index, value, raw }) =>
    collectProductRecords(value).map((record) => ({ ...record, scriptIndex: index, rawScript: raw })),
  );
}

function asSingleObject(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return value == null ? [] : null;
}

function isListPriceSpecification(value) {
  if (!value || typeof value !== 'object') return false;
  const priceType = normalizeWhitespace(value.priceType).toLowerCase();
  return priceType === 'https://schema.org/listprice' || priceType === 'http://schema.org/listprice' || priceType === 'listprice';
}

function strictPrice(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!/^\d+(?:\.\d{1,4})?$/u.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseCurrentOffer(product) {
  if (!Object.hasOwn(product, 'offers')) return { errors: ['missing_offer'] };
  const offers = asSingleObject(product.offers);
  if (offers === null) return { errors: ['malformed_offers'] };
  if (offers.length === 0) return { errors: ['missing_offer'] };
  if (offers.length !== 1) return { errors: ['ambiguous_offers'] };
  const offer = offers[0];
  if (!offer || typeof offer !== 'object' || !typeIncludes(offer['@type'], 'Offer')) return { errors: ['malformed_offers'] };

  const rawSpecifications = Object.hasOwn(offer, 'priceSpecification') ? asSingleObject(offer.priceSpecification) : [];
  if (rawSpecifications === null) return { errors: ['malformed_offers'] };
  if (rawSpecifications.some((specification) => !specification || typeof specification !== 'object')) {
    return { errors: ['malformed_offers'] };
  }
  const currentSpecifications = rawSpecifications.filter((specification) => !isListPriceSpecification(specification));
  if (currentSpecifications.length > 1) return { errors: ['ambiguous_offers'] };
  if (currentSpecifications.length === 1 && Object.hasOwn(offer, 'price')) return { errors: ['ambiguous_offers'] };
  if (currentSpecifications.length === 0 && rawSpecifications.length > 0 && !Object.hasOwn(offer, 'price')) {
    return { errors: ['missing_offer'] };
  }

  const source = currentSpecifications[0] ?? offer;
  const price = strictPrice(source.price);
  if (price === null) return { errors: ['bad_price'] };
  const currency = normalizeWhitespace(source.priceCurrency || offer.priceCurrency).toUpperCase();
  if (!currency) return { errors: ['wrong_currency'] };
  if (currency !== 'GEL') return { errors: ['wrong_currency'] };

  return {
    errors: [],
    offer,
    source,
    price,
    currency,
    availabilityClaim: source.availability ?? offer.availability ?? null,
  };
}

function availabilityClaim(value) {
  if (typeof value === 'string' || typeof value === 'number') return normalizeWhitespace(value) || null;
  if (value && typeof value === 'object') {
    const candidate = value['@id'] ?? value.url ?? value.name;
    return typeof candidate === 'string' ? normalizeWhitespace(candidate) || null : null;
  }
  return null;
}

function sameSiteHost(left, right) {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

export function safeHttpsUrl(value, { sameHost } = {}) {
  if (typeof value !== 'string' || !value.trim()) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null;
  if (sameHost && url.hostname.toLowerCase() !== sameHost.toLowerCase()) return null;
  return url;
}

export function safeImageUrls(product, sourceUrl) {
  const source = safeHttpsUrl(sourceUrl);
  if (!source) return [];
  const raw = product?.image;
  const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
  const urls = [];
  for (const entry of values) {
    const candidate = typeof entry === 'string' ? entry : entry && typeof entry === 'object' ? entry.url ?? entry.contentUrl ?? entry['@id'] : null;
    const candidateUrl = typeof candidate === 'string' && candidate.startsWith('//') ? `https:${candidate}` : candidate;
    const parsed = safeHttpsUrl(candidateUrl);
    if (!parsed || !sameSiteHost(parsed.hostname, source.hostname)) continue;
    const href = parsed.href;
    if (!urls.includes(href)) urls.push(href);
  }
  return urls;
}

function compactExcerpt(value, maxLength = 1800) {
  const compact = normalizeWhitespace(value);
  return compact.length <= maxLength ? compact : `${compact.slice(0, maxLength - 1)}…`;
}

export function extractProductEvidence({ html, expectedSku, requestedUrl, finalUrl = requestedUrl }) {
  const page = String(html ?? '');
  const h1s = extractH1s(page);
  const parsedJsonLd = parseJsonLdScripts(page);
  const records = findProductRecords(parsedJsonLd);
  const errors = [];
  if (parsedJsonLd.parseErrors.length > 0) errors.push('malformed_jsonld');
  if (records.length === 0) errors.push('missing_product');
  if (records.length > 1) errors.push('ambiguous_product');

  const normalizedExpectedSku = normalizeSku(expectedSku);
  const skuMatches = records.filter(({ product }) => normalizeSku(product.sku) === normalizedExpectedSku && normalizedExpectedSku);
  if (records.length > 0 && records.every(({ product }) => !normalizeSku(product.sku))) errors.push('missing_sku');
  if (skuMatches.length > 1) errors.push('ambiguous_product_records');
  if (records.length > 0 && skuMatches.length === 0) errors.push('mismatched_sku');
  const selected = skuMatches.length === 1 && records.length === 1 ? skuMatches[0] : null;

  let name = null;
  let sourceSku = null;
  let offerEvidence = { errors: [] };
  let imageCandidateURLs = [];
  let sourceExcerpt = '';
  if (selected) {
    name = normalizeWhitespace(decodeHtml(selected.product.name));
    sourceSku = normalizeWhitespace(decodeHtml(selected.product.sku));
    if (!name) errors.push('missing_name');
    if (h1s.length === 0) errors.push('missing_h1');
    if (h1s.length > 1) errors.push('ambiguous_h1');
    if (name && h1s.length === 1 && normalizeIdentity(name) !== normalizeIdentity(h1s[0])) errors.push('name_h1_mismatch');
    offerEvidence = parseCurrentOffer(selected.product);
    errors.push(...offerEvidence.errors);
    imageCandidateURLs = safeImageUrls(selected.product, finalUrl);
    sourceExcerpt = compactExcerpt(`H1: ${h1s.join(' | ')} | JSON-LD Product: ${selected.rawScript}`);
  } else {
    if (h1s.length === 0) errors.push('missing_h1');
    if (h1s.length > 1) errors.push('ambiguous_h1');
    sourceExcerpt = compactExcerpt(`H1: ${h1s.join(' | ')} | JSON-LD scripts: ${parsedJsonLd.values.length}`);
  }

  const uniqueErrors = [...new Set(errors)];
  const valid = uniqueErrors.length === 0;
  return {
    valid,
    validationErrors: uniqueErrors,
    validationMessages: uniqueErrors.map((code) => FAILURE_MESSAGES[code] ?? code),
    h1: h1s.length === 1 ? h1s[0] : h1s,
    h1s,
    name,
    sourceSku,
    exactMatchSKU: valid || (selected !== null && uniqueErrors.every((code) => !['mismatched_sku', 'missing_sku', 'ambiguous_product_records'].includes(code))),
    sourcePrice: offerEvidence.price ?? null,
    sourceCurrency: offerEvidence.currency ?? null,
    sourceAvailabilityClaim: availabilityClaim(offerEvidence.availabilityClaim),
    imageCandidateURLs,
    sourceExcerpt,
    productRecordCount: records.length,
    offerEvidence,
  };
}

function createTimeoutSignal(timeoutMs) {
  if (typeof AbortSignal?.timeout === 'function') return { signal: AbortSignal.timeout(timeoutMs), cancel: () => {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function rowBase(item, checkedAt) {
  return {
    id: item?.id ?? null,
    merchantId: item?.merchantId ?? null,
    merchantSku: item?.merchantSku ?? null,
    productUrl: item?.productUrl ?? null,
    checkedAt,
    status: 'rejected',
    valid: false,
    statusCode: null,
    finalURL: null,
    hash: null,
    validationErrors: [],
    validationMessages: [],
    h1: null,
    name: null,
    sourceSku: null,
    exactMatchSKU: false,
    sourcePrice: null,
    sourceCurrency: null,
    sourceAvailabilityClaim: null,
    independentAvailability: 'unknown',
    availability: 'unknown',
    stockVerification: 'UNKNOWN',
    imageCandidateURLs: [],
    imageReuseRights: 'unknown',
    sourceExcerpt: '',
  };
}

export async function refreshOffer(item, {
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = () => new Date(),
} = {}) {
  const checkedAt = new Date(now()).toISOString();
  const row = rowBase(item ?? {}, checkedAt);
  const requested = safeHttpsUrl(item?.productUrl);
  if (!requested) {
    row.validationErrors = ['invalid_source_url'];
    row.validationMessages = [FAILURE_MESSAGES.invalid_source_url];
    return row;
  }
  if (typeof fetchImpl !== 'function') {
    row.validationErrors = ['source_fetch_error'];
    row.validationMessages = ['No fetch implementation was available.'];
    return row;
  }
  let response;
  let html = '';
  const timeout = createTimeoutSignal(timeoutMs);
  try {
    response = await fetchImpl(requested.href, {
      method: 'GET',
      redirect: 'follow',
      signal: timeout.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': READ_ONLY_USER_AGENT,
      },
    });
    html = await response.text();
  } catch (error) {
    row.validationErrors = ['source_fetch_error'];
    row.validationMessages = [error instanceof Error ? error.message : String(error)];
    timeout.cancel();
    return row;
  } finally {
    timeout.cancel();
  }

  row.statusCode = Number.isInteger(response.status) ? response.status : null;
  row.finalURL = typeof response.url === 'string' && response.url ? response.url : requested.href;
  row.hash = sha256(html);
  const final = safeHttpsUrl(row.finalURL);
  const errors = [];
  if (row.statusCode !== 200) errors.push('source_status_bad');
  if (!final || final.hostname.toLowerCase() !== requested.hostname.toLowerCase()) errors.push('cross_host_redirect');
  if (errors.length > 0) {
    row.validationErrors = errors;
    row.validationMessages = errors.map((code) => FAILURE_MESSAGES[code]);
    return row;
  }

  const evidence = extractProductEvidence({ html, expectedSku: item.merchantSku, requestedUrl: requested.href, finalUrl: final.href });
  Object.assign(row, {
    ...evidence,
    h1: evidence.h1,
    validationErrors: evidence.validationErrors,
    validationMessages: evidence.validationMessages,
    status: evidence.valid ? 'validated' : 'rejected',
    valid: evidence.valid,
    finalURL: final.href,
  });
  if (evidence.valid && evidence.offerEvidence.offer?.url) {
    const offerUrl = safeHttpsUrl(evidence.offerEvidence.offer.url, { sameHost: final.hostname });
    if (!offerUrl) {
      row.valid = false;
      row.status = 'rejected';
      row.validationErrors = [...row.validationErrors, 'unsafe_offer_url'];
      row.validationMessages = [...row.validationMessages, FAILURE_MESSAGES.unsafe_offer_url];
    } else if (offerUrl.href !== final.href) {
      row.valid = false;
      row.status = 'rejected';
      row.validationErrors = [...row.validationErrors, 'offer_url_mismatch'];
      row.validationMessages = [...row.validationMessages, FAILURE_MESSAGES.offer_url_mismatch];
    }
  }
  return row;
}

async function mapWithConcurrency(items, maxConcurrency, callback) {
  const rows = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      rows[index] = await callback(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(maxConcurrency, items.length) }, () => worker()));
  return rows;
}

function proposedUpdate(row) {
  return {
    id: row.id,
    merchantId: row.merchantId,
    merchantSku: row.merchantSku,
    productUrl: row.productUrl,
    finalURL: row.finalURL,
    exactMatchSKU: row.exactMatchSKU,
    name: row.name,
    h1: row.h1,
    sourceSku: row.sourceSku,
    sourcePrice: row.sourcePrice,
    sourceCurrency: row.sourceCurrency,
    sourceAvailabilityClaim: row.sourceAvailabilityClaim,
    independentAvailability: 'unknown',
    availability: 'unknown',
    stockVerification: 'UNKNOWN',
    checkedAt: row.checkedAt,
    hash: row.hash,
    imageCandidateURLs: row.imageCandidateURLs,
    imageReuseRights: 'unknown',
    sourceExcerpt: row.sourceExcerpt,
  };
}

export function makeProposedUpdatesJSON(receipt, expectedRowCount = EXPECTED_PILOT_ROW_COUNT) {
  const validated = receipt.rows.filter((row) => row.valid);
  for (const row of validated) {
    if (!isCanonicalCheckedAt(row.checkedAt)) {
      throw new Error(`Refusing proposed update ${row.id ?? '<unknown>'}: checkedAt is not a canonical ISO timestamp.`);
    }
  }
  return {
    schemaVersion: 'trendingnow/proposed-offer-updates/v1',
    reviewRequired: true,
    appliedToCatalog: false,
    expectedRowCount,
    validatedRowCount: validated.length,
    validated18RowCount: expectedRowCount === EXPECTED_PILOT_ROW_COUNT ? validated.length : null,
    rejectedRowCount: receipt.rows.length - validated.length,
    rows: validated.map(proposedUpdate),
  };
}

function isCanonicalCheckedAt(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

export async function refreshOffers(items, {
  fetchImpl = globalThis.fetch,
  maxConcurrency = DEFAULT_MAX_CONCURRENCY,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = () => new Date(),
  expectedRowCount = EXPECTED_PILOT_ROW_COUNT,
} = {}) {
  if (!Array.isArray(items)) throw new TypeError('Offer catalog must be an array.');
  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1 || maxConcurrency > DEFAULT_MAX_CONCURRENCY) {
    throw new RangeError(`maxConcurrency must be an integer from 1 to ${DEFAULT_MAX_CONCURRENCY}.`);
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new RangeError('timeoutMs must be a positive integer.');
  const generatedAt = new Date(now()).toISOString();
  const rows = await mapWithConcurrency(items, maxConcurrency, (item) => refreshOffer(item, { fetchImpl, timeoutMs, now }));
  const receipt = {
    schemaVersion: 'trendingnow/priority-offer-refresh/v1',
    scope: 'Read-only public GET merchant evidence; no catalog writes, stock verification, image download, or publication approval.',
    generatedAt,
    expectedRowCount,
    requestedRowCount: items.length,
    validatedRowCount: rows.filter((row) => row.valid).length,
    rejectedRowCount: rows.filter((row) => !row.valid).length,
    validated18RowCount: expectedRowCount === EXPECTED_PILOT_ROW_COUNT ? rows.filter((row) => row.valid).length : null,
    maxConcurrency,
    timeoutMs,
    rows,
  };
  receipt.proposedUpdatesJSON = makeProposedUpdatesJSON(receipt, expectedRowCount);
  return receipt;
}

export function summarizeFailures(receipt) {
  const counts = {};
  for (const row of receipt.rows) {
    for (const code of row.validationErrors) counts[code] = (counts[code] ?? 0) + 1;
  }
  return counts;
}
