import records from '../data/discovery-pilot.json';
import { z } from 'zod';
import { toPublicMerchantOffer, type Merchant, type MerchantOffer } from './merchant-offers';

export type DiscoveryCategory = 'workspace' | 'tech' | 'home' | 'kitchen' | 'care';
export interface DiscoveryItem extends MerchantOffer {
  slug: string;
  name: string;
  category: DiscoveryCategory;
  imageUrl: string | null;
}

export const discoveryMerchants: Record<string, Merchant> = {
  pcshop: { id: 'pcshop', name: 'PCShop', productHosts: ['pcshop.ge'] },
  elite: { id: 'elite', name: 'Elite', productHosts: ['ee.ge'] },
};

// Kept separate from legacy IDs/API fallback. No merchant permission or agreement is implied.
const recordSchema = z.object({
  id: z.string().min(1), slug: z.string().startsWith('find-'), name: z.string().min(1),
  category: z.enum(['workspace', 'tech', 'home', 'kitchen', 'care']),
  merchantId: z.string().min(1), merchantSku: z.string().min(1), productUrl: z.url(),
  checkedAt: z.iso.datetime(), price: z.number().positive().nullable(), currency: z.literal('GEL'),
  status: z.enum(['draft', 'reviewed', 'withdrawn']), match: z.enum(['exact', 'unverified']),
  availability: z.enum(['in_stock', 'out_of_stock', 'unknown']),
  relationship: z.enum(['editorial', 'affiliate', 'sponsored']),
  agreementReference: z.string().optional(), imageUrl: z.string().nullable(),
});
export const discoveryItems: DiscoveryItem[] = z.array(recordSchema).parse(records)
  .map(record => ({ ...record, productId: record.id }));

export function getDiscoveryItem(slug: string): DiscoveryItem | undefined {
  return discoveryItems.find(item => item.slug === slug);
}

export function getDiscoveryOffer(item: DiscoveryItem, now: number) {
  const merchant = discoveryMerchants[item.merchantId];
  return merchant ? toPublicMerchantOffer(item, merchant, item.id, now) : null;
}

const searchAliases: Record<string, readonly string[]> = {
  'mausi': ['მაუსი', 'mouse'],
  'mouse': ['მაუსი', 'mausi'],
  'მაუსი': ['mouse', 'mausi'],
  'laptop': ['ლეპტოპი', 'ნოუთბუქი'],
  'notebook': ['ლეპტოპი', 'ნოუთბუქი'],
  'ლეპტოპი': ['laptop', 'notebook'],
  'kettle': ['ჩაიდანი', 'чайник'],
  'ჩაიდანი': ['kettle'],
  'mixer': ['მიქსერი'],
  'მიქსერი': ['mixer'],
  'vacuum': ['მტვერსასრუტი', 'რობოტი'],
  'მტვერსასრუტი': ['vacuum'],
  'camera': ['კამერა'],
  'კამერა': ['camera'],
  'mic': ['მიკროფონი'],
  'microphone': ['მიკროფონი'],
  'მიკროფონი': ['mic', 'microphone'],
  'cable': ['კაბელი'],
  'კაბელი': ['cable'],
  'switch': ['ჩამრთველი', 'განათება'],
  'ჩამრთველი': ['switch'],
  'desk': ['მაგიდა'],
  'მაგიდა': ['desk'],
  'hair': ['ფენი', 'თმის საშრობი'],
  'dryer': ['ფენი', 'თმის საშრობი'],
  'ფენი': ['hair dryer'],
  'powerbank': ['power bank', 'პაუერბანკი', 'დამტენი'],
  'power bank': ['powerbank', 'პაუერბანკი', 'დამტენი'],
  'პაუერბანკი': ['powerbank', 'power bank'],
  'gaming': ['გეიმინგი'],
  'გეიმინგი': ['gaming'],
};

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ka-GE')
    .replace(/[×&/_,.()+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/[\s-]+/g, '');
}

function queryGroups(query: string): string[][] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean).map(term => [term, ...(searchAliases[term] ?? []).map(normalizeSearchText)]);
}

function itemSearchText(item: DiscoveryItem): string {
  const name = normalizeSearchText(item.name);
  const aliases = Object.entries(searchAliases).filter(([term]) => {
    if (name.includes(term)) return true;
    if (/(ideapad|elitebook|pv\d+)/i.test(name) && ['laptop', 'notebook'].includes(term)) return true;
    if (/(m650|m350|mg355)/i.test(name) && ['mouse', 'mausi'].includes(term)) return true;
    return false;
  }).flatMap(([, values]) => values);
  return normalizeSearchText(`${item.name} ${item.merchantSku} ${item.merchantId} ${item.category} ${aliases.join(' ')}`);
}

function resultScore(item: DiscoveryItem, query: string): number {
  const normalized = normalizeSearchText(query);
  if (!normalized) return 0;
  const haystack = itemSearchText(item);
  const sku = compactSearchText(item.merchantSku);
  const compactQuery = compactSearchText(normalized);
  if (sku === compactQuery) return 10_000;
  if (normalizeSearchText(item.name) === normalized) return 8_000;
  if (haystack.includes(normalized)) return 6_000 - normalized.length;
  const groups = queryGroups(query);
  const matched = groups.filter(group => group.some(term => haystack.includes(term)));
  return matched.length === groups.length ? 4_000 + matched.length * 10 : matched.length * 10;
}

export function searchDiscovery(
  query: string,
  category: string,
  now: number,
  minPrice?: number,
  maxPrice?: number,
): DiscoveryItem[] {
  const groups = queryGroups(query);
  return discoveryItems
    .filter(item => {
      if (category && item.category !== category) return false;
      const offer = getDiscoveryOffer(item, now);
      if (!offer) return false;
      if (minPrice !== undefined && (offer.price === null || offer.price < minPrice)) return false;
      if (maxPrice !== undefined && (offer.price === null || offer.price > maxPrice)) return false;
      if (!groups.length) return true;
      const haystack = itemSearchText(item);
      return groups.every(group => group.some(term => haystack.includes(term)));
    })
    .sort((left, right) => resultScore(right, query) - resultScore(left, query));
}

export type DiscoveryEvidenceState = 'fresh' | 'stale' | 'expired';

export function getDiscoveryEvidenceState(item: DiscoveryItem, now: number): DiscoveryEvidenceState {
  const checkedAt = Date.parse(item.checkedAt);
  if (!Number.isFinite(now) || !Number.isFinite(checkedAt) || now < checkedAt || now - checkedAt >= 30 * 86_400_000) return 'expired';
  return now - checkedAt < 86_400_000 ? 'fresh' : 'stale';
}
