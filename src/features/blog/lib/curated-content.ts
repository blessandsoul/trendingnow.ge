import { discoveryItems, type DiscoveryItem } from '@/features/storefront/lib/discovery-pilot';
import { tagToSlug } from './slugify';
import type { BlogLocale } from './locales';

export interface CuratedCollectionProduct {
  id: string;
  slug: string;
  name: string;
  category: DiscoveryItem['category'];
  imageUrl: string;
  merchantName: string;
  merchantSku: string;
  productUrl: string;
  checkedAt: string;
  price: number | null;
}

/**
 * UI-only view model. Admission/review fields intentionally do not live here;
 * a HOLD preview may use this shape without becoming publishable content.
 */
export interface CuratedCollectionContent {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  sourceURLs: string[];
  sourceDate: string | null;
  disclosure: string;
  locale: BlogLocale;
  isFallback: boolean;
  renderedBody: string;
  products: CuratedCollectionProduct[];
}

function merchantName(item: DiscoveryItem): string {
  return item.merchantId === 'pcshop' ? 'PCShop' : item.merchantId === 'elite' ? 'Elite' : item.merchantId;
}

export function curatedProductFromDiscoveryId(id: string): CuratedCollectionProduct | null {
  const item = discoveryItems.find((candidate) => candidate.id === id);
  if (!item || item.status !== 'reviewed' || item.match !== 'exact' || !item.imageUrl?.startsWith('https://')) return null;
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category,
    imageUrl: item.imageUrl,
    merchantName: merchantName(item),
    merchantSku: item.merchantSku,
    productUrl: item.productUrl,
    checkedAt: item.checkedAt,
    price: item.price,
  };
}

export function addCuratedHeadingIds(html: string): string {
  const used = new Map<string, number>();
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs: string, inner: string) => {
    if (/\sid\s*=/.test(attrs)) return match;
    const plainText = inner.replace(/<[^>]+>/g, '').trim();
    const base = tagToSlug(plainText) || `heading-${used.size + 1}`;
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count > 0 ? `${base}-${count + 1}` : base;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}
