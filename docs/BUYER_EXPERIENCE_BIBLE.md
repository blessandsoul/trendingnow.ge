# TrendingNow buyer experience bible

Status: canonical

Owner: TrendingNow storefront

Last reviewed: 2026-09-01

This file is the single source of truth for buyer-facing product decisions. A component, public text, test, or operational workflow may extend this contract, but it must not contradict or silently redefine it.

## 1. Product model

TrendingNow is currently a single-seller marketplace for ordinary buyers. Trending products are found and checked internally. The public experience must feel like a familiar store: find a useful item, understand what is known, place an order without mandatory registration, confirm the exact terms, receive the item, and have one visible support route.

The catalog is not a warehouse ledger. `Available to order` means the buyer may request the item. Supplier availability, final price, exact package contents, delivery timing, and any unverified characteristic must be confirmed before payment.

## 2. Non-negotiable truth boundary

Every buyer-relevant fact has one of three states:

| State | Meaning | Required UI behavior |
|---|---|---|
| `CONFIRMED` | The value exists in the current verified catalog or an active operational source | Show the value and its source date when time-sensitive |
| `NEEDS_CONFIRMATION` | The buyer can proceed, but the exact value must be checked before payment | Say what needs checking and provide a contact or order action |
| `UNAVAILABLE` | No reliable value or workflow exists | Do not infer it; explain the gap and provide the nearest useful next action |

No screen may leave an unknown fact as a dead end. Unknown size, compatibility, material, package contents, price, delivery, or support status must lead to a specific confirmation step.

## 3. Design contract

- Design family: Signal Pop Commerce.
- Palette: Graphite `#11141B`, Paper `#F5F7FA`, White `#FFFFFF`, Signal coral `#FF4057`, accessible action coral `#D92F49`, Trust green `#237A3E`, Mist border `#DDE3EA`.
- Type: BOG for Georgian storefront copy, with the existing system fallbacks for utility text.
- Radius system: 8 to 14 pixels for commerce surfaces; larger radii only for established page shells.
- Primary attention path: product image and name, current price, order action.
- Secondary attention path: buyer passport, verified facts, and facts requiring confirmation.
- Tertiary attention path: related products, editorial explanation, newsletter.
- Signature component: the buyer passport is an evidence ledger, not a row of decorative feature cards.
- Motion: short hover, press, and horizontal swipe feedback only. Reduced-motion support remains active.
- Public Georgian copy uses natural Mkhedruli. Latin brand fragments may remain uppercase.

## 4. The 20 buyer pains

### TN-BX-01: Too many products and no clear choice

- Pain: the buyer cannot quickly narrow a large marketplace catalog.
- Required surfaces: home, catalog, header search.
- UI response: curated rows, useful categories, text search, price filters, stable sorting, concise product descriptions.
- Truth boundary: popularity and trend labels require a current merchandising source. Category and price filters use only catalog data.
- Operational dependency: catalog curation and category maintenance.
- Acceptance: a buyer can reach a relevant product from a task, category, search term, or budget without registering.

### TN-BX-02: The product may differ from the image

- Pain: polished marketplace photography may be mistaken for exact product evidence.
- Required surfaces: product card, product gallery, specifications.
- UI response: a compact AI icon on illustrative images, a six-role gallery, mobile swipe, and a visible split between illustrative visuals and confirmed facts.
- Truth boundary: an image never proves dimensions, material, compatibility, color accuracy, or package contents.
- Operational dependency: supplier photographs and item verification workflow.
- Acceptance: the gallery swipes horizontally while the page still scrolls vertically; factual claims come from the buyer passport or specifications.

### TN-BX-03: An unknown store feels risky

- Pain: the buyer cannot tell who will answer if something goes wrong.
- Required surfaces: header, footer, product, contact, delivery, payment, warranty, FAQ.
- UI response: consistent business identity, `contact@ainow.ge`, buyer-confidence rail, and direct links to public terms.
- Truth boundary: do not claim protected payment, official warranty, or a response SLA without active evidence.
- Operational dependency: monitored support mailbox and published legal terms.
- Acceptance: contact and terms are reachable before checkout and after an order request.

### TN-BX-04: The final price is unclear

- Pain: the visible item price may not equal the final payable amount.
- Required surfaces: card, product, cart, checkout.
- UI response: current catalog price on cards and in the primary decision area; previous displayed price and source date only in the evidence passport; delivery charge in the cart; and a confirmation-before-payment notice.
- Truth boundary: an old displayed price is not a market average; a catalog price is not a locked final price.
- Operational dependency: final-price lock in the order backend.
- Acceptance: no total is labelled final until the order has been reviewed.

### TN-BX-05: The product may be unavailable

- Pain: a product card may look like guaranteed warehouse stock.
- Required surfaces: card, product, cart, checkout.
- UI response: `Available to order` status and explicit availability confirmation before payment.
- Truth boundary: never display `In stock` without a live inventory source.
- Operational dependency: supplier availability check for product and quantity.
- Acceptance: order status language stays identical across all buying surfaces.

### TN-BX-06: Delivery timing is unclear

- Pain: the buyer does not know when the order will arrive.
- Required surfaces: product, cart, checkout, delivery page, order status.
- UI response: delivery zone selection, known charge, and timing confirmed by address and availability.
- Truth boundary: no fixed fast-delivery claim without an active logistics source.
- Operational dependency: promised delivery window and order-status backend.
- Acceptance: the buyer sees how timing will be confirmed before submitting the order.

### TN-BX-07: Registration blocks purchase

- Pain: account creation adds friction before the buyer trusts the store.
- Required surfaces: cart and checkout.
- UI response: guest checkout is primary; account creation is optional and explains its benefit.
- Truth boundary: never imply that a guest order has account-only tracking.
- Operational dependency: guest order intake and public order code.
- Acceptance: a buyer can submit an order request without signing in.

### TN-BX-08: Checkout is long or fragile

- Pain: too many fields or a broken mobile dialog loses the order.
- Required surfaces: cart and checkout.
- UI response: short contact form, delivery zone, compact order summary, explicit errors, and preserved cart state.
- Truth boundary: submission success means the request was accepted, not that stock, price, payment, or delivery is confirmed.
- Operational dependency: production order intake and failure monitoring.
- Acceptance: required controls remain usable at 320 pixels and errors provide a next action.

### TN-BX-09: The payment method is unknown

- Pain: the buyer cannot tell how payment will happen.
- Required surfaces: payment page, checkout, footer.
- UI response: explain that active payment options are shared after order confirmation; show provider badges only when connected.
- Truth boundary: no inactive card, bank, cash, installment, or protected-payment claim.
- Operational dependency: connected payment provider and method availability.
- Acceptance: public copy never presents an unavailable payment method as active.

### TN-BX-10: The return flow is unclear

- Pain: the buyer does not know where to start a return or issue request.
- Required surfaces: product, warranty and returns page, footer, order success.
- UI response: visible terms and one support route using the order code when available.
- Truth boundary: do not claim free returns or automatic approval.
- Operational dependency: return case storage and status workflow.
- Acceptance: the buyer can find the return route before ordering and after submitting an order request.

### TN-BX-11: Fit or physical size is unclear

- Pain: the buyer cannot tell whether the item fits a body, room, bag, or intended space.
- Required surfaces: buyer passport and future structured specifications.
- UI response: show verified dimensions or size guide when available; otherwise label the value `Needs confirmation` and ask for the intended fit before payment.
- Truth boundary: never estimate scale from an illustrative image.
- Operational dependency: verified measurements and apparel size tables.
- Acceptance: missing measurements include a contact action, not a blank specification row.

### TN-BX-12: Device or vehicle compatibility is unclear

- Pain: the buyer is unsure whether an accessory works with a phone, car, appliance, or device.
- Required surfaces: buyer passport and future compatibility selector.
- UI response: show verified compatible and incompatible models; while data is absent, ask for brand and model before payment.
- Truth boundary: category similarity does not prove compatibility.
- Operational dependency: structured compatibility data.
- Acceptance: the UI never presents generic category membership as model compatibility.

### TN-BX-13: Similar versions are difficult to compare

- Pain: related products look similar without a useful decision rule.
- Required surfaces: product detail.
- UI response: horizontal comparison ledger for the current product and up to two related products using only name, category, catalog price, short description, and data date.
- Truth boundary: a comparison cell may not infer features absent from the catalog.
- Operational dependency: normalized attributes for richer future comparisons.
- Acceptance: comparison remains horizontally scrollable on mobile and links to each product.

### TN-BX-14: A polished visual may hide the real item

- Pain: the buyer may treat an AI or promotional image as an exact photograph.
- Required surfaces: cards, gallery, buyer passport.
- UI response: compact AI icon, six fixed image roles, and explicit factual priority for verified characteristics.
- Truth boundary: only the icon is placed on the image; explanatory disclosure remains text in the buyer passport.
- Operational dependency: supplier photos and item inspection.
- Acceptance: every public product image carries the same compact icon and no repeated `AI visual` label.

### TN-BX-15: Material quality and durability are unclear

- Pain: appearance alone does not explain material, care, limitations, or expected use.
- Required surfaces: buyer passport and future structured specifications.
- UI response: show verified material and care data; otherwise request confirmation and avoid quality adjectives.
- Truth boundary: never infer material, waterproofing, safety, or durability from an image or marketplace title.
- Operational dependency: verified material, care, and limitation data.
- Acceptance: unsupported quality superlatives do not appear in public copy.

### TN-BX-16: Package contents are unclear

- Pain: the buyer cannot tell what is included and what must be bought separately.
- Required surfaces: buyer passport, specifications, gallery role 6.
- UI response: fixed `Package contents` and `Required separately` fields when verified; until then show the catalog description and require package confirmation before payment.
- Truth boundary: phrases such as `set` or `10-in-1` may be repeated only as catalog text and do not prove every included part.
- Operational dependency: structured package-content data and supplier confirmation.
- Acceptance: the purchase decision never relies on visual inference of included accessories.

### TN-BX-17: Price competitiveness is unclear

- Pain: the buyer cannot judge whether a discount or comparison price is trustworthy.
- Required surfaces: buyer passport and product price block.
- UI response: price passport with current catalog price, previous displayed price when present, source date, and the final-price boundary.
- Truth boundary: do not call the price best, cheapest, market average, or competitive without compliant market snapshots.
- Operational dependency: compliant marketplace price snapshots for a future comparison range.
- Acceptance: the current interface provides evidence and date, not an unsupported ranking claim.

### TN-BX-18: The buyer knows the task, not the product name

- Pain: ordinary buyers search for an outcome rather than a catalog term.
- Required surfaces: catalog.
- UI response: task-based finder with everyday entry points for home care, car, daily style, useful technology, and an active day.
- Truth boundary: a task link only applies real category filters; it does not claim personal recommendation accuracy.
- Operational dependency: maintained category decision rules.
- Acceptance: each task opens a real filter and can be cleared using the existing catalog controls.

### TN-BX-19: Choosing a gift is stressful

- Pain: the buyer has a budget but may not know the right category or exchange conditions.
- Required surfaces: catalog, returns page.
- UI response: gift shortcuts by real budget and a direct path to exchange and return terms.
- Truth boundary: do not claim gift packaging, age suitability, or guaranteed exchange unless operations support it.
- Operational dependency: gift packaging and verified suitability data for a future full gift mode.
- Acceptance: current gift shortcuts filter by real price and do not advertise unavailable packaging.

### TN-BX-20: The buyer fears support will disappear after payment

- Pain: there is no obvious post-order issue route.
- Required surfaces: product, footer, order success, account orders.
- UI response: one support email, visible order code, SKU-prefilled product support, order-code-prefilled post-order support, and an account order link when authenticated.
- Truth boundary: no response-time promise without a measured support workflow.
- Operational dependency: monitored mailbox, order-linked issue intake, support status backend.
- Acceptance: the order-success screen keeps the order code visible and provides a support action for guests and signed-in buyers.

## 5. Product image standard

Every product uses the `tn-product-images.v1` six-slot set:

1. Hero: clean main product visual.
2. Catalog: crop optimized for the product grid.
3. Detail: close view of shape or controls.
4. Context: realistic use environment.
5. Benefit: scale or practical use cue without unsupported text.
6. Complete: front, back, package, or included-parts view.

All slots use the same compact AI icon. Baked text is not used for factual claims. Product names, prices, status, and explanations remain accessible HTML text.

## 6. Responsive acceptance

- No document-level horizontal overflow at 320, 390, 768, 1024, or 1440 CSS pixels.
- Header search uses available space without forcing navigation or actions outside the viewport.
- Buyer passport becomes one column on narrow screens and a two-column evidence ledger when space allows.
- Task finder and product comparison use contained horizontal scrolling, scroll snapping, and visible focus states on narrow screens.
- Gallery swipe preserves vertical page scrolling and offers previous and next buttons.
- Search, cart, quantity, checkout, support, and navigation controls keep at least a 40-pixel practical hit area.
- CTA labels do not wrap on desktop.
- Loading, empty, error, unknown-data, and support states always provide a next action.

## 7. Banned public claims without an active source

- `In stock`
- `24-hour delivery`
- `Delivery in 1-2 days`
- `Free returns`
- `Official warranty`
- `Protected payment`
- `Best price`
- `Cheapest`
- `Market average`
- `Guaranteed compatibility`
- `Waterproof`, `safe`, or `durable` inferred from an image
- Gift packaging or age suitability without verified data
- A support response window without measured operations

## 8. Current component map

| Contract IDs | Implementation |
|---|---|
| TN-BX-01, TN-BX-18, TN-BX-19 | `ProductsStorefront`, `BuyerNeedFinder`, header search, category and price filters |
| TN-BX-02, TN-BX-14 | `ProductCard`, `AiImageMark`, `ProductGallery`, `tn-product-images.v1` |
| TN-BX-03, TN-BX-05, TN-BX-06, TN-BX-10 | `BuyerConfidenceRail`, footer, public information pages |
| TN-BX-04, TN-BX-11, TN-BX-12, TN-BX-15, TN-BX-16, TN-BX-17 | `BuyerDecisionPassport` |
| TN-BX-07, TN-BX-08, TN-BX-09 | cart, guest checkout, payment-method truth copy |
| TN-BX-13 | `ProductComparisonLedger` |
| TN-BX-20 | product support action, `OrderSuccessPage`, account orders |

## 9. Release gate

A buyer-experience release passes only when:

1. All 20 stable IDs remain present in this file.
2. Every ID maps to a real public surface and a truth boundary.
3. No banned public claim appears without an active data source.
4. Georgian UI copy passes the grammar and script check.
5. Typecheck, lint, unit tests, and production build pass.
6. Browser checks pass at 320, 390, 768, 1024, and 1440 pixels.
7. Frontend completion and operational dependency are reported separately.

## 10. Operational backlog

The frontend can prevent confusion, expose evidence, and collect an order request. The following still require real operations or backend work:

1. Supplier availability check for product and quantity.
2. Final retail amount and delivery-charge lock.
3. Verified measurements, compatibility, materials, care, limitations, and package contents.
4. Compliant marketplace price snapshots.
5. Promised delivery window and order status.
6. Connected payment methods.
7. Return case storage and status.
8. Gift packaging and verified suitability data.
9. Monitored, order-linked support intake and measured response reporting.
