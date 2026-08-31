import type React from 'react';
import type { Metadata } from 'next';

import { CartStorefront } from '@/features/storefront/components/CartStorefront';
import { getRequestCopy } from '@/i18n/server';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return buildPrivateMetadata(copy.metadata.cart);
}

export default function CartPage(): React.ReactElement {
  return <CartStorefront />;
}
