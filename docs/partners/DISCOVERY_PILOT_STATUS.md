# Source-backed discovery pilot — 2026-09-07

## Actual status

Local working preview, NOT a released catalog migration. Existing /products, old product IDs, checkout and order history are preserved. Do not deploy this as a completed storefront replacement.

- 30 distinct research candidates / 4 stores: `pilot-candidates-2026-09-07.json`.
- 18 exact source-backed offers / 2 stores (12 PCShop, 6 Elite): `src/features/storefront/data/discovery-pilot.json`.
- Source receipts: `pilot-direct-probe-2026-09-07.json`. Read-only recheck: `node scripts/check-merchant-candidates.mjs`. This script NEVER promotes a record automatically.
- Alta direct probes received 403 (browser-tool transport unavailable); web-index pages are not substituted for fresh direct verification.
- Three VELI product URLs returned HTTP 200 **maintenance pages**; excluded.
- Elite desk/iron returned HTTP 200 without usable product identity; excluded.
- No source images copied. No rights/feed permission or merchant partnership claimed. Product photography is visibly pending, not replaced with a fabricated exact product.

## Working paths

- `/discovery-preview`: separate noindex catalog with search/SKU and category filters.
- `/products/find-{id}`: independent noindex product route, no fallback into the legacy inventory/own checkout.
- `/go/{id}`: server-validated, non-cacheable redirect to a reviewed exact allowlisted seller URL. Caller query parameters cannot override destination. Unknown/expired offers return 410. HEAD does not log an event.
- `merchant_outbound_redirect` is a structured server-log event, **not** a unique human click, sale, attribution, retained analytics database or commission.
- Price/availability snapshot expires after 24 hours; link review after 30 days. Server request time is passed unchanged to the client. Runtime guards recheck on redirect.
- Merchant product names and SKUs are retained exactly; generated category art is not presented as seller photography. UI labels exist in ka/en/ru.

## SEO handoff

Actual `/seo-autocontent` delegation performed. Admission is `DRAFTED_HOLD`, not a content run. The existing GSC packet has zero query rows; no qualifying current buyer-evidence packet, published exact-item destinations or pinned SEO deployment mapping was established. Main agent does not bypass /article or /lang. Runtime dashboard remains draft-only. No article published.

## Release gates still open

1. Finish a useful reviewed 30-item set across at least 3 stores; do not pad with broken links or variant duplicates.
2. Exact standardized photography with an appropriate content-use basis; merchant delivery/returns source checks and buyer-relevant limitations.
3. Accepted SEO demand/SERP brief, editorial article/language validation, exact production mapping.
4. Replace legacy catalog/checkout entry points coherently, including saved items and old URLs; retain historical orders. Current preview does NOT do that migration.
5. Build + responsive/interactions QA, then authorized commit/push/deployment and live confirmation. Local QA is not a live release.

## Local verification

- Typecheck, ESLint and production build passed.
- Vitest 104/104 after initial fixes. Browser QA: 16/16 renders (320/390/768/1440, catalog + ka/en/ru detail), no horizontal overflow, no own-cart link and no page errors. SKU search, client navigation, allowlisted redirect and unknown-offer 410 passed.
- Browser QA found Node/browser Georgian currency-symbol hydration drift; fixed with deterministic GEL/UTC snapshot formatting rather than suppressing hydration errors.
- Run `python scripts/qa-discovery-pilot.py` with local server on 127.0.0.1:3014; screenshots in `artifacts/discovery-pilot/`.
