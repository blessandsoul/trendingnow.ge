import type React from 'react';
import { headers } from 'next/headers';

import { absoluteUrl, SITE_NAME, SITE_URL } from '../lib/site';
import { localizedPath, type BlogLocale } from '../lib/locales';
import type { AcceptedCollection } from '../lib/accepted-collections';
import { CuratedCollectionPost } from '../components/CuratedCollectionPost';
import { BlogShell } from './BlogShell';

export async function CuratedCollectionPage({
  collection,
  locale,
}: {
  collection: AcceptedCollection;
  locale: BlogLocale;
}): Promise<React.ReactElement> {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const image = collection.products[0]?.imageUrl;
  const contentLocale = collection.isFallback ? 'ka' : collection.locale;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: collection.title,
    description: collection.excerpt,
    ...(image ? { image } : {}),
    datePublished: collection.manualAdmission?.approvedAt ?? collection.sourceDate,
    dateModified: collection.reviewedAt,
    inLanguage: contentLocale,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    articleSection: collection.category,
    keywords: collection.tags.join(', '),
    isPartOf: {
      '@type': 'CollectionPage',
      name: collection.category,
      url: absoluteUrl(localizedPath(locale, '/blog')),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(localizedPath(locale, `/blog/${collection.slug}`)),
    },
  };

  return (
    <BlogShell>
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CuratedCollectionPost collection={collection} locale={locale} reviewMetadata={{ reviewedAt: collection.reviewedAt }} />
    </BlogShell>
  );
}
