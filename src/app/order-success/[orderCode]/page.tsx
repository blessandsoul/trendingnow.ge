import type React from 'react';
import type { Metadata } from 'next';

import { OrderSuccessPage } from '@/features/storefront/components/OrderSuccessPage';
import { getRequestCopy } from '@/i18n/server';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return buildPrivateMetadata(copy.metadata.cart);
}

export default async function OrderSuccessRoute({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}): Promise<React.ReactElement> {
  const { orderCode } = await params;

  return <OrderSuccessPage orderCode={orderCode} />;
}
