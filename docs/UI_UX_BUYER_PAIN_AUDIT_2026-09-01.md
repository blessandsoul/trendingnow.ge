# TrendingNow buyer UI/UX audit

Date: 2026-09-01
Scope: current local Georgian storefront at `http://localhost:3000`, audited at 320, 390, 768, 1024, and 1440 px.
Method: rendered-flow review, direct interaction, responsive geometry checks, code-to-UI trace, accessibility spot checks, and the current automated UI suite.

## Post-fix verdict

The audited frontend defects have been corrected. The interface now gives every pain a truthful UI response or a specific next action, but real supplier data and operations are still required to remove most buyer uncertainty.

- Fully solved by the current frontend: 4/20
- Truthfully mitigated with a working next action: 16/20
- Contradicted or left as a dead end in the current UI: 0/20

This is not a claim that all 20 buyer pains are commercially solved. Availability, exact product facts, delivery promises, active payment methods, price evidence, and support response time remain operational dependencies.

## Pain-by-pain result

| ID | Current result | Audit finding |
|---|---|---|
| TN-BX-01 | Partial | Search, categories, sorting, task shortcuts, and price filters work. Mobile filters now open and close through a labelled control, and pagination renders only the two real pages. Richer guided choice still needs merchandising rules. |
| TN-BX-02 | Partial | The visual AI mark and illustrative-photo disclosure are present. There are still no verified real supplier photos, so visual mismatch risk remains. |
| TN-BX-03 | Partial | Business identity, phone, email, delivery, warranty, and contact pages are consistent. The UI no longer invents support hours or a response SLA; a monitored mailbox and measured response time remain operational work. |
| TN-BX-04 | Partial | Cards and the main product decision area now show the catalog price without an unsupported discount percentage or savings claim. The dated buyer passport keeps the previous displayed price as evidence, and the final amount is confirmed before payment. A backend price lock is still absent. |
| TN-BX-05 | Partial | “Available to order” is honest and avoids a false stock claim, but there is no live stock or reservation confirmation. The availability pain remains until manual confirmation. |
| TN-BX-06 | Partial | Product, cart, checkout, FAQ, warranty, and delivery pages now use the same model: zone price is shown, exact timing is confirmed after checking the address and availability, and no fixed fast-delivery promise is made. A real ETA still requires logistics data. |
| TN-BX-07 | Solved | A guest order path exists; account creation is optional. |
| TN-BX-08 | Solved | The short form now reflows without internal or document overflow at 320 and 390 px. Radix dialog behavior moves focus inside, hides the background from accessibility APIs, supports Escape, traps modal focus, and returns focus to the checkout trigger. |
| TN-BX-09 | Partial | Checkout and the payment page now state that no payment is taken on the site and that the actual method is agreed during confirmation. Inactive providers are not presented as active. A connected payment method remains an operational dependency. |
| TN-BX-10 | Solved | A detailed public return/warranty policy, 14-day route, email, phone, and required request details are available before ordering. A structured return request would still improve the flow. |
| TN-BX-11 | Partial | Missing size and fit are now shown before the order buttons, and the support action prefills the product name and SKU. Verified dimensions or a size guide are still missing. |
| TN-BX-12 | Partial | Missing compatibility is shown before the order buttons with a product-aware confirmation action. A make/model selector or matrix still requires structured data. |
| TN-BX-13 | Solved | The comparison contains only unique same-category alternatives, hides when none exist, has a visible mobile swipe cue, an accessible region name, and links to every compared product. |
| TN-BX-14 | Partial | The visual AI icon is correctly compact, and the later passport explains that imagery is illustrative. The main product visual is still not backed by a verified real-product photo. |
| TN-BX-15 | Partial | Missing material and care are now visible before the order buttons and lead to a SKU-prefilled confirmation action. Verified material and care data are still missing. |
| TN-BX-16 | Partial | Missing package contents are now visible before the order buttons and lead to a SKU-prefilled confirmation action. Exact included-parts data are still missing. |
| TN-BX-17 | Partial | Unsupported discount and savings framing has been removed from cards and the main product decision area. The passport shows dated catalog evidence without claiming a market ranking; compliant market snapshots are still absent. |
| TN-BX-18 | Partial | Task shortcuts work as real category or price filters, but they are static category aliases rather than a guided need finder. |
| TN-BX-19 | Not solved | Gift mode consists of two price caps and a link to return terms. There is no recipient, occasion, suitability, or exchange-oriented selection aid. |
| TN-BX-20 | Partial | Product support now prefills product name and SKU; order-success support prefills the public order code. The contact page gives one email route without inventing a response SLA. Monitoring and response measurement remain operational dependencies. |

## Confirmed strengths

- Header search no longer breaks the header at 320, 390, 768, 1024, or 1440 px; no document-level horizontal overflow was observed on catalog pages.
- The visual system is coherent on desktop and mobile, with strong card consistency and clear primary actions.
- Product galleries expose six images, thumbnail scrolling, a mobile swipe hint, `touch-action: pan-y`, pointer-based swipe handling, and passing swipe unit tests.
- Guest ordering exists and the accessible modal clearly states that no payment occurs before price, availability, and delivery confirmation.
- Contact information consistently uses `contact@ainow.ge`.
- Post-fix automated verification passed: 24 test files, 56 tests, TypeScript type checking, and lint.

## Corrected structural risks

1. Checkout reflow and modal accessibility corrected at 320/390.
2. Pagination now comes from `totalPages`; the inert grid control was removed and the mobile filter control is labelled and functional.
3. Payment and delivery use one order-request truth model across public buying surfaces.
4. Size, compatibility, material, and package uncertainty now appears before the order actions.
5. Comparison now accepts same-category substitutes only and hides without an alternative.
6. Product and order support links now prefill SKU or public order code.
7. Fake `Recently viewed` labels were renamed to truthful catalog labels.
8. Unsupported discount percentages, crossed-out prices, and savings claims were removed from cards and the primary product decision area.

## Accessibility evidence and limits

- The primary action surface now uses `#D92F49` with white text; normal muted text on the light storefront uses the darker `#657080` token.
- Checkout background content receives `aria-hidden` while open, and focus opens inside the dialog and returns to the trigger after Escape.
- The comparison scroller is named and exposes a visible mobile continuation cue.
- Many touch targets are 40–48 px and acceptable; some secondary targets are 32 px but remain above the WCAG 2.5.8 minimum.
- This was a combined UX/accessibility spot audit, not a full assistive-technology or WCAG conformance certification. A real touch device was not available, so the main-image swipe was verified through current pointer implementation, `touch-action`, thumbnails, and the passing swipe tests rather than a physical finger gesture.

## Post-fix rendered evidence

- 320 px checkout: dialog `clientWidth=264`, `scrollWidth=264`; form `clientWidth=264`, `scrollWidth=264`.
- 390 px checkout: dialog `clientWidth=334`, `scrollWidth=334`; form `clientWidth=334`, `scrollWidth=334`.
- Checkout opens with focus inside, Escape closes it, and focus returns to the checkout button.
- Catalog exposes pages 1 and 2 only; direct `page=99` resolves to page 2 with six real catalog products and no empty state.
- Mobile filters expose `aria-expanded`, open and close visibly, and cause no document overflow.
- Comparison rendered `მოვლა / მოვლა` for the audited care product; unrelated catalog categories were excluded.
- Product support mail includes product name and SKU; order-success support mail includes the public order code.

## Evidence files

Screenshots are saved in:

`C:\Users\User\.codex\visualizations\2026\08\29\01a04f02-8fbf-72a1-98da-9f57757b59a9\trendingnow-uiux-audit-2026-09-01`

Key captures:

- `02-catalog-top-mobile.png`
- `03-catalog-controls-mobile.png`
- `04-empty-pagination-page3.png`
- `09-purchase-before-passport.png`
- `11-checkout-overflow-320.png`
- `12-comparison-mobile.png`
- `13-catalog-desktop.png`
