import { env } from '@/lib/env';
import { absoluteUrl, SITE_NAME } from '@/lib/seo/metadata';
import type { StorefrontProductDetail } from '../types/storefront.types';
import { htmlToPlainText } from './format';

function absoluteProductMediaUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;

  const apiBase = new URL(env.NEXT_PUBLIC_API_BASE_URL);
  if (src.startsWith('/uploads/')) {
    return `${apiBase.origin}${src}`;
  }

  return absoluteUrl(src);
}

export function buildProductStructuredData(
  detail: StorefrontProductDetail,
  canonicalUrl: string,
  labels: { home: string; products: string } = { home: SITE_NAME, products: 'Products' },
) {
  const { product } = detail;
  const images = Array.from(new Set(
    product.gallery
      .filter((item) => item.type === 'image')
      .map((item) => absoluteProductMediaUrl(item.url)),
  ));
  if (images.length === 0) images.push(absoluteProductMediaUrl(product.imageUrl));

  return {
    productJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: htmlToPlainText(product.description ?? ''),
      image: images,
      sku: product.attributes.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      offers: {
        '@type': 'Offer',
        price: String(product.salePrice),
        priceCurrency: product.currency,
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
      },
    },
    breadcrumbJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: labels.home, item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: labels.products, item: absoluteUrl('/products') },
        { '@type': 'ListItem', position: 3, name: product.name, item: canonicalUrl },
      ],
    },
  };
}
