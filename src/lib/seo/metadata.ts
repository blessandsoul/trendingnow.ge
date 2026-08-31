import type { Metadata } from 'next';

import { env } from '@/lib/env';
import { ACTIVE_LOCALES, DEFAULT_LOCALE, localizedPath, type ActiveLocale } from '@/i18n/locales';

export const SITE_NAME = 'TrendingNow.ge';
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

export type MetadataSearchParams = Record<string, string | string[] | undefined>;

const CATALOG_REFINEMENT_PARAMS = ['category', 'search', 'minPrice', 'maxPrice', 'sort'] as const;

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  ACTIVE_LOCALES.forEach((locale) => {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  });
  languages['x-default'] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));

  return languages;
}

export function buildPublicMetadata(
  metadata: Pick<Metadata, 'title' | 'description'>,
  locale: ActiveLocale,
  path: string,
): Metadata {
  return {
    ...metadata,
    alternates: {
      canonical: absoluteUrl(localizedPath(locale, path)),
      languages: languageAlternates(path),
    },
  };
}

export function buildPrivateMetadata(metadata: Pick<Metadata, 'title' | 'description'>): Metadata {
  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export function buildCatalogMetadata(
  metadata: Pick<Metadata, 'title' | 'description'>,
  locale: ActiveLocale,
  isRefined = false,
): Metadata {
  return {
    ...metadata,
    alternates: {
      canonical: absoluteUrl(isRefined ? '/products' : localizedPath(locale, '/products')),
      ...(isRefined ? {} : { languages: languageAlternates('/products') }),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function hasCatalogRefinement(searchParams: MetadataSearchParams): boolean {
  return CATALOG_REFINEMENT_PARAMS.some((key) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value.some(Boolean) : Boolean(value);
  });
}

export function buildProductMetadataPolicy(locale: ActiveLocale, slug: string): {
  canonical: string;
  index: boolean;
} {
  return {
    canonical: absoluteUrl(`/products/${slug}`),
    index: locale === DEFAULT_LOCALE,
  };
}

export const onlineStoreJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/storefront/trendingnow/logo-mark-user-v1.png'),
  email: 'contact@ainow.ge',
  telephone: '+995 574 88 28 87',
  sameAs: [
    'https://www.facebook.com/continuum.ge',
    'https://www.instagram.com/continuum.ge/',
  ],
};
