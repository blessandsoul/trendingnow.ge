import type React from 'react';
import type { Metadata } from 'next';

import { ProductsStorefront } from '@/features/storefront/components/ProductsStorefront';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { buildCatalogMetadata, hasCatalogRefinement, type MetadataSearchParams } from '@/lib/seo/metadata';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<MetadataSearchParams>;
}): Promise<Metadata> {
  const [copy, locale] = await Promise.all([getRequestCopy(), getRequestLocale()]);
  return buildCatalogMetadata(copy.metadata.products, locale, hasCatalogRefinement(await searchParams));
}

export default function ProductsPage(): React.ReactElement {
  return <ProductsStorefront />;
}
