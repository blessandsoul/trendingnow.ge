import { discoveryItems, discoveryMerchants, getDiscoveryOffer, type DiscoveryItem } from './discovery-pilot';

export type RetentionProduct = {
  id: string;
  slug: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  comparisonKey: string;
  merchantName: string;
  merchantSku: string;
  productUrl: string;
  checkedAt: string;
  price: number | null;
  currency: 'GEL';
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  imageUrl: string | null;
  offerHref: string | null;
  offerRel: string | null;
};

/** Only exact same-type pairs are comparable; a broad category is not enough. */
const discoveryComparisonKeys: Record<string, string> = {
  'pcshop-1': 'mouse',
  'pcshop-2': 'mouse',
  'elite-2': 'mouse',
  'pcshop-10': 'laptop',
  'pcshop-11': 'laptop',
  'pcshop-12': 'laptop',
};

export function getDiscoveryComparisonKey(itemId: string): string {
  return discoveryComparisonKeys[itemId] ?? '';
}

/** Stable comparison group consumed by the public saved/compare controls. */
export function getRetentionComparisonGroup(itemId: string): string {
  return getDiscoveryComparisonKey(itemId);
}

const discoveryCategoryLabels = {
  ka: { workspace: 'სამუშაო სივრცე', tech: 'ტექნიკა', home: 'სახლი', kitchen: 'სამზარეულო', care: 'მოვლა' },
  en: { workspace: 'Workspace', tech: 'Tech', home: 'Home', kitchen: 'Kitchen', care: 'Care' },
  ru: { workspace: 'Рабочее место', tech: 'Техника', home: 'Дом', kitchen: 'Кухня', care: 'Уход' },
} as const;

export function getDiscoveryCategoryLabel(categoryKey: string, locale: 'ka' | 'en' | 'ru'): string {
  return discoveryCategoryLabels[locale][categoryKey as keyof (typeof discoveryCategoryLabels)['ka']] ?? categoryKey;
}

export function toRetentionProduct(item: DiscoveryItem, now: number): RetentionProduct {
  const offer = getDiscoveryOffer(item, now);
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    categoryKey: item.category,
    categoryLabel: item.category,
    comparisonKey: getDiscoveryComparisonKey(item.id),
    merchantName: discoveryMerchants[item.merchantId]?.name ?? item.merchantId,
    merchantSku: item.merchantSku,
    productUrl: item.productUrl,
    checkedAt: item.checkedAt,
    price: offer?.price ?? null,
    currency: 'GEL',
    availability: offer?.availability ?? 'unknown',
    imageUrl: item.imageUrl,
    offerHref: offer?.href ?? null,
    offerRel: offer?.rel ?? null,
  };
}

export function resolveDiscoveryRetentionProducts(ids: readonly string[], now: number): RetentionProduct[] {
  return ids.flatMap((id) => {
    const item = discoveryItems.find((candidate) => candidate.id === id);
    return item ? [toRetentionProduct(item, now)] : [];
  });
}
