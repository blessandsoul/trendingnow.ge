# TrendingNow.ge

Production marketplace for trend-led consumer products in Georgia.

## Repository layout

- `/` — Next.js storefront, deployed as the `TrendingNow.ge` Coolify application.
- `/server` — Fastify, Prisma, MySQL and Redis API, deployed as the `TrendingNow API` Coolify application.
- `/docs` — buyer-experience standard, UI/UX audit and product-image standard.

## Local development

Storefront:

```bash
npm ci
npm run dev
```

API:

```bash
cd server
npm ci
docker compose up -d
npm run prisma:migrate:deploy
npm run dev
```

Keep real credentials in local `.env` files or the Coolify environment. They must never be committed.

## Production

- Storefront: `https://trendingnow.ge`
- API: `https://api.trendingnow.ge/api/v1`
- Support: `contact@ainow.ge`

Both applications deploy from `main`. The API container applies pending Prisma migrations before starting.
