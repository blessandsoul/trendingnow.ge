# Responsive text repair — 2026-09-08

## Proven defects

- In the homepage yellow panel the Georgian compound exceeded its190px text column by86px at viewport768/1024. Page width stayed within the viewport because the outer shell clips overflow. Prior page-width-only QA therefore missed it.
- At320px the kitchen heading and outdoors description exceeded their112px columns.
- At1280px the shared header navigation left only26px for the search input.

## Repairs

Inherited `overflow-wrap:anywhere`, shrinkable text boxes, shorter natural Georgian hero copy and `min-w-0` on the yellow panel. Catalog display headings now use1.08/1.12 line-height rather than0.86/0.92. Inline shared-header navigation moved from1280 to1536px; measured search widths now382px at1024,472px at1280/1440 and185px at1536. Menu/search functionality is retained.

## Browser evidence

`scripts/qa-responsive-text.py` measures individual rendered text fragments against their own block boundaries, even when the page hides overflow. Intentional line clamps and ellipses are excluded. It records errors and final URLs; an inaccessible or redirected page is not silently counted as its authenticated content.

- `artifacts/responsive-text/qa.json`:201 route/viewport observations. Public route families on320/390/768/1440, additional1024, English/Russian variants at320, all50 local editorial drafts. Text-overflow findings0, navigation/check errors0 after retries.
- Of those201,10 protected URLs redirected to login. Actual authenticated dashboard/admin tables and successful-order data remain unverified. Unknown-page/error states are tested, not real order completion.
- `products.json`:all18 legacy and18 pilot product pages at320px; findings0, check errors0.
- `interactions.json`:14 base observations across320/390/768/1024/1280/1440/1536,31 menu/filter/search-only/full-header states. Text findings0 and check errors0. Search minimum width assertion passed. Final screenshots use reduced motion to avoid capturing half-finished entrance animations.

Screenshots of the corrected home panel and page were inspected. These are viewport emulations, not physical-device tests or a guarantee about every possible content/account state. No push/deploy performed.

## Local runtime and reproducibility

The original webpack development process emitted `Manifest file is empty`, chunk-load failures and eventually stopped. Failures were retained as failed checks and retried, not accepted as responsive passes. A separate build folder and standard Turbopack development run completed the remaining checks; exact underlying webpack defect was not established. No existing build directory was deleted.

Current local run at127.0.0.1:3014 uses `TRENDINGNOW_RESPONSIVE_QA=1`, `TRENDINGNOW_EDITORIAL_DRAFT_DIR` pointing to the saved batch, and `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3014`. The optional flag selects ignored `.next-responsive-qa`; production/default remains `.next`. Next added its generated type directories to tsconfig. Other projects/processes were not stopped.

CSS regression coverage verifies wrapping separately from clipping. The navigation API test now mocks the API module before import, avoiding its previous cold-import timeout; assertions and timeout limits were not weakened.

Final verification: 144/144 tests passed (36 files). Production build completed successfully, including TypeScript and generation of 38 static pages. ESLint and git diff --check passed. Next.js reports middleware/Edge Runtime deprecation warnings; these do not prevent the build. The isolated local server returned HTTP 200 at http://127.0.0.1:3014/. No production deployment was performed.
