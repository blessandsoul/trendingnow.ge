import { randomUUID } from 'node:crypto';
import {
  Prisma,
  type DeliveryZone,
  type OrderStatus,
  type TelegramNotificationStatus,
} from '@prisma/client';
import { prisma } from '@libs/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '@shared/errors/errors.js';
import type {
  AdminProductListQuery,
  AdminOrderListQuery,
  CreateCategoryInput,
  CreateOrderInput,
  CreateProductInput,
  OrderEntitiesInput,
  ProductListQuery,
  UpdateCategoryInput,
  UpdateProductInput,
} from './storefront.schemas.js';

const productInclude = {
  category: true,
} satisfies Prisma.StorefrontProductInclude;

const orderInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  items: {
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.OrderInclude;

type ProductWithCategory = Prisma.StorefrontProductGetPayload<{ include: typeof productInclude }>;
type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export interface StorefrontProductDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string;
  imageUrl: string;
  salePrice: number;
  originalPrice: number | null;
  currency: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  updatedAt: string;
  category: { id: string; slug: string; name: string };
}

interface AdminCategoryDto {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { products: number; children: number };
}

interface AdminProductDto extends StorefrontProductDto {
  isActive: boolean;
  gallery: unknown;
  attributes: unknown;
  categoryId: string;
  createdAt: string;
}

interface OrderItemDto {
  id: string;
  productId: string | null;
  productSlug: string;
  productName: string;
  productBrand: string;
  productImageUrl: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface AdminOrderDto {
  id: string;
  publicCode: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  deliveryAddress: string;
  deliveryZone: DeliveryZone;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  promoCode: string | null;
  telegramStatus: TelegramNotificationStatus;
  telegramError: string | null;
  telegramMessageId: number | null;
  createdAt: string;
  updatedAt: string;
  user: OrderWithRelations['user'];
  items: OrderItemDto[];
}

interface PublicOrderDto {
  id: string;
  publicCode: string;
  status: OrderStatus;
  customer: { firstName: string; lastName: string; phone: string; deliveryAddress: string };
  summary: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: string;
    promoCode: string | null;
  };
  telegram: { status: TelegramNotificationStatus; error: string | null; messageId: number | null };
  user: OrderWithRelations['user'];
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

function money(value: Prisma.Decimal | number | string | null): number | null {
  if (value === null) return null;
  return Number(value);
}

function jsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

export function mapProduct(product: ProductWithCategory): StorefrontProductDto {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    brand: product.brand,
    imageUrl: product.imageUrl,
    salePrice: money(product.salePrice) ?? 0,
    originalPrice: money(product.originalPrice),
    currency: product.currency,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestseller: product.isBestseller,
    updatedAt: product.updatedAt.toISOString(),
    category: {
      id: product.category.id,
      slug: product.category.slug,
      name: product.category.name,
    },
  };
}

function mapAdminProduct(product: ProductWithCategory): AdminProductDto {
  return {
    ...mapProduct(product),
    isActive: product.isActive,
    gallery: product.gallery,
    attributes: product.attributes,
    categoryId: product.categoryId,
    createdAt: product.createdAt.toISOString(),
  };
}

export function mapOrder(order: OrderWithRelations): AdminOrderDto {
  return {
    id: order.id,
    publicCode: order.publicCode,
    userId: order.userId,
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    deliveryAddress: order.deliveryAddress,
    deliveryZone: order.deliveryZone,
    status: order.status,
    subtotal: money(order.subtotal) ?? 0,
    discount: money(order.discount) ?? 0,
    shipping: money(order.shipping) ?? 0,
    total: money(order.total) ?? 0,
    currency: order.currency,
    promoCode: order.promoCode,
    telegramStatus: order.telegramStatus,
    telegramError: order.telegramError,
    telegramMessageId: order.telegramMessageId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: order.user,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productSlug: item.productSlug,
      productName: item.productName,
      productBrand: item.productBrand,
      productImageUrl: item.productImageUrl,
      categoryName: item.categoryName,
      quantity: item.quantity,
      unitPrice: money(item.unitPrice) ?? 0,
      lineTotal: money(item.lineTotal) ?? 0,
    })),
  };
}

function publicOrder(order: OrderWithRelations): PublicOrderDto {
  const mapped = mapOrder(order);
  return {
    id: mapped.id,
    publicCode: mapped.publicCode,
    status: mapped.status,
    customer: {
      firstName: mapped.firstName,
      lastName: mapped.lastName,
      phone: mapped.phone,
      deliveryAddress: mapped.deliveryAddress,
    },
    summary: {
      subtotal: mapped.subtotal,
      discount: mapped.discount,
      shipping: mapped.shipping,
      total: mapped.total,
      currency: mapped.currency,
      promoCode: mapped.promoCode,
    },
    telegram: {
      status: mapped.telegramStatus,
      error: mapped.telegramError,
      messageId: mapped.telegramMessageId,
    },
    user: mapped.user,
    items: mapped.items,
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt,
  };
}

export function mergeOrderItems(items: CreateOrderInput['items']): CreateOrderInput['items'] {
  const quantities = new Map<string, number>();
  for (const item of items) {
    const next = (quantities.get(item.productSlug) ?? 0) + item.quantity;
    if (next > 99) {
      throw new BadRequestError('Maximum quantity per product is 99', 'QUANTITY_LIMIT_EXCEEDED');
    }
    quantities.set(item.productSlug, next);
  }
  return Array.from(quantities, ([productSlug, quantity]) => ({ productSlug, quantity }));
}

export function getShippingAmount(deliveryZone: CreateOrderInput['deliveryZone']): number {
  return deliveryZone === 'TBILISI' ? 5 : 8;
}

function orderCode(): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `TN-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

class StorefrontService {
  async getHome(): Promise<Record<string, unknown>> {
    const [categories, products] = await Promise.all([
      prisma.storefrontCategory.findMany({
        where: { isActive: true, parentId: null },
        include: {
          _count: { select: { products: { where: { isActive: true } } } },
          children: {
            where: { isActive: true },
            include: { _count: { select: { products: { where: { isActive: true } } } } },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.storefrontProduct.findMany({
        where: { isActive: true, category: { isActive: true } },
        include: productInclude,
        orderBy: [{ isFeatured: 'desc' }, { sourceRank: 'asc' }, { updatedAt: 'desc' }],
      }),
    ]);
    const mappedProducts = products.map(mapProduct);
    const mappedCategories = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isFeatured: category.isFeatured,
      productCount: category._count.products,
      parentId: category.parentId,
      children: category.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        description: child.description,
        imageUrl: child.imageUrl,
        sortOrder: child.sortOrder,
        isFeatured: child.isFeatured,
        productCount: child._count.products,
        parentId: child.parentId,
        children: [],
      })),
    }));
    const featured = mappedProducts.filter((product) => product.isFeatured).slice(0, 12);
    const fashion = mappedProducts.filter((product) => product.category.slug === 'fashion');
    const practical = mappedProducts.filter((product) => ['home', 'automotive', 'care'].includes(product.category.slug));

    return {
      hero: {
        id: 'trendingnow-hero',
        eyebrow: 'ტრენდების შერჩეული კატალოგი',
        title: 'აქტუალური ნივთები, რომლებიც ძებნას გიზოგავთ',
        text: 'ვაგროვებთ მოთხოვნად არჩევანს ერთ კატალოგში, გაჩვენებთ ფასს ლარში და შეკვეთის პირობებს დადასტურებამდე ვამოწმებთ.',
        ctaLabel: 'პროდუქტების ნახვა',
        ctaHref: '/products',
        slides: [
          { id: 'hero-discovery', imageUrl: '/storefront/trendingnow/hero-discovery-v2.webp', altText: 'აქტუალური პროდუქტების კოლექცია', sortOrder: 0 },
          { id: 'hero-fashion-city', imageUrl: '/storefront/trendingnow/hero-fashion-city-v2.webp', altText: 'ქალაქის ყოველდღიური სტილი', sortOrder: 1 },
          { id: 'hero-home-care', imageUrl: '/storefront/trendingnow/hero-home-care-v2.webp', altText: 'სახლის მოვლის პროდუქტები', sortOrder: 2 },
        ],
      },
      categories: mappedCategories,
      categoryRail: mappedCategories,
      productRows: [
        { id: 'row-trending', title: 'ახლა ტრენდში', source: 'MANUAL', placement: 'ABOVE_BANNERS', productLimit: featured.length, sortOrder: 0, isActive: true, category: null, products: featured },
        { id: 'row-fashion', title: 'მოდა და ყოველდღიური სტილი', source: 'CATEGORY', placement: 'BELOW_BANNERS', productLimit: fashion.length, sortOrder: 1, isActive: true, category: mappedCategories.find((category) => category.slug === 'fashion') ?? null, products: fashion },
        { id: 'row-practical', title: 'სახლი, მოვლა და ავტო', source: 'MANUAL', placement: 'BELOW_BANNERS', productLimit: practical.length, sortOrder: 2, isActive: true, category: null, products: practical },
      ],
      promoBanners: [
        { id: 'promo-city', imageUrl: '/storefront/trendingnow/promo-city-ready-v2.webp', title: 'ქალაქისთვის მზად', eyebrow: 'ყოველდღიური არჩევანი', ctaLabel: 'ნახვა', ctaHref: '/products?category=fashion', tone: 'BLUE', sortOrder: 0 },
        { id: 'promo-home', imageUrl: '/storefront/trendingnow/promo-home-reset-v2.webp', title: 'სახლის ახალი რეჟიმი', eyebrow: 'მოვლა და წესრიგი', ctaLabel: 'ნახვა', ctaHref: '/products?category=care', tone: 'WARM', sortOrder: 1 },
        { id: 'promo-road', imageUrl: '/storefront/trendingnow/promo-road-ready-v2.webp', title: 'გზისთვის მზად', eyebrow: 'ავტომობილი', ctaLabel: 'ნახვა', ctaHref: '/products?category=automotive', tone: 'NAVY', sortOrder: 2 },
      ],
      serviceItems: [
        { id: 'service-selection', icon: 'shield', title: 'შერჩეული კატალოგი', text: 'ერთ სივრცეში შეკრებილი აქტუალური პროდუქტები', sortOrder: 0 },
        { id: 'service-georgia', icon: 'truck', title: 'შეკვეთა საქართველოში', text: 'პირობები დასტურდება შეკვეთამდე', sortOrder: 1 },
        { id: 'service-price', icon: 'wallet', title: 'ფასი ლარში', text: 'საბოლოო თანხა მოწმდება დადასტურებამდე', sortOrder: 2 },
      ],
      newsletter: {
        id: 'newsletter-trendingnow',
        title: 'მიიღეთ ახალი კოლექციები პირველებმა',
        text: 'ტრენდული პროდუქტები და შერჩეული კატეგორიები ერთ მოკლე განახლებაში.',
        placeholder: 'ელფოსტა',
        buttonLabel: 'გამოწერა',
      },
      featuredProducts: featured,
      categorySections: mappedCategories.map((category, index) => ({
        id: `section-${category.slug}`,
        slot: index,
        title: category.name,
        productLimit: category.productCount,
        displayOrder: index,
        isActive: true,
        category: { id: category.id, slug: category.slug, name: category.name },
        products: mappedProducts.filter((product) => product.category.id === category.id),
      })),
      newProducts: mappedProducts.filter((product) => product.isNew),
      promotions: [],
    };
  }

  async getProducts(query: ProductListQuery): Promise<{ items: StorefrontProductDto[]; totalItems: number }> {
    const { page, limit, category, search, minPrice, maxPrice, sort } = query;
    const where: Prisma.StorefrontProductWhereInput = {
      isActive: true,
      ...(category ? { category: { slug: category, isActive: true } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { brand: { contains: search } },
            ],
          }
        : {}),
      ...((minPrice !== undefined || maxPrice !== undefined)
        ? {
            salePrice: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    };

    const orderBy: Prisma.StorefrontProductOrderByWithRelationInput[] =
      sort === 'price-asc'
        ? [{ salePrice: 'asc' }, { name: 'asc' }]
        : sort === 'price-desc'
          ? [{ salePrice: 'desc' }, { name: 'asc' }]
          : sort === 'newest'
            ? [{ updatedAt: 'desc' }]
            : [{ isFeatured: 'desc' }, { sourceRank: 'asc' }, { updatedAt: 'desc' }];

    const [items, totalItems] = await prisma.$transaction([
      prisma.storefrontProduct.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.storefrontProduct.count({ where }),
    ]);

    return { items: items.map(mapProduct), totalItems };
  }

  async getProduct(slug: string): Promise<{
    product: StorefrontProductDto & {
      gallery: Array<{ type: 'image'; url: string; thumbnailUrl: string; alt: string }>;
      attributes: {
        sku: string;
        highlights: string[];
        specificationGroups: never[];
        featureCards: never[];
        benefits: Array<{ icon: string; title: string; text: string }>;
        delivery: Array<{ icon: string; title: string; text: string }>;
        questions: Array<{ question: string; answer: string }>;
      };
    };
    relatedProducts: StorefrontProductDto[];
    recentProducts: StorefrontProductDto[];
  }> {
    const product = await prisma.storefrontProduct.findFirst({
      where: { slug, isActive: true, category: { isActive: true } },
      include: productInclude,
    });
    if (!product) throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');

    const [relatedProducts, recentProducts] = await Promise.all([
      prisma.storefrontProduct.findMany({
        where: { isActive: true, categoryId: product.categoryId, id: { not: product.id } },
        include: productInclude,
        orderBy: [{ isFeatured: 'desc' }, { sourceRank: 'asc' }],
        take: 6,
      }),
      prisma.storefrontProduct.findMany({
        where: { isActive: true, id: { not: product.id } },
        include: productInclude,
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      product: {
        ...mapProduct(product),
        gallery: Array.from({ length: 6 }, (_, index) => {
          const number = String(index + 1).padStart(2, '0');
          const url = `/storefront/products-ai/${product.id}/${number}.webp`;
          return { type: 'image' as const, url, thumbnailUrl: url, alt: `${product.name} ${index + 1}` };
        }),
        attributes: {
          sku: product.id,
          highlights: product.description ? [product.description] : [],
          specificationGroups: [],
          featureCards: [],
          benefits: [
            { icon: 'shield', title: 'გასაგები აღწერა', text: product.description ?? product.category.name },
            { icon: 'wallet', title: 'ფასი ლარში', text: 'ფასი ნაჩვენებია კატალოგის მიმდინარე ჩანაწერით' },
            { icon: 'truck', title: 'შეკვეთა საქართველოში', text: 'მიწოდების პირობები მოწმდება შეკვეთამდე' },
          ],
          delivery: [
            { icon: 'truck', title: 'მიწოდების დაზუსტება', text: 'მისამართი, ვადა და საბოლოო თანხა დასტურდება შეკვეთამდე' },
            { icon: 'wallet', title: 'საბოლოო ფასი', text: 'შეკვეთამდე მიიღებთ განახლებულ პირობებს' },
          ],
          questions: [
            { question: 'როგორ დავადასტურო მიმდინარე ფასი?', answer: '<p>საბოლოო ფასი და შეკვეთის პირობები მოწმდება შეკვეთის დადასტურებამდე.</p>' },
            { question: 'როგორ გავიგო მიწოდების ვადა?', answer: '<p>ვადა დამოკიდებულია მისამართსა და პროდუქტის ხელმისაწვდომობაზე და დადასტურდება შეკვეთამდე.</p>' },
          ],
        },
      },
      relatedProducts: relatedProducts.map(mapProduct),
      recentProducts: recentProducts.map(mapProduct),
    };
  }

  async getFavoriteIds(userId: string): Promise<{ productIds: string[] }> {
    const favorites = await prisma.favorite.findMany({
      where: { userId, product: { isActive: true } },
      select: { productId: true },
      orderBy: { createdAt: 'desc' },
    });
    return { productIds: favorites.map((favorite) => favorite.productId) };
  }

  async getAdminCategories(): Promise<AdminCategoryDto[]> {
    const categories = await prisma.storefrontCategory.findMany({
      include: { _count: { select: { products: true, children: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));
  }

  private async assertCategory(categoryId: string): Promise<void> {
    const exists = await prisma.storefrontCategory.count({ where: { id: categoryId } });
    if (!exists) throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
  }

  async createAdminCategory(input: CreateCategoryInput): Promise<AdminCategoryDto> {
    if (input.parentId) await this.assertCategory(input.parentId);
    try {
      const category = await prisma.storefrontCategory.create({
        data: input,
        include: { _count: { select: { products: true, children: true } } },
      });
      return {
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Category slug already exists', 'CATEGORY_SLUG_EXISTS');
      }
      throw error;
    }
  }

  async updateAdminCategory(categoryId: string, input: UpdateCategoryInput): Promise<AdminCategoryDto> {
    if (input.parentId === categoryId) {
      throw new BadRequestError('Category cannot be its own parent', 'INVALID_CATEGORY_PARENT');
    }
    if (input.parentId) await this.assertCategory(input.parentId);
    try {
      const category = await prisma.storefrontCategory.update({
        where: { id: categoryId },
        data: input,
        include: { _count: { select: { products: true, children: true } } },
      });
      return {
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Category slug already exists', 'CATEGORY_SLUG_EXISTS');
      }
      throw error;
    }
  }

  async orderAdminCategories(input: OrderEntitiesInput): Promise<AdminCategoryDto[]> {
    await prisma.$transaction(
      input.items.map((item) => prisma.storefrontCategory.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })),
    );
    return this.getAdminCategories();
  }

  async deactivateAdminCategory(categoryId: string): Promise<AdminCategoryDto> {
    return this.updateAdminCategory(categoryId, { isActive: false });
  }

  async getAdminProducts(query: AdminProductListQuery): Promise<{ items: AdminProductDto[]; totalItems: number }> {
    const { page, limit, search, category, isActive, section, sortBy, sortOrder } = query;
    const where: Prisma.StorefrontProductWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(section === 'featured' ? { isFeatured: true } : {}),
      ...(section === 'bestseller' ? { isBestseller: true } : {}),
      ...(section === 'new' ? { isNew: true } : {}),
      ...(search
        ? { OR: [{ name: { contains: search } }, { brand: { contains: search } }, { slug: { contains: search } }] }
        : {}),
    };
    const [products, totalItems] = await prisma.$transaction([
      prisma.storefrontProduct.findMany({
        where,
        include: productInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.storefrontProduct.count({ where }),
    ]);
    return { items: products.map(mapAdminProduct), totalItems };
  }

  async createAdminProduct(input: CreateProductInput): Promise<AdminProductDto> {
    await this.assertCategory(input.categoryId);
    try {
      const product = await prisma.storefrontProduct.create({
        data: {
          ...input,
          id: randomUUID(),
          gallery: jsonValue(input.gallery),
          attributes: jsonValue(input.attributes),
        },
        include: productInclude,
      });
      return mapAdminProduct(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Product slug already exists', 'PRODUCT_SLUG_EXISTS');
      }
      throw error;
    }
  }

  async updateAdminProduct(productId: string, input: UpdateProductInput): Promise<AdminProductDto> {
    if (input.categoryId) await this.assertCategory(input.categoryId);
    try {
      const product = await prisma.storefrontProduct.update({
        where: { id: productId },
        data: {
          ...input,
          gallery: jsonValue(input.gallery),
          attributes: jsonValue(input.attributes),
        },
        include: productInclude,
      });
      return mapAdminProduct(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Product slug already exists', 'PRODUCT_SLUG_EXISTS');
      }
      throw error;
    }
  }

  async deactivateAdminProduct(productId: string): Promise<AdminProductDto> {
    return this.updateAdminProduct(productId, { isActive: false });
  }

  async getFavorites(userId: string, page: number, limit: number): Promise<{ items: StorefrontProductDto[]; totalItems: number }> {
    const where: Prisma.FavoriteWhereInput = { userId, product: { isActive: true } };
    const [favorites, totalItems] = await prisma.$transaction([
      prisma.favorite.findMany({
        where,
        include: { product: { include: productInclude } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.favorite.count({ where }),
    ]);
    return { items: favorites.map((favorite) => mapProduct(favorite.product)), totalItems };
  }

  async addFavorite(userId: string, productSlug: string): Promise<{ product: StorefrontProductDto }> {
    const product = await prisma.storefrontProduct.findFirst({
      where: { slug: productSlug, isActive: true },
      include: productInclude,
    });
    if (!product) throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
    await prisma.favorite.upsert({
      where: { userId_productId: { userId, productId: product.id } },
      update: {},
      create: { userId, productId: product.id },
    });
    return { product: mapProduct(product) };
  }

  async removeFavorite(userId: string, productSlug: string): Promise<{ productSlug: string }> {
    await prisma.favorite.deleteMany({
      where: { userId, product: { slug: productSlug } },
    });
    return { productSlug };
  }

  async createOrder(input: CreateOrderInput, requestedUserId?: string): Promise<{ order: PublicOrderDto }> {
    const items = mergeOrderItems(input.items);
    const slugs = items.map((item) => item.productSlug);
    const products = await prisma.storefrontProduct.findMany({
      where: { slug: { in: slugs }, isActive: true, category: { isActive: true } },
      include: productInclude,
    });

    if (products.length !== slugs.length) {
      const found = new Set(products.map((product) => product.slug));
      const unavailable = slugs.filter((slug) => !found.has(slug));
      throw new BadRequestError(
        `Unavailable product: ${unavailable.join(', ')}`,
        'PRODUCT_UNAVAILABLE',
      );
    }

    const user = requestedUserId
      ? await prisma.user.findFirst({
          where: { id: requestedUserId, isActive: true, deletedAt: null },
          select: { id: true },
        })
      : null;
    const productBySlug = new Map(products.map((product) => [product.slug, product]));
    let subtotal = new Prisma.Decimal(0);
    const orderItems = items.map((item) => {
      const product = productBySlug.get(item.productSlug)!;
      const lineTotal = product.salePrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      return {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        productBrand: product.brand,
        productImageUrl: product.imageUrl,
        categoryName: product.category.name,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        lineTotal,
      };
    });
    const shipping = new Prisma.Decimal(getShippingAmount(input.deliveryZone));
    const discount = new Prisma.Decimal(0);
    const total = subtotal.sub(discount).add(shipping);

    const order = await prisma.order.create({
      data: {
        publicCode: orderCode(),
        userId: user?.id ?? null,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        deliveryAddress: input.deliveryAddress,
        deliveryZone: input.deliveryZone,
        subtotal,
        discount,
        shipping,
        total,
        items: { create: orderItems },
      },
      include: orderInclude,
    });

    return { order: publicOrder(order) };
  }

  async getUserOrders(userId: string, page: number, limit: number): Promise<{ items: PublicOrderDto[]; totalItems: number }> {
    const where: Prisma.OrderWhereInput = { userId };
    const [orders, totalItems] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items: orders.map(publicOrder), totalItems };
  }

  async getAdminOrders(query: AdminOrderListQuery): Promise<{ items: AdminOrderDto[]; totalItems: number }> {
    const { page, limit, search, status } = query;
    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { publicCode: { contains: search } },
              { phone: { contains: search } },
              { firstName: { contains: search } },
              { lastName: { contains: search } },
            ],
          }
        : {}),
    };
    const [orders, totalItems] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items: orders.map(mapOrder), totalItems };
  }

  async getAdminOrder(orderId: string): Promise<AdminOrderDto> {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    return mapOrder(order);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrderDto> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: orderInclude,
      });
      return mapOrder(order);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
      }
      throw error;
    }
  }

  async getStorefrontSummary(): Promise<{
    categoryCount: number;
    productCount: number;
    activeProductCount: number;
    featuredProductCount: number;
    bestsellerProductCount: number;
    newProductCount: number;
  }> {
    const [categoryCount, productCount, activeProductCount, featuredProductCount, bestsellerProductCount, newProductCount] =
      await prisma.$transaction([
        prisma.storefrontCategory.count(),
        prisma.storefrontProduct.count(),
        prisma.storefrontProduct.count({ where: { isActive: true } }),
        prisma.storefrontProduct.count({ where: { isActive: true, isFeatured: true } }),
        prisma.storefrontProduct.count({ where: { isActive: true, isBestseller: true } }),
        prisma.storefrontProduct.count({ where: { isActive: true, isNew: true } }),
      ]);
    return { categoryCount, productCount, activeProductCount, featuredProductCount, bestsellerProductCount, newProductCount };
  }
}

export const storefrontService = new StorefrontService();
