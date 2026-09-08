# TrendingNow visual system

Bold Discovery is the public design language selected by the owner, not a completed site-wide acceptance claim. The 2026-09-08 design/value audit found remaining BOG/Noto font divergence, legacy footer/favicon branding, inconsistent product photography and two separate shopping flows. See `DESIGN_VALUE_AUDIT_20260908.md` for rendered evidence and the route matrix.

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

- Product specifications use one compact semantic icon per row (for example Hand, Bluetooth, Usb), aligned at the text start. No blue vertical rule or decorative callout background. Catalog and detail share the same specification renderer; labels stay as accessible text, icons are decorative.
- Noto Sans Georgian variable is the public Georgian display/body family; Anton is reserved for the Latin TrendingNow wordmark.
- Use clear weight contrast, short headings, and dense-but-readable metadata.
- Menus, search, buttons and links remain keyboard reachable with visible focus. Motion uses `motion-safe`; reduced-motion users receive no transform animation.
- Long Georgian words must wrap inside their own column (`overflow-wrap: anywhere` inherited from body). Page-level overflow clipping is not a responsive-text fix. Grid/flex text children must allow shrinking; do not use fixed heights to crop headings.
- Georgian multiline display headings use line-height at least 1.08. Keep narrow promotional copy short without sacrificing a readable font size.
- Shared header inline navigation starts at 1536px; below that the menu preserves room for search. Verify intermediate widths1280/1440, not only phone and wide desktop.

## Coverage

The homepage remains the reference implementation. Local text-boundary QA on 2026-09-08 covers public/auth/info/catalog/blog routes, KA/EN/RU samples, 50 editorial drafts, 36 product pages and menu/filter/scroll-header states. See `RESPONSIVE_TEXT_AUDIT_20260908.md` for actual counts and limits. Authenticated dashboard/admin contents were not verified; login redirects are not coverage of those interiors. Local QA is not a production release.
