import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;
let prisma: typeof import('@/libs/prisma.js')['prisma'];
let userCookie: string;
let adminCookie: string;
let authenticatedOrderId: string;

const product = {
  id: 'integration-product-1',
  slug: 'integration-product',
  name: 'Integration Product',
  salePrice: 99.5,
};

function extractCookie(setCookie: string[] | string | undefined, name: string): string | undefined {
  const headers = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  for (const header of headers) {
    const first = header.split(';')[0];
    const separator = first.indexOf('=');
    if (separator !== -1 && first.slice(0, separator).trim() === name) {
      return first.slice(separator + 1).trim();
    }
  }
  return undefined;
}

async function login(email: string, password: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email, password },
  });
  expect(response.statusCode).toBe(200);
  const cookie = extractCookie(response.headers['set-cookie'], 'access_token');
  expect(cookie).toBeTruthy();
  return cookie!;
}

const orderPayload = {
  firstName: 'Nino',
  lastName: 'Buyer',
  phone: '+995555123456',
  deliveryAddress: 'Tbilisi, Test street 1',
  deliveryZone: 'TBILISI',
  items: [{ productSlug: product.slug, quantity: 2 }],
};

beforeAll(async () => {
  const [{ buildApp }, prismaModule, { hashPassword }] = await Promise.all([
    import('@/app.js'),
    import('@/libs/prisma.js'),
    import('@/libs/password.js'),
  ]);
  prisma = prismaModule.prisma;

  await prisma.storefrontCategory.upsert({
    where: { slug: 'integration-category' },
    update: {},
    create: {
      id: 'integration-category-1',
      slug: 'integration-category',
      name: 'Integration Category',
      isActive: true,
    },
  });
  await prisma.storefrontProduct.upsert({
    where: { slug: product.slug },
    update: { salePrice: product.salePrice, isActive: true },
    create: {
      ...product,
      description: 'Integration fixture',
      brand: 'TrendingNow',
      imageUrl: '/integration-product.webp',
      currency: 'GEL',
      categoryId: 'integration-category-1',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'storefront-admin@example.com' },
    update: {},
    create: {
      email: 'storefront-admin@example.com',
      password: await hashPassword('AdminPass123!'),
      firstName: 'Storefront',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  app = await buildApp();
  await app.ready();

  const registration = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: {
      email: 'storefront-user@example.com',
      password: 'UserPass123!',
      firstName: 'Storefront',
      lastName: 'User',
    },
  });
  expect([201, 409]).toContain(registration.statusCode);
  userCookie = await login('storefront-user@example.com', 'UserPass123!');
  adminCookie = await login('storefront-admin@example.com', 'AdminPass123!');
});

afterAll(async () => {
  await app?.close();
});

describe('storefront commerce path (real containers)', () => {
  it('lists active products with numeric prices', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/storefront/products?search=${encodeURIComponent(product.name)}`,
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0]).toMatchObject({ slug: product.slug, salePrice: product.salePrice });
  });

  it('creates a guest order and calculates totals from the database price', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/storefront/orders',
      payload: { ...orderPayload, clientPrice: 0.01 },
    });
    expect(response.statusCode).toBe(201);
    const order = response.json().data.order;
    expect(order.user).toBeNull();
    expect(order.publicCode).toMatch(/^TN-\d{6}-[A-F0-9]{8}$/);
    expect(order.summary).toMatchObject({ subtotal: 199, shipping: 5, total: 204, currency: 'GEL' });
    expect(order.items[0]).toMatchObject({ productSlug: product.slug, quantity: 2, unitPrice: 99.5, lineTotal: 199 });
  });

  it('rejects an order containing an unavailable product', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/storefront/orders',
      payload: { ...orderPayload, items: [{ productSlug: 'missing-product', quantity: 1 }] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('PRODUCT_UNAVAILABLE');
  });

  it('persists favorites for an authenticated user', async () => {
    const added = await app.inject({
      method: 'POST',
      url: '/api/v1/storefront/favorites',
      cookies: { access_token: userCookie },
      payload: { productSlug: product.slug },
    });
    expect(added.statusCode).toBe(201);

    const ids = await app.inject({
      method: 'GET',
      url: '/api/v1/storefront/favorites/ids',
      cookies: { access_token: userCookie },
    });
    expect(ids.statusCode).toBe(200);
    expect(ids.json().data.productIds).toContain(product.id);
  });

  it('links an authenticated order to the user and returns it in history', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/storefront/orders',
      cookies: { access_token: userCookie },
      payload: { ...orderPayload, deliveryZone: 'REGION', items: [{ productSlug: product.slug, quantity: 1 }] },
    });
    expect(created.statusCode).toBe(201);
    const order = created.json().data.order;
    authenticatedOrderId = order.id;
    expect(order.user.email).toBe('storefront-user@example.com');
    expect(order.summary).toMatchObject({ subtotal: 99.5, shipping: 8, total: 107.5 });

    const history = await app.inject({
      method: 'GET',
      url: '/api/v1/storefront/orders',
      cookies: { access_token: userCookie },
    });
    expect(history.statusCode).toBe(200);
    expect(history.json().data.items.some((item: { id: string }) => item.id === order.id)).toBe(true);
  });

  it('lets an admin list orders and update the order status', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/orders',
      cookies: { access_token: adminCookie },
    });
    expect(list.statusCode).toBe(200);
    expect(list.json().data.items.some((item: { id: string }) => item.id === authenticatedOrderId)).toBe(true);

    const updated = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/orders/${authenticatedOrderId}/status`,
      cookies: { access_token: adminCookie },
      payload: { status: 'ACCEPTED' },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().data.status).toBe('ACCEPTED');
  });
});
