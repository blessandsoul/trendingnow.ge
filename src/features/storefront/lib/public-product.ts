import 'server-only';

import { cache } from 'react';

import { env } from '@/lib/env';
import type { ApiResponse } from '@/lib/api/api.types';
import { getLocalProduct } from '../data/local-storefront';
import type { StorefrontProductDetail } from '../types/storefront.types';

export const getPublicProduct = cache(async (slug: string): Promise<StorefrontProductDetail | null> => {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASE_URL}/storefront/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(2_000) },
    );
    if (response.ok) {
      const body = await response.json() as ApiResponse<StorefrontProductDetail>;
      return body.data;
    }
  } catch {
    // The bundled catalog keeps existing product pages available during a
    // temporary API outage. Checkout still requires the server and never
    // fabricates an order locally.
  }
  return getLocalProduct(slug);
});
