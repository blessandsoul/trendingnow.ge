# Catalog navigation and favorite controls — 2026-09-08

Local-only fix; no deployment or inventory import.

Cause: Bold Discovery navigation sent English category tokens as free-text searches, but the fallback inventory contains Georgian names. Home/tech/gift/bag links consequently resolved to no results. Main catalog also has no lamp, coffee, headphone or kitchen collection matching the former promotional links; the separate external-store pilot is not silently merged into legacy commerce.

Changes:
- Shared normalization for old URLs, UI filters, API parameters and local fallback. Home/tech use actual category slugs; bag searches the existing Georgian backpack; gifts explicitly use a 60 GEL budget.
- New navigation emits actual filter URLs. Missing coffee/headphone/kitchen collections are marked as preparing rather than linking to empty lists. Hero links to the complete catalog without claiming a lamp collection.
- Empty results provide a reset to all products. Unknown queries remain genuinely empty; no unrelated-item fallback added.
- Favorite visual surface: 24px in compact cards (14px heart), 32px in standard cards. Actual interactive target remains44px; pressed state, keyboard focus and pending state preserved.

Verification: 143/143 tests, TypeScript, ESLint and diff check passed. API normalization is covered with a mock; the local API address returned404 during read-only probing, so rendered local catalog uses the existing fallback. This is not a claim of backend readiness or stock availability.

Browser check script: scripts/qa-catalog-navigation.py. Evidence directory: artifacts/catalog-navigation/. Do not infer completed browser QA from screenshots alone; final qa.json records completion.

Final browser result:20 catalog route/viewport checks (390/1440px) returned products, old links included. Empty-reset PASS, pageErrors0, no horizontal overflow. Product detail compact controls measured24px visual/14px icon/44px target at both widths. First cold detail navigation exceeded30s; repeat using DOM-ready plus explicit visible-card wait passed. Screenshot inspected. No production release performed.
