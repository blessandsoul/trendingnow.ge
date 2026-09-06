# TrendingNow visual system

The public site now shares the Bold Discovery language selected by the owner.

## Tokens

- Cobalt: `#092BB4` for primary actions, active navigation and discovery surfaces.
- Deep cobalt: `#061E81` for hover and pressed states.
- Signal yellow: `#FFE622` for editorial highlights, selected states and feature panels.
- Ink: `#101010` for headings and dark category/navigation bands.
- Warm canvas: `#F4F2ED` and `#FAF9F6` for page backgrounds.

## Layout and surfaces

- Public pages use the full viewport width. The content rail may constrain reading width, but no decorative browser-like frame surrounds a page.
- Cards and controls use a restrained square geometry (small corner radius, visible borders, firm dividers) instead of soft marketplace bubbles.
- Primary actions are cobalt with yellow used for editorial emphasis; coral/red is not part of the TrendingNow public language.
- Black category bands and cobalt panels provide the strong contrast seen on the homepage.

## Images

- One product or editorial subject per image, centered with safe margins.
- Square card images use the same cobalt background, soft upper-left light, subtle grounding shadow and complete subject framing.
- No baked-in UI labels, prices, yellow blocks, logos or watermarks in product imagery. Text stays editable in the page.
- Product detail media may show real source photos; generated/editorial images must be marked as illustrative and must not invent stock, specifications or seller availability.

## Typography and interaction

- Noto Sans Georgian variable is the public Georgian display/body family; Anton is reserved for the Latin TrendingNow wordmark.
- Use clear weight contrast, short headings, and dense-but-readable metadata.
- Menus, search, buttons and links remain keyboard reachable with visible focus. Motion uses `motion-safe`; reduced-motion users receive no transform animation.

## Coverage

The shared tokens and palette migration cover the public storefront, catalog, product detail, cart, favorites, orders, auth, blog, info pages and admin UI. The homepage remains the reference implementation. Browser viewport comparison is still required after the CUA transport is restored.
