/** External offers are separate from legacy stock, carts and editorial products.
 * A prospect is not a partner. Only an exact, manually reviewed offer may publish.
 */
export interface Merchant {
  id: string;
  name: string;
  /** Exact hosts approved for product pages; no implicit subdomain trust. */
  productHosts: readonly string[];
}

export interface MerchantOffer {
  id: string;
  productId: string;
  merchantId: string;
  merchantSku: string;
  productUrl: string;
  status: 'draft' | 'reviewed' | 'withdrawn';
  match: 'exact' | 'unverified';
  /** Review of the exact model AND variant, not just a category or image. */
  checkedAt: string;
  price: number | null;
  currency: 'GEL';
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  relationship: 'editorial' | 'affiliate' | 'sponsored';
  /** Required for paid relationships; internal reference, never public. */
  agreementReference?: string;
}

export interface PublicMerchantOffer {
  id: string;
  merchantName: string;
  href: string;
  checkedAt: string;
  price: number | null;
  currency: 'GEL';
  availability: MerchantOffer['availability'];
  disclosure: MerchantOffer['relationship'];
  rel: string;
}

const DAY = 86_400_000;

/** Link review expires after 30 days; price/stock snapshots after 24 hours.
 * These editorial limits do not guarantee live inventory. Recheck at the store.
 * Pass a shared server time to avoid hydration drift at expiry boundaries.
 */
export function toPublicMerchantOffer(
  offer: MerchantOffer,
  merchant: Merchant,
  productId: string,
  now: number,
): PublicMerchantOffer | null {
  const checkedAt = Date.parse(offer.checkedAt);
  const age = now - checkedAt;
  if (
    !Number.isFinite(now) || !Number.isFinite(checkedAt) || age < 0 || age >= 30 * DAY ||
    offer.status !== 'reviewed' || offer.match !== 'exact' ||
    offer.productId !== productId || offer.merchantId !== merchant.id ||
    !offer.merchantSku.trim() || !offer.id.trim() || !merchant.name.trim() ||
    (offer.relationship !== 'editorial' && !offer.agreementReference?.trim()) ||
    (offer.price !== null && (!Number.isFinite(offer.price) || offer.price <= 0))
  ) return null;

  let url: URL;
  try {
    url = new URL(offer.productUrl);
  } catch {
    return null;
  }
  if (
    url.protocol !== 'https:' || url.username || url.password || url.port ||
    !merchant.productHosts.includes(url.hostname) ||
    url.pathname === '/' || /\/(search|login|cart|checkout)(\/|$)/i.test(url.pathname)
  ) return null;

  const fresh = age < DAY;
  return {
    id: offer.id,
    merchantName: merchant.name,
    href: url.href,
    checkedAt: offer.checkedAt,
    price: fresh ? offer.price : null,
    currency: offer.currency,
    availability: fresh ? offer.availability : 'unknown',
    disclosure: offer.relationship,
    rel: offer.relationship === 'editorial' ? 'noopener noreferrer' : 'sponsored noopener noreferrer',
  };
}
