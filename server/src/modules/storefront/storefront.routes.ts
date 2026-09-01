import type { FastifyInstance } from 'fastify';
import { authenticate, authorize, optionalAuth } from '@libs/auth.js';
import { RATE_LIMITS } from '@config/rate-limit.config.js';
import * as controller from './storefront.controller.js';
import {
  adminProductListQuerySchema,
  adminOrderListQuerySchema,
  categoryIdParamsSchema,
  createCategorySchema,
  createOrderSchema,
  createProductSchema,
  favoriteBodySchema,
  orderEntitiesSchema,
  orderIdParamsSchema,
  paginationQuerySchema,
  productIdParamsSchema,
  productListQuerySchema,
  productSlugParamsSchema,
  updateCategorySchema,
  updateOrderStatusSchema,
  updateProductSchema,
} from './storefront.schemas.js';

export async function storefrontRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/storefront/home', {
    config: { rateLimit: RATE_LIMITS.STOREFRONT_READ },
    handler: controller.getHome,
  });

  fastify.get('/storefront/products', {
    schema: { querystring: productListQuerySchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_READ },
    handler: controller.getProducts,
  });

  fastify.get('/storefront/products/:slug', {
    schema: { params: productSlugParamsSchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_READ },
    handler: controller.getProduct,
  });

  fastify.get('/storefront/favorites', {
    preValidation: authenticate,
    schema: { querystring: paginationQuerySchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_ACCOUNT },
    handler: controller.getFavorites,
  });

  fastify.get('/storefront/favorites/ids', {
    preValidation: authenticate,
    config: { rateLimit: RATE_LIMITS.STOREFRONT_ACCOUNT },
    handler: controller.getFavoriteIds,
  });

  fastify.post('/storefront/favorites', {
    preValidation: authenticate,
    schema: { body: favoriteBodySchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_ACCOUNT },
    handler: controller.addFavorite,
  });

  fastify.delete('/storefront/favorites/:slug', {
    preValidation: authenticate,
    schema: { params: productSlugParamsSchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_ACCOUNT },
    handler: controller.removeFavorite,
  });

  fastify.post('/storefront/orders', {
    preValidation: optionalAuth,
    schema: { body: createOrderSchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_ORDER_CREATE },
    handler: controller.createOrder,
  });

  fastify.get('/storefront/orders', {
    preValidation: authenticate,
    schema: { querystring: paginationQuerySchema },
    config: { rateLimit: RATE_LIMITS.STOREFRONT_ACCOUNT },
    handler: controller.getOrders,
  });

  const adminGuards = [authenticate, authorize('ADMIN')];

  fastify.get('/admin/orders', {
    preValidation: adminGuards,
    schema: { querystring: adminOrderListQuerySchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.getAdminOrders,
  });

  fastify.get('/admin/orders/:orderId', {
    preValidation: adminGuards,
    schema: { params: orderIdParamsSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.getAdminOrder,
  });

  fastify.patch('/admin/orders/:orderId/status', {
    preValidation: adminGuards,
    schema: { params: orderIdParamsSchema, body: updateOrderStatusSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.updateAdminOrderStatus,
  });

  fastify.get('/admin/storefront/summary', {
    preValidation: adminGuards,
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.getStorefrontSummary,
  });

  fastify.get('/admin/storefront/categories', {
    preValidation: adminGuards,
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.getAdminCategories,
  });

  fastify.post('/admin/storefront/categories', {
    preValidation: adminGuards,
    schema: { body: createCategorySchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.createAdminCategory,
  });

  fastify.patch('/admin/storefront/categories/order', {
    preValidation: adminGuards,
    schema: { body: orderEntitiesSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.orderAdminCategories,
  });

  fastify.patch('/admin/storefront/categories/:categoryId', {
    preValidation: adminGuards,
    schema: { params: categoryIdParamsSchema, body: updateCategorySchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.updateAdminCategory,
  });

  fastify.delete('/admin/storefront/categories/:categoryId', {
    preValidation: adminGuards,
    schema: { params: categoryIdParamsSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.deactivateAdminCategory,
  });

  fastify.get('/admin/storefront/products', {
    preValidation: adminGuards,
    schema: { querystring: adminProductListQuerySchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.getAdminProducts,
  });

  fastify.post('/admin/storefront/products', {
    preValidation: adminGuards,
    schema: { body: createProductSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.createAdminProduct,
  });

  fastify.patch('/admin/storefront/products/:productId', {
    preValidation: adminGuards,
    schema: { params: productIdParamsSchema, body: updateProductSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.updateAdminProduct,
  });

  fastify.delete('/admin/storefront/products/:productId', {
    preValidation: adminGuards,
    schema: { params: productIdParamsSchema },
    config: { rateLimit: RATE_LIMITS.ADMIN_DEFAULT },
    handler: controller.deactivateAdminProduct,
  });
}
