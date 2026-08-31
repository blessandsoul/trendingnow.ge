import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type React from 'react';

import { ProductDetailStorefront } from '@/features/storefront/components/ProductDetailStorefront';
import { buildProductMetadataPolicy } from '@/lib/seo/metadata';
import { getRequestCopy } from '@/i18n/server';
import { getPublicProduct } from '../lib/public-product';
import { buildProductStructuredData } from '../lib/product-structured-data';

export async function ProductDetailRoute({ slug }: { slug: string }): Promise<React.ReactElement> {
  const detail = await getPublicProduct(slug);
  if (!detail) notFound();

  const [requestHeaders, copy] = await Promise.all([headers(), getRequestCopy()]);
  const nonce = requestHeaders.get('x-nonce') ?? undefined;
  const canonicalUrl = buildProductMetadataPolicy('ka', slug).canonical;
  const { productJsonLd, breadcrumbJsonLd } = buildProductStructuredData(detail, canonicalUrl, {
    home: copy.common.home,
    products: copy.common.products,
  });

  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailStorefront slug={slug} initialData={detail} />
    </>
  );
}
