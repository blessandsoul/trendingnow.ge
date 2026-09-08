# TrendingNow manual site release — 2026-09-08

## Authority and scope

The owner explicitly requested publication, push and deployment after the outstanding automated SEO-admission limitations were disclosed. This is a manual owner-authorized site release, not an automatic SEO scheduler run. No scheduler quota, threshold, or gate result is changed.

- Publish the 35 standalone collections selected after consolidation; preserve all 50 original article files and the 15 supporting drafts outside the public bundle.
- Ship the accumulated Bold Discovery editorial storefront, external merchant offers, saved/compare interactions, responsive fixes and exact product photography already requested by the owner.
- Do not claim merchant agreements, image ownership, stock availability, native-language certification, ranking or revenue. Unknown characteristics and dated seller sources remain explicit.
- Development-only editorial preview remains unavailable in production.

## Preflight evidence

- Verified mapped Coolify application: ID 70, UUID `nlfr236zdd1j3ewrsal5xmn7`, `https://trendingnow.ge,https://www.trendingnow.ge`, repository `blessandsoul/trendingnow.ge`, branch `main`, Dockerfile `/Dockerfile`.
- Pre-release source and remote main: `85e31da04317715f81f2c3762ef5879e4ad80b8d`; deployed application reported healthy.
- Frontend and backend health endpoints returned HTTP 200 before release.
- Baseline UI suite: 193/193 tests; typecheck passed; lint: zero errors, six warnings in test mocks.
- Consolidation traceability check passed: 50 preserved, 15 merged supports, 35 standalone candidates, no hash/proof errors. This check does not grant automatic editorial admission.

Release completion and production browser evidence are recorded separately after deployment; this preflight document alone is not proof of publication.

## Local verification of the release bundle

- Full UI suite: 197/197 passed; 13/13 offer-refresh unit checks passed; production compilation and TypeScript passed; lint zero errors (six test-mock warnings).
- Parent compared all 35 bundled titles, excerpts, bodies, product IDs and source URLs with the frozen originals: no differences.
- Local standalone production rendering: 35 articles at 360/1440px, canonical URLs, indexability, exact product links and no text/document overflow. One transient external image load was rechecked successfully at both widths; other 69 views passed first eager-image run. Eager loading is a QA step to include off-screen lazy images, not a site change.
- Ten additional route/sitemap/preview-boundary checks passed. Eight interaction checks passed: typed search, saved/reload/undo, cross-tab saved items, constrained comparison and scroll, two-gesture header, honest legacy order handling/contact, accessible locale menu, loaded fonts.
- Browser evidence: local `artifacts/manual-release-local-eager-20260908`, `manual-release-local-image-recheck-20260908` and `manual-release-local-actions-20260908`; screenshots independently viewed by parent. These are local evidence, not live proof.
