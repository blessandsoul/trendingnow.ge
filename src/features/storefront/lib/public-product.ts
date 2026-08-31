import 'server-only';

import { cache } from 'react';

import { getLocalProduct } from '../data/local-storefront';
import type { StorefrontProductDetail } from '../types/storefront.types';

export const getPublicProduct = cache(async (slug: string): Promise<StorefrontProductDetail | null> => {
  return getLocalProduct(slug);
});
