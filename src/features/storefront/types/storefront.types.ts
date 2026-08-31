export interface StorefrontCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isFeatured: boolean;
  productCount: number;
  parentId: string | null;
  children: StorefrontCategory[];
}

export interface StorefrontProduct {
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
  category: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface StorefrontProductGalleryItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  alt: string;
}

export interface StorefrontProductSpecificationGroup {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
}

export interface StorefrontProductFeatureCard {
  title: string;
  text: string;
  imageUrl: string;
  icon: string;
}

export interface StorefrontProductBenefit {
  icon: string;
  title: string;
  text: string;
}

export interface StorefrontProductQuestion {
  question: string;
  answer: string;
}

export interface StorefrontProductAttributes {
  sku: string;
  highlights: string[];
  specificationGroups: StorefrontProductSpecificationGroup[];
  featureCards: StorefrontProductFeatureCard[];
  benefits: StorefrontProductBenefit[];
  delivery: StorefrontProductBenefit[];
  questions: StorefrontProductQuestion[];
}

export interface StorefrontProductDetailProduct extends StorefrontProduct {
  gallery: StorefrontProductGalleryItem[];
  attributes: StorefrontProductAttributes;
}

export interface StorefrontProductDetail {
  product: StorefrontProductDetailProduct;
  relatedProducts: StorefrontProduct[];
  recentProducts: StorefrontProduct[];
}

export interface StorefrontPromotion {
  code: string;
  label: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  amount: number;
  minSubtotal: number;
}

export interface StorefrontCategorySection {
  id: string;
  slot: number;
  title: string;
  productLimit: number;
  displayOrder: number;
  isActive: boolean;
  category: {
    id: string;
    slug: string;
    name: string;
  };
  products: StorefrontProduct[];
}

export interface StorefrontHomeHero {
  id: string;
  eyebrow: string | null;
  title: string;
  text: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  slides: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
  }>;
}

export interface StorefrontHomeProductRow {
  id: string;
  title: string;
  source: 'BESTSELLER' | 'FEATURED' | 'NEW' | 'CATEGORY' | 'MANUAL';
  placement: 'ABOVE_BANNERS' | 'BELOW_BANNERS';
  productLimit: number;
  sortOrder: number;
  isActive: boolean;
  category: {
    id: string;
    slug: string;
    name: string;
  } | null;
  products: StorefrontProduct[];
}

export interface StorefrontHomePromoBanner {
  id: string;
  imageUrl: string;
  title: string;
  eyebrow: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: 'NAVY' | 'WARM' | 'BLUE';
  sortOrder: number;
}

export interface StorefrontHomeServiceItem {
  id: string;
  icon: string;
  title: string;
  text: string;
  sortOrder: number;
}

export interface StorefrontHomeNewsletter {
  id: string;
  title: string;
  text: string;
  placeholder: string;
  buttonLabel: string;
}

export interface StorefrontHome {
  hero: StorefrontHomeHero | null;
  categories: StorefrontCategory[];
  categoryRail: StorefrontCategory[];
  productRows: StorefrontHomeProductRow[];
  promoBanners: StorefrontHomePromoBanner[];
  serviceItems: StorefrontHomeServiceItem[];
  newsletter: StorefrontHomeNewsletter | null;
  featuredProducts: StorefrontProduct[];
  categorySections: StorefrontCategorySection[];
  newProducts: StorefrontProduct[];
  promotions: StorefrontPromotion[];
}

export interface ProductListParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface FavoriteListParams {
  page?: number;
  limit?: number;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
}

export interface StorefrontFavoriteIds {
  productIds: string[];
}

export interface StorefrontFavoriteMutation {
  product: StorefrontProduct;
}

export interface StorefrontFavoriteRemoval {
  productSlug: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: StorefrontProduct;
}

export interface StorefrontCart {
  items: CartItem[];
  promo: StorefrontPromotion | null;
  summary: {
    itemCount: number;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: 'GEL';
  };
}

export type StorefrontOrderStatus = 'PENDING' | 'ACCEPTED' | 'SENT_FOR_DELIVERY' | 'DELIVERED';
export type StorefrontTelegramNotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
export type DeliveryZone = 'TBILISI' | 'REGION';

export const storefrontDeliveryPrices: Record<DeliveryZone, number> = {
  TBILISI: 5,
  REGION: 8,
};

export interface StorefrontOrderItem {
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

export interface StorefrontOrder {
  id: string;
  publicCode: string;
  status: StorefrontOrderStatus;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    deliveryAddress: string;
  };
  summary: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: string;
    promoCode: string | null;
  };
  telegram: {
    status: StorefrontTelegramNotificationStatus;
    error: string | null;
    messageId: number | null;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  items: StorefrontOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorefrontOrderRequest {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryAddress: string;
  deliveryZone: DeliveryZone;
}

export interface StorefrontOrderCreateResult {
  order: StorefrontOrder;
}
