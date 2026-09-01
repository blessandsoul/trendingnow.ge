# TrendingNow.ge production readiness

Date: 2026-09-01

Status: production marketplace API is live and the manual-confirmation MVP commerce path is verified.

## Production topology

- Storefront: `https://trendingnow.ge`
- API: `https://api.trendingnow.ge/api/v1`
- Runtime: separate Coolify frontend and API applications.
- Data: private MySQL 8.0 and Redis services.
- Uploads: persistent `trendingnow-api-uploads` volume mounted at `/app/uploads`.
- Edge: `api.trendingnow.ge` is proxied through Cloudflare with valid HTTPS.
- Email: the configured Resend domain `ainow.ge` reports `verified`; inbox delivery was not asserted without sending an unsolicited message.

## Implemented commerce path

- Six active categories and the current 18-product catalog are provisioned by an audited Prisma migration.
- Homepage, catalog search/filter/sort and product details use the production database API.
- Guest and authenticated checkout calculate prices and delivery totals on the server.
- Order items retain immutable product and price snapshots.
- Authenticated favorites and order history persist in MySQL.
- Admin order list/detail and status transitions are live.
- Public order confirmation pages render the generated `TN-*` receipt code.
- Avatar uploads accept JPEG/PNG, enforce a 25-megapixel input ceiling, strip source metadata, resize to 512 px and persist as PNG without a native CPU-specific image dependency.

## Verified locally

- Server: 135 tests in 9 files, typecheck, lint and production build pass.
- Server dependency audit: 0 known vulnerabilities at the configured high-severity gate.
- Client: 58 tests in 24 files, typecheck, lint and production Next build pass; 38 routes generated.
- Client clean-install gate: `npm ci` succeeds from only `package.json` and `package-lock.json`.

## Verified live through Cloudflare

- `/live`: HTTP 200 and `alive=true`.
- `/health`: HTTP 200 and overall `healthy`; database, Redis and memory checks are `up`.
- Catalog: 6 categories, 18 active products, first product detail resolves.
- CORS: the storefront origin is allowed with credentials; an unrelated origin receives no allow-origin header.
- Guest order: HTTP 201; server total and Tbilisi delivery fee verified.
- Receipt page: HTTP 200 and contains the generated order code.
- User login: HTTP 200 with the secure access cookie.
- Favorite creation/read: HTTP 201/200 and the product ID persists.
- Authenticated order/history: HTTP 201/200 and region delivery total verified.
- Admin login/list/status update: HTTP 200 and order state changed to `ACCEPTED`.
- Avatar upload/read/delete: HTTP 200/200/200 and the stored output is PNG.
- Smoke cleanup: 2 temporary users, 2 temporary orders and 1 temporary favorite were deleted; no `codex-*` test users or orders remain.
- `contact@ainow.ge` exists as an active production administrator. Its random bootstrap password was not disclosed or stored; initial access should use the password-reset flow.

## Storefront release evidence

- `/`, `/products`, `/register`, `/login` and `/contact` return HTTP 200 from production.
- These pages contain `contact@ainow.ge` and no `Continuum` branding.
- The deployed browser bundle contains `https://api.trendingnow.ge/api/v1` and contains neither the obsolete apex `/api/v1` target nor `localhost:8000`.
- In-app visual automation was unavailable on the host during this release, so this document does not claim a fresh automated screenshot pass. Existing responsive behavior remains covered by the client tests, including mobile gallery swipe tests.

## Deliberately deferred

- Telegram order notifications remain disabled; orders use the `SKIPPED` notification state.
- Cross-device cart sync is not implemented; cart persistence is browser-local.
- Payment capture is not implemented; the current MVP records orders for manual confirmation.
- Provider acceptance and real inbox delivery are different signals. The Resend domain is verified, but a real registration email should be confirmed by the owner during the first controlled account test.

These deferred items do not block the verified manual-confirmation marketplace flow and must not be advertised as available.
