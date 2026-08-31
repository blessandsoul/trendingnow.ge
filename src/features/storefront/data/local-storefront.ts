import type { PaginatedApiResponse } from '@/lib/api/api.types';
import { currentCatalog, type StoreCategory } from './currentCatalog';
import { getProductVisuals } from './product-media';
import type {
  CartItem,
  ProductListParams,
  StorefrontCart,
  StorefrontCategory,
  StorefrontHome,
  StorefrontProduct,
  StorefrontProductDetail,
} from '../types/storefront.types';

type CategoryConfig = {
  slug: string;
  description: string;
  imageUrl: string;
};

const categoryOrder: StoreCategory[] = ['მოდა', 'სახლი', 'ტექნიკა', 'ავტო', 'სპორტი', 'მოვლა'];

const categoryConfig: Record<StoreCategory, CategoryConfig> = {
  მოდა: {
    slug: 'fashion',
    description: 'ყოველდღიური ტანსაცმელი და აქსესუარები',
    imageUrl: '/storefront/trendingnow/category-fashion-v2.webp',
  },
  სახლი: {
    slug: 'home',
    description: 'პრაქტიკული ნივთები სახლისთვის',
    imageUrl: '/storefront/trendingnow/category-home-v2.webp',
  },
  ტექნიკა: {
    slug: 'technology',
    description: 'სასარგებლო ტექნიკა ყოველდღიური გამოყენებისთვის',
    imageUrl: '/storefront/trendingnow/category-tech-v2.webp',
  },
  ავტო: {
    slug: 'automotive',
    description: 'ხელსაწყოები და აქსესუარები ავტომობილისთვის',
    imageUrl: '/storefront/trendingnow/category-auto-v2.webp',
  },
  სპორტი: {
    slug: 'sport',
    description: 'ტანსაცმელი და ნივთები აქტიური დღისთვის',
    imageUrl: '/storefront/trendingnow/category-sport-v2.webp',
  },
  მოვლა: {
    slug: 'care',
    description: 'დასუფთავებისა და მოვლის ტექნიკა',
    imageUrl: '/storefront/trendingnow/category-care-v2.webp',
  },
};

function parsePrice(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/[^\d.,]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function productCategory(category: StoreCategory): StorefrontProduct['category'] {
  const config = categoryConfig[category];
  return {
    id: `category-${config.slug}`,
    slug: config.slug,
    name: category,
  };
}

export const localProducts: StorefrontProduct[] = currentCatalog.products.map((product, index) => ({
  id: product.id,
  slug: `product-${product.id}`,
  name: product.name,
  description: product.note,
  brand: 'TrendingNow',
  imageUrl: getProductVisuals(product.id)[0],
  salePrice: parsePrice(product.price) ?? 0,
  originalPrice: parsePrice(product.oldPrice),
  currency: 'GEL',
  isFeatured: index < 12,
  isNew: false,
  isBestseller: product.rank <= 10,
  updatedAt: currentCatalog.capturedAt,
  category: productCategory(product.category),
}));

export const localCategories: StorefrontCategory[] = categoryOrder.map((name, index) => {
  const config = categoryConfig[name];
  return {
    id: `category-${config.slug}`,
    slug: config.slug,
    name,
    description: config.description,
    imageUrl: config.imageUrl,
    sortOrder: index,
    isFeatured: true,
    productCount: localProducts.filter((product) => product.category.slug === config.slug).length,
    parentId: null,
    children: [],
  };
});

const featuredProducts = localProducts.slice(0, 12);
const fashionProducts = localProducts.filter((product) => product.category.slug === 'fashion');
const practicalProducts = localProducts.filter((product) =>
  ['home', 'automotive', 'care'].includes(product.category.slug),
);

export const localStorefrontHome: StorefrontHome = {
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
  categories: localCategories,
  categoryRail: localCategories,
  productRows: [
    {
      id: 'row-trending',
      title: 'ახლა ტრენდში',
      source: 'MANUAL',
      placement: 'ABOVE_BANNERS',
      productLimit: featuredProducts.length,
      sortOrder: 0,
      isActive: true,
      category: null,
      products: featuredProducts,
    },
    {
      id: 'row-fashion',
      title: 'მოდა და ყოველდღიური სტილი',
      source: 'CATEGORY',
      placement: 'BELOW_BANNERS',
      productLimit: fashionProducts.length,
      sortOrder: 1,
      isActive: true,
      category: productCategory('მოდა'),
      products: fashionProducts,
    },
    {
      id: 'row-practical',
      title: 'სახლი, მოვლა და ავტო',
      source: 'MANUAL',
      placement: 'BELOW_BANNERS',
      productLimit: practicalProducts.length,
      sortOrder: 2,
      isActive: true,
      category: null,
      products: practicalProducts,
    },
  ],
  promoBanners: [
    {
      id: 'promo-city',
      imageUrl: '/storefront/trendingnow/promo-city-ready-v2.webp',
      title: 'ქალაქისთვის მზად',
      eyebrow: 'ყოველდღიური არჩევანი',
      ctaLabel: 'ნახვა',
      ctaHref: '/products?category=fashion',
      tone: 'BLUE',
      sortOrder: 0,
    },
    {
      id: 'promo-home',
      imageUrl: '/storefront/trendingnow/promo-home-reset-v2.webp',
      title: 'სახლის ახალი რეჟიმი',
      eyebrow: 'მოვლა და წესრიგი',
      ctaLabel: 'ნახვა',
      ctaHref: '/products?category=care',
      tone: 'WARM',
      sortOrder: 1,
    },
    {
      id: 'promo-road',
      imageUrl: '/storefront/trendingnow/promo-road-ready-v2.webp',
      title: 'გზისთვის მზად',
      eyebrow: 'ავტომობილი',
      ctaLabel: 'ნახვა',
      ctaHref: '/products?category=automotive',
      tone: 'NAVY',
      sortOrder: 2,
    },
    {
      id: 'promo-active',
      imageUrl: '/storefront/trendingnow/promo-active-day-v2.webp',
      title: 'აქტიური დღის არჩევანი',
      eyebrow: 'სპორტი',
      ctaLabel: 'ნახვა',
      ctaHref: '/products?category=sport',
      tone: 'BLUE',
      sortOrder: 3,
    },
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
  featuredProducts,
  categorySections: localCategories.map((category, index) => ({
    id: `section-${category.slug}`,
    slot: index,
    title: category.name,
    productLimit: category.productCount,
    displayOrder: index,
    isActive: true,
    category: { id: category.id, slug: category.slug, name: category.name },
    products: localProducts.filter((product) => product.category.slug === category.slug),
  })),
  newProducts: localProducts.slice(0, 8),
  promotions: [],
};

export function getLocalProducts(
  params: ProductListParams = {},
): PaginatedApiResponse<StorefrontProduct>['data'] {
  const normalizedSearch = params.search?.trim().toLocaleLowerCase('ka-GE');
  let items = localProducts.filter((product) => {
    if (params.category && product.category.slug !== params.category) return false;
    if (normalizedSearch) {
      const searchable = `${product.name} ${product.description ?? ''} ${product.category.name}`.toLocaleLowerCase('ka-GE');
      if (!searchable.includes(normalizedSearch)) return false;
    }
    if (params.minPrice !== undefined && product.salePrice < params.minPrice) return false;
    if (params.maxPrice !== undefined && product.salePrice > params.maxPrice) return false;
    return true;
  });

  items = [...items].sort((left, right) => {
    if (params.sort === 'price-asc') return left.salePrice - right.salePrice;
    if (params.sort === 'price-desc') return right.salePrice - left.salePrice;
    if (params.sort === 'newest') return right.updatedAt.localeCompare(left.updatedAt);
    return Number(right.isFeatured) - Number(left.isFeatured);
  });

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 12);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function getLocalProduct(slug: string): StorefrontProductDetail | null {
  const product = localProducts.find((item) => item.slug === slug);
  if (!product) return null;

  const productVisuals = getProductVisuals(product.id);
  const detailProduct = {
    ...product,
    gallery: productVisuals.map((url, index) => ({
      type: 'image' as const,
      url,
      thumbnailUrl: url,
      alt: `${product.name} — AI ვიზუალი ${index + 1}`,
    })),
    attributes: {
      sku: product.id,
      highlights: [
        product.description ?? 'პროდუქტის ძირითადი ინფორმაცია',
        `კატეგორია: ${product.category.name}`,
        'ფასი და შეკვეთის პირობები დასტურდება შეძენამდე',
      ],
      specificationGroups: [
        {
          title: 'ძირითადი ინფორმაცია',
          items: [
            { label: 'კატეგორია', value: product.category.name },
            { label: 'კოდი', value: product.id },
            { label: 'ვალუტა', value: 'GEL' },
          ],
        },
      ],
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
  };

  return {
    product: detailProduct,
    relatedProducts: localProducts
      .filter((item) => item.id !== product.id && item.category.slug === product.category.slug)
      .slice(0, 6),
    recentProducts: localProducts.filter((item) => item.id !== product.id).slice(0, 5),
  };
}

const localCartQuantities = new Map<string, number>();

export function getLocalCart(): StorefrontCart {
  const items: CartItem[] = Array.from(localCartQuantities.entries()).flatMap(([slug, quantity]) => {
    const product = localProducts.find((item) => item.slug === slug);
    if (!product) return [];
    return [{
      id: `local-${slug}`,
      quantity,
      unitPrice: product.salePrice,
      lineTotal: product.salePrice * quantity,
      product,
    }];
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items,
    promo: null,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount: 0,
      shipping: 0,
      total: subtotal,
      currency: 'GEL',
    },
  };
}

export function addLocalCartItem(productSlug: string, quantity = 1): StorefrontCart {
  const current = localCartQuantities.get(productSlug) ?? 0;
  localCartQuantities.set(productSlug, Math.min(99, current + Math.max(1, quantity)));
  return getLocalCart();
}

export function updateLocalCartItem(itemId: string, quantity: number): StorefrontCart {
  const slug = itemId.replace(/^local-/, '');
  if (quantity <= 0) localCartQuantities.delete(slug);
  else localCartQuantities.set(slug, Math.min(99, quantity));
  return getLocalCart();
}

export function removeLocalCartItem(itemId: string): StorefrontCart {
  localCartQuantities.delete(itemId.replace(/^local-/, ''));
  return getLocalCart();
}

export function clearLocalCart(): StorefrontCart {
  localCartQuantities.clear();
  return getLocalCart();
}
