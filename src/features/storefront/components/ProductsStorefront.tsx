'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DiscoveryPilot } from './DiscoveryPilot';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { normalizeCatalogParams } from '../lib/catalog-navigation';
import type { ProductListParams } from '../types/storefront.types';

function numberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** The public catalog is source-backed discovery. Legacy inventory remains available to cart/history routes. */
export function ProductsStorefront({ now }: { now: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo<ProductListParams>(() => normalizeCatalogParams({
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    minPrice: numberParam(searchParams.get('minPrice')),
    maxPrice: numberParam(searchParams.get('maxPrice')),
  }), [searchParams]);

  const updateFilters = (next: ProductListParams): void => {
    const query = new URLSearchParams();
    if (next.search) query.set('search', next.search);
    if (next.category) query.set('category', next.category);
    if (next.minPrice !== undefined) query.set('minPrice', String(next.minPrice));
    if (next.maxPrice !== undefined) query.set('maxPrice', String(next.maxPrice));
    router.push(query.toString() ? `${pathname}?${query.toString()}` : pathname, { scroll: false });
  };

  return <div className="tn-page min-h-dvh bg-[#F4F2ED] text-[#101010]"><StorefrontHeader /><DiscoveryPilot now={now} initialFilters={params} onFiltersChange={updateFilters} shell={false} /><StorefrontFooter /></div>;
}
