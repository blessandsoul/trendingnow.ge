import type React from 'react';
import type { Metadata } from 'next';

import { HomeStorefront } from '@/features/storefront/components/HomeStorefront';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { buildPublicMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const [copy, locale] = await Promise.all([getRequestCopy(), getRequestLocale()]);
  return buildPublicMetadata(copy.metadata.home, locale, '/');
}

export default function Page(): React.ReactElement {
  return <HomeStorefront />;
}
