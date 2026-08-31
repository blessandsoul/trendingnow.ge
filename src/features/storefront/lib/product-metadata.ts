import 'server-only';

import type { Metadata } from 'next';

import { env } from '@/lib/env';
import type { AppCopy } from '@/i18n/copy';
import { buildPrivateMetadata, buildProductMetadataPolicy, SITE_NAME } from '@/lib/seo/metadata';
import { DEFAULT_LOCALE, type ActiveLocale } from '@/i18n/locales';
import { getPublicProduct } from './public-product';
import { htmlToPlainText } from './format';

const DESCRIPTION_MAX_LENGTH = 160;

function absoluteProductImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;

  const apiBase = new URL(env.NEXT_PUBLIC_API_BASE_URL);
  if (src.startsWith('/uploads/')) {
    return `${apiBase.origin}${src}`;
  }

  return new URL(src, env.NEXT_PUBLIC_SITE_URL).toString();
}

function descriptionExcerpt(description: string | null, fallback: string): string {
  const text = htmlToPlainText(description ?? '');
  if (!text) return fallback;
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  return `${text.slice(0, DESCRIPTION_MAX_LENGTH).trimEnd()}...`;
}

export async function productMetadataForSlug(
  slug: string,
  copy: AppCopy,
  locale: ActiveLocale = DEFAULT_LOCALE,
): Promise<Metadata> {
  const detail = await getPublicProduct(slug);
  if (!detail) return buildPrivateMetadata(copy.metadata.product);

  const product = detail.product;
  const description = descriptionExcerpt(product.description, copy.metadata.product.description);
  const imageUrl = absoluteProductImageUrl(product.imageUrl);
  const title = `${product.name} | ${SITE_NAME}`;
  const policy = buildProductMetadataPolicy(locale, slug);

  return {
    title,
    description,
    alternates: { canonical: policy.canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: policy.canonical,
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: policy.index,
      follow: true,
    },
  };
}
