import type { Metadata } from 'next';
import { ProductDetailRoute } from '@/features/storefront/pages/ProductDetailRoute';
import { productMetadataForSlug } from '@/features/storefront/lib/product-metadata';
import { getRequestCopy } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const copy = await getRequestCopy();
  const { slug } = await params;
  return productMetadataForSlug(slug, copy, 'ka');
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailRoute slug={slug} />;
}
