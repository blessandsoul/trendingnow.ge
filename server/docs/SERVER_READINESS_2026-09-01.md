# TrendingNow.ge server readiness

Date: 2026-09-01

Status: ready for local review, not ready for live buyer traffic.

## What is implemented

- Public catalog: homepage data, product list, product detail.
- Guest and authenticated checkout with server-owned prices and delivery totals.
- Order snapshots so later catalog edits do not rewrite past orders.
- Authenticated favorites and order history.
- Admin product, category, order, status and summary endpoints.
- MySQL schema and deploy migration with the current 18-product catalog.
- Persistent browser cart that sends only product slug and quantity to checkout.
- Rate limits for storefront writes.

## Verified locally

- Prisma schema format and validation: pass.
- Server unit tests: 132 passed in 8 files.
- Server typecheck, lint and production TypeScript build: pass.
- Server dependency audit: 0 known vulnerabilities.
- Client tests: 58 passed in 24 files.
- Client typecheck, lint and Next production build: pass; 38 routes generated.

## Confirmed live blockers

1. `api.trendingnow.ge` has no Cloudflare DNS record.
2. `https://trendingnow.ge/api/v1/health` returns the frontend HTML shell, not backend JSON.
3. The currently deployed browser bundle contains `localhost:8080`; the source and Docker defaults are fixed locally but have not been deployed.
4. The server directory is not connected to a Git repository, so Coolify has no verified source/revision for this backend build.
5. Database-backed integration tests cannot start because Docker Desktop fails on the stale `dockerInference` reparse-point socket. The test harness reaches the container-runtime gate and stops before running assertions.
6. Production MySQL, Redis, secrets, CORS/cookie settings, persistent upload storage and Resend sender credentials have not been verified.

## Required release gate

Release only after all items below are evidenced:

- Repair Docker Desktop, then run `npm run test:integration` with MySQL and Redis containers and obtain a green result.
- Put the server under an authoritative Git repository and push the exact tested revision.
- Create a separate Coolify backend service from `server/Dockerfile`.
- Provision production MySQL and Redis and set the variables from `.env.example.production` without copying local secrets.
- Mount persistent storage at `/app/uploads`.
- Route `api.trendingnow.ge` to the backend service through Cloudflare and Coolify.
- Set the client build argument `NEXT_PUBLIC_API_BASE_URL=https://api.trendingnow.ge/api/v1` and rebuild the frontend.
- Verify `GET https://api.trendingnow.ge/api/v1/live` and `/ready` return backend JSON.
- Run one real browser smoke: catalog load, add to cart, checkout, order receipt, authenticated favorite and admin order status update.
- Verify registration email delivery from the production Resend domain before keeping account verification mandatory.

## Deferred features that must not be advertised yet

- Admin homepage section editor and storefront asset upload API.
- Telegram order notifications; orders currently default to a skipped notification state.
- Cross-device cart synchronization; the cart currently persists only in the buyer's browser.

These deferred items do not block a manual order-confirmation MVP, but the UI and marketing copy must not promise them until they are implemented and tested.
