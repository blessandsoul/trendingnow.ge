import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const productListQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().max(120).optional(),
  search: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'newest']).default('featured'),
});

export const productSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

export const favoriteBodySchema = z.object({
  productSlug: z.string().trim().min(1).max(180),
});

export const orderItemSchema = z.object({
  productSlug: z.string().trim().min(1).max(180),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(40),
  deliveryAddress: z.string().trim().min(5).max(500),
  deliveryZone: z.enum(['TBILISI', 'REGION']),
  items: z.array(orderItemSchema).min(1).max(50),
});

export const adminOrderListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'SENT_FOR_DELIVERY', 'DELIVERED']).optional(),
});

export const orderIdParamsSchema = z.object({
  orderId: z.string().uuid(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'SENT_FOR_DELIVERY', 'DELIVERED']),
});

const nullableText = (max: number): z.ZodNullable<z.ZodString> => z.string().trim().max(max).nullable();

export const categoryIdParamsSchema = z.object({
  categoryId: z.string().trim().min(1).max(191),
});

export const createCategorySchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(180),
  description: nullableText(500).optional(),
  imageUrl: nullableText(500).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  parentId: z.string().trim().min(1).max(191).nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const orderEntitiesSchema = z.object({
  items: z.array(z.object({
    id: z.string().trim().min(1).max(191),
    sortOrder: z.coerce.number().int().min(0),
  })).min(1).max(200),
});

export const adminProductListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  section: z.enum(['featured', 'bestseller', 'new']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'salePrice']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const productIdParamsSchema = z.object({
  productId: z.string().trim().min(1).max(191),
});

export const createProductSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(300),
  description: z.string().trim().max(20_000).nullable().optional(),
  brand: z.string().trim().min(1).max(180),
  imageUrl: z.string().trim().min(1).max(500),
  salePrice: z.coerce.number().min(0).max(9_999_999.99),
  originalPrice: z.coerce.number().min(0).max(9_999_999.99).nullable().optional(),
  currency: z.string().trim().length(3).default('GEL'),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().trim().min(1).max(191),
  gallery: z.unknown().optional(),
  attributes: z.unknown().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;
export type FavoriteBody = z.infer<typeof favoriteBodySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type OrderEntitiesInput = z.infer<typeof orderEntitiesSchema>;
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
export type ProductIdParams = z.infer<typeof productIdParamsSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
