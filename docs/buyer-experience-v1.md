# TrendingNow buyer experience v1

Date: 2026-09-01

## Product model

TrendingNow is the current single seller and catalog curator. Trend discovery and supplier checks are internal merchandising work. A shopper sees a familiar marketplace flow: discover, understand, order, confirm, receive, and return when the published terms allow it.

The storefront uses `Available to order` when the product is not reserved locally. Availability, the final amount, and delivery timing are confirmed before payment.

## Design direction

- Palette: Graphite `#11141B`, Paper `#F5F7FA`, White `#FFFFFF`, Signal coral `#FF4057`, Trust green `#237A3E`, Mist border `#DDE3EA`.
- Type: BOG for Georgian storefront copy, with existing system fallbacks for utility text.
- Layout: product-first marketplace surfaces with calm white cards, stable grid breakpoints, and one dark signature surface.
- Signature: the four-stage buyer-confidence rail connects product selection, terms confirmation, delivery, and returns. The order is meaningful and stays consistent across home, product, and cart pages.
- Motion: short hover and press feedback only; reduced-motion remains supported.

## Buyer pain map

| Buyer pain | Primary surface | UI response | Current delivery state |
|---|---|---|---|
| Too many products and no clear choice | Home, catalog | Curated rows, categories, search, concise descriptions | Frontend complete |
| Product may differ from the image | Product detail | Six-role gallery, swipe, specifications, AI disclosure | Frontend complete; supplier verification remains operational |
| Unknown store feels risky | Sitewide | Contact details, buyer-confidence rail, delivery, payment, warranty and FAQ links | Frontend complete |
| Final price is unclear | Product, cart, checkout | Catalog-price disclosure, estimated total, confirmation-before-payment notice | Frontend complete; final-price backend required |
| Product may be unavailable | Cards, product, checkout | `Available to order` status and explicit availability check | Frontend complete; supplier check required |
| Delivery time is unclear | Product, cart, delivery page | Timing confirmed by address and availability; no fixed fast-delivery claim | Frontend complete; status backend required |
| Registration blocks purchase | Checkout | Guest order remains the primary available path; account is optional | Frontend complete |
| Checkout is long or fragile | Cart, checkout | Short contact form, zone choice, order summary, responsive dialog | Frontend complete; production order intake required |
| Payment method is unknown | Footer, payment page, checkout | Active methods appear only after confirmation; inactive payment badges are hidden | Frontend complete; provider integration required |
| Return flow is unclear | Product, buyer-confidence rail, warranty page | Return terms and contact route are visible before order | Frontend complete; case-management backend required |

## Responsive acceptance

- No document-level horizontal overflow at 320, 390, 768, 1024, or 1440 CSS pixels.
- The buyer-confidence rail is swipeable on narrow screens and becomes a two- then four-column grid.
- Product gallery keeps horizontal swipe and vertical page scroll.
- Search, cart, quantity, checkout and navigation controls keep at least a 40-pixel practical hit area.
- Georgian text stays in Mkhedruli; Latin brand fragments may use uppercase.
- No public `24-hour delivery`, `free returns`, `official warranty`, `protected payment`, or `in stock` claim appears without an active operational source.

## Backend contract still required

1. Check supplier availability for the requested product and quantity.
2. Lock the confirmed retail amount in GEL and the delivery charge.
3. Store the promised delivery window and expose order status updates.
4. Activate only payment methods supported by the connected provider.
5. Store return requests and their status.
