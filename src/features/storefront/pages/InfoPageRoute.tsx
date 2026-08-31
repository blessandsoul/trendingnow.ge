import type { Metadata } from 'next';
import type React from 'react';

import { StorefrontInfoPage } from '@/features/storefront/components/StorefrontInfoPage';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import type { AppCopy } from '@/i18n/copy';
import { buildPublicMetadata } from '@/lib/seo/metadata';

type InfoPageKey = keyof AppCopy['infoPages'];

const infoPagePaths: Record<InfoPageKey, string> = {
  aboutUs: '/about-us',
  delivery: '/delivery',
  warranty: '/warranty',
  contact: '/contact',
  paymentMethods: '/payment-methods',
  faq: '/faq',
  corporateOffer: '/corporate-offer',
};

export async function buildInfoPageMetadata(pageKey: InfoPageKey): Promise<Metadata> {
  const [copy, locale] = await Promise.all([getRequestCopy(), getRequestLocale()]);
  return buildPublicMetadata(copy.infoPages[pageKey].metadata, locale, infoPagePaths[pageKey]);
}

export async function InfoPageRoute({
  pageKey,
}: {
  pageKey: InfoPageKey;
}): Promise<React.ReactElement> {
  const copy = await getRequestCopy();
  return <StorefrontInfoPage {...copy.infoPages[pageKey]} />;
}
