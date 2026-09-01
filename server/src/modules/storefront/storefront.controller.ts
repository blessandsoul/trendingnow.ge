import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedResponse } from '@shared/responses/paginatedResponse.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { ValidationError } from '@shared/errors/errors.js';
import { storefrontService } from './storefront.service.js';
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
  type AdminProductListQuery,
  type AdminOrderListQuery,
  type CategoryIdParams,
  type CreateCategoryInput,
  type CreateOrderInput,
  type CreateProductInput,
  type FavoriteBody,
  type OrderEntitiesInput,
  type OrderIdParams,
  type PaginationQuery,
  type ProductIdParams,
  type ProductListQuery,
  type ProductSlugParams,
  type UpdateCategoryInput,
  type UpdateOrderStatusInput,
  type UpdateProductInput,
} from './storefront.schemas.js';

function parse<T>(result: { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } }): T {
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? 'Invalid request');
  }
  return result.data;
}

export async function getProducts(
  request: FastifyRequest<{ Querystring: ProductListQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const query = parse(productListQuerySchema.safeParse(request.query));
  const { items, totalItems } = await storefrontService.getProducts(query);
  reply.send(paginatedResponse('Products retrieved', items, query.page, query.limit, totalItems));
}

export async function getHome(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(successResponse('Storefront home retrieved', await storefrontService.getHome()));
}

export async function getProduct(
  request: FastifyRequest<{ Params: ProductSlugParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { slug } = parse(productSlugParamsSchema.safeParse(request.params));
  reply.send(successResponse('Product retrieved', await storefrontService.getProduct(slug)));
}

export async function getFavorites(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const query = parse(paginationQuerySchema.safeParse(request.query));
  const { items, totalItems } = await storefrontService.getFavorites(request.user.userId, query.page, query.limit);
  reply.send(paginatedResponse('Favorites retrieved', items, query.page, query.limit, totalItems));
}

export async function getFavoriteIds(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(successResponse('Favorite ids retrieved', await storefrontService.getFavoriteIds(request.user.userId)));
}

export async function addFavorite(
  request: FastifyRequest<{ Body: FavoriteBody }>,
  reply: FastifyReply,
): Promise<void> {
  const { productSlug } = parse(favoriteBodySchema.safeParse(request.body));
  reply.status(201).send(successResponse('Favorite added', await storefrontService.addFavorite(request.user.userId, productSlug)));
}

export async function removeFavorite(
  request: FastifyRequest<{ Params: ProductSlugParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { slug } = parse(productSlugParamsSchema.safeParse(request.params));
  reply.send(successResponse('Favorite removed', await storefrontService.removeFavorite(request.user.userId, slug)));
}

export async function createOrder(
  request: FastifyRequest<{ Body: CreateOrderInput }>,
  reply: FastifyReply,
): Promise<void> {
  const input = parse(createOrderSchema.safeParse(request.body));
  const result = await storefrontService.createOrder(input, request.user?.userId);
  reply.status(201).send(successResponse('Order created', result));
}

export async function getOrders(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const query = parse(paginationQuerySchema.safeParse(request.query));
  const { items, totalItems } = await storefrontService.getUserOrders(request.user.userId, query.page, query.limit);
  reply.send(paginatedResponse('Orders retrieved', items, query.page, query.limit, totalItems));
}

export async function getAdminOrders(
  request: FastifyRequest<{ Querystring: AdminOrderListQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const query = parse(adminOrderListQuerySchema.safeParse(request.query));
  const { items, totalItems } = await storefrontService.getAdminOrders(query);
  reply.send(paginatedResponse('Orders retrieved', items, query.page, query.limit, totalItems));
}

export async function getAdminOrder(
  request: FastifyRequest<{ Params: OrderIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { orderId } = parse(orderIdParamsSchema.safeParse(request.params));
  reply.send(successResponse('Order retrieved', await storefrontService.getAdminOrder(orderId)));
}

export async function updateAdminOrderStatus(
  request: FastifyRequest<{ Params: OrderIdParams; Body: UpdateOrderStatusInput }>,
  reply: FastifyReply,
): Promise<void> {
  const { orderId } = parse(orderIdParamsSchema.safeParse(request.params));
  const { status } = parse(updateOrderStatusSchema.safeParse(request.body));
  reply.send(successResponse('Order status updated', await storefrontService.updateOrderStatus(orderId, status)));
}

export async function getStorefrontSummary(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(successResponse('Storefront summary retrieved', await storefrontService.getStorefrontSummary()));
}

export async function getAdminCategories(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.send(successResponse('Categories retrieved', await storefrontService.getAdminCategories()));
}

export async function createAdminCategory(
  request: FastifyRequest<{ Body: CreateCategoryInput }>,
  reply: FastifyReply,
): Promise<void> {
  const input = parse(createCategorySchema.safeParse(request.body));
  reply.status(201).send(successResponse('Category created', await storefrontService.createAdminCategory(input)));
}

export async function updateAdminCategory(
  request: FastifyRequest<{ Params: CategoryIdParams; Body: UpdateCategoryInput }>,
  reply: FastifyReply,
): Promise<void> {
  const { categoryId } = parse(categoryIdParamsSchema.safeParse(request.params));
  const input = parse(updateCategorySchema.safeParse(request.body));
  reply.send(successResponse('Category updated', await storefrontService.updateAdminCategory(categoryId, input)));
}

export async function orderAdminCategories(
  request: FastifyRequest<{ Body: OrderEntitiesInput }>,
  reply: FastifyReply,
): Promise<void> {
  const input = parse(orderEntitiesSchema.safeParse(request.body));
  reply.send(successResponse('Category order updated', await storefrontService.orderAdminCategories(input)));
}

export async function deactivateAdminCategory(
  request: FastifyRequest<{ Params: CategoryIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { categoryId } = parse(categoryIdParamsSchema.safeParse(request.params));
  reply.send(successResponse('Category deactivated', await storefrontService.deactivateAdminCategory(categoryId)));
}

export async function getAdminProducts(
  request: FastifyRequest<{ Querystring: AdminProductListQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const query = parse(adminProductListQuerySchema.safeParse(request.query));
  const { items, totalItems } = await storefrontService.getAdminProducts(query);
  reply.send(paginatedResponse('Products retrieved', items, query.page, query.limit, totalItems));
}

export async function createAdminProduct(
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply,
): Promise<void> {
  const input = parse(createProductSchema.safeParse(request.body));
  reply.status(201).send(successResponse('Product created', await storefrontService.createAdminProduct(input)));
}

export async function updateAdminProduct(
  request: FastifyRequest<{ Params: ProductIdParams; Body: UpdateProductInput }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = parse(productIdParamsSchema.safeParse(request.params));
  const input = parse(updateProductSchema.safeParse(request.body));
  reply.send(successResponse('Product updated', await storefrontService.updateAdminProduct(productId, input)));
}

export async function deactivateAdminProduct(
  request: FastifyRequest<{ Params: ProductIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = parse(productIdParamsSchema.safeParse(request.params));
  reply.send(successResponse('Product deactivated', await storefrontService.deactivateAdminProduct(productId)));
}
