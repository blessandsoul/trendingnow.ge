import type { IUser } from '@/features/auth/types/auth.types';
import type { PaginationParams } from '@/lib/api/api.types';

// ─── Admin User ─────────────────────────────────────────────────────────────

export interface IAdminUser extends IUser {
  deletedAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
}

export interface IAdminUserDetail extends IAdminUser {
  sessionCount: number;
  lastLogin: string | null;
}

// ─── Admin Session ──────────────────────────────────────────────────────────

export interface IAdminSession {
  id: string;
  userId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export interface IDashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  recentSignups: number;
  activeSessions: number;
}

// ─── Request Params ─────────────────────────────────────────────────────────

export interface IGetUsersParams extends PaginationParams {
  search?: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
  sortBy?: 'createdAt' | 'email' | 'firstName';
  sortOrder?: 'asc' | 'desc';
}

export interface IGetSessionsParams extends PaginationParams {
  userId?: string;
}

export type AdminOrderStatus = 'PENDING' | 'ACCEPTED' | 'SENT_FOR_DELIVERY' | 'DELIVERED';
export type AdminTelegramNotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';

export interface IGetAdminOrdersParams extends PaginationParams {
  search?: string;
  status?: AdminOrderStatus;
}

export interface IUpdateUserStatusRequest {
  isActive: boolean;
}

export interface IUpdateUserRoleRequest {
  role: 'USER' | 'ADMIN';
}

// ─── Storefront Management ───────────────────────────────────────────────

export interface IAdminStorefrontSummary {
  categoryCount: number;
  productCount: number;
  activeProductCount: number;
  featuredProductCount: number;
  bestsellerProductCount: number;
  newProductCount: number;
}

export interface IAdminOrderItem {
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

export interface IAdminOrder {
  id: string;
  publicCode: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  deliveryAddress: string;
  status: AdminOrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  promoCode: string | null;
  telegramStatus: AdminTelegramNotificationStatus;
  telegramError: string | null;
  telegramMessageId: number | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<IUser, 'id' | 'email' | 'firstName' | 'lastName'> | null;
  items: IAdminOrderItem[];
}

export interface IAdminStorefrontCategory {
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
  _count: {
    products: number;
    children: number;
  };
}

export interface IAdminProductSpecItem {
  label: string;
  value: string;
}

export interface IAdminProductSpecGroup {
  title: string;
  items: IAdminProductSpecItem[];
}

export interface IAdminProductQuestion {
  question: string;
  answer: string;
}

export interface IAdminProductFeatureCard {
  title: string;
  text: string;
  imageUrl: string;
  icon: string;
}

export interface IAdminProductBenefit {
  icon: string;
  title: string;
  text: string;
}

/** Mirrors server admin.schemas.ts productAttributesSchema — unknown keys are stripped server-side. */
export interface IAdminProductAttributes {
  sku?: string;
  highlights?: string[];
  specificationGroups?: IAdminProductSpecGroup[];
  featureCards?: IAdminProductFeatureCard[];
  benefits?: IAdminProductBenefit[];
  delivery?: IAdminProductBenefit[];
  questions?: IAdminProductQuestion[];
}

export interface IAdminStorefrontProduct {
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
  isActive: boolean;
  gallery: unknown;
  attributes: IAdminProductAttributes | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    slug: string;
    name: string;
  };
}

export type AdminHomeProductRowSource = 'BESTSELLER' | 'FEATURED' | 'NEW' | 'CATEGORY' | 'MANUAL';
export type AdminHomeProductRowPlacement = 'ABOVE_BANNERS' | 'BELOW_BANNERS';
export type AdminHomePromoTone = 'NAVY' | 'WARM' | 'BLUE';
export type AdminStorefrontAssetKind = 'hero' | 'banner' | 'category' | 'product' | 'service' | 'newsletter' | 'misc';

export interface IAdminHomeHeroSlide {
  id: string;
  heroId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminHomeHero {
  id: string;
  eyebrow: string | null;
  title: string;
  text: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  slides: IAdminHomeHeroSlide[];
}

export interface IAdminHomeProductRowItem {
  id: string;
  rowId: string;
  productId: string;
  sortOrder: number;
  product: IAdminStorefrontProduct;
}

export interface IAdminHomeProductRow {
  id: string;
  title: string;
  source: AdminHomeProductRowSource;
  placement: AdminHomeProductRowPlacement;
  productLimit: number;
  sortOrder: number;
  isActive: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    slug: string;
    name: string;
  } | null;
  items: IAdminHomeProductRowItem[];
}

export interface IAdminHomePromoBanner {
  id: string;
  imageUrl: string;
  title: string;
  eyebrow: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: AdminHomePromoTone;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminHomeServiceItem {
  id: string;
  icon: string;
  title: string;
  text: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminHomeNewsletter {
  id: string;
  title: string;
  text: string;
  placeholder: string;
  buttonLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminHomepageConfig {
  hero: IAdminHomeHero | null;
  productRows: IAdminHomeProductRow[];
  promoBanners: IAdminHomePromoBanner[];
  serviceItems: IAdminHomeServiceItem[];
  newsletter: IAdminHomeNewsletter | null;
}

export interface IOrderItemsRequest {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export interface ICreateStorefrontCategoryRequest {
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  parentId?: string | null;
}

export interface IUpdateStorefrontCategoryRequest {
  slug?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  parentId?: string | null;
}

export interface IUpdateHomeHeroRequest {
  eyebrow?: string | null;
  title?: string;
  text?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isActive?: boolean;
}

export interface ICreateHomeHeroSlideRequest {
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type IUpdateHomeHeroSlideRequest = Partial<ICreateHomeHeroSlideRequest>;

export interface ICreateHomeProductRowRequest {
  title: string;
  source: AdminHomeProductRowSource;
  placement?: AdminHomeProductRowPlacement;
  productLimit?: number;
  sortOrder?: number;
  isActive?: boolean;
  categoryId?: string | null;
}

export type IUpdateHomeProductRowRequest = Partial<ICreateHomeProductRowRequest>;

export interface IUpdateHomeProductRowItemsRequest {
  items: Array<{
    productId: string;
    sortOrder: number;
  }>;
}

export interface ICreateHomePromoBannerRequest {
  imageUrl: string;
  title: string;
  eyebrow?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  tone?: AdminHomePromoTone;
  sortOrder?: number;
  isActive?: boolean;
}

export type IUpdateHomePromoBannerRequest = Partial<ICreateHomePromoBannerRequest>;

export interface ICreateHomeServiceItemRequest {
  icon: string;
  title: string;
  text: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type IUpdateHomeServiceItemRequest = Partial<ICreateHomeServiceItemRequest>;

export interface IUpdateHomeNewsletterRequest {
  title?: string;
  text?: string;
  placeholder?: string;
  buttonLabel?: string;
  isActive?: boolean;
}

export interface IUploadStorefrontAssetRequest {
  file: File;
  kind: AdminStorefrontAssetKind;
  label?: string;
}

export interface IUploadStorefrontAssetResponse {
  url: string;
}

export interface IAdminHomeCategorySection {
  id: string;
  slot: number;
  title: string;
  productLimit: number;
  displayOrder: number;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface IGetStorefrontProductsParams extends PaginationParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  section?: 'featured' | 'bestseller' | 'new';
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'salePrice';
  sortOrder?: 'asc' | 'desc';
}

export interface IUpdateHomeCategorySectionRequest {
  title?: string;
  categoryId?: string;
  productLimit?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ICreateStorefrontProductRequest {
  slug: string;
  name: string;
  description?: string | null;
  brand: string;
  imageUrl: string;
  salePrice: number;
  originalPrice?: number | null;
  currency?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
  categoryId: string;
  gallery?: unknown;
  attributes?: IAdminProductAttributes | null;
}

export type IUpdateStorefrontProductRequest = Partial<ICreateStorefrontProductRequest>;
