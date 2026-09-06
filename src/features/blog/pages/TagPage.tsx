import type React from 'react';

import { headers } from 'next/headers';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';

import { BlogCard } from '../components/BlogCard';
import { ProductCrossLink } from '../components/ProductCrossLink';
import { getTagBySlug } from '../lib/api';
import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import { absoluteUrl, SITE_NAME, SITE_URL } from '../lib/site';
import { BlogShell } from './BlogShell';

interface TagPageProps {
  tag: string;
  locale: BlogLocale;
}

export async function TagPage({ tag, locale }: TagPageProps): Promise<React.ReactElement> {
  const result = await getTagBySlug(tag, locale);
  if (!result) permanentRedirect(localizedPath(locale, '/blog/tags'));

  const copy = getBlogCopy(locale);
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const tagUrl = absoluteUrl(localizedPath(locale, `/blog/tags/${tag}`));

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: result.tag,
    description: copy.tagDescription(result.tag),
    url: tagUrl,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: result.posts.length,
      itemListElement: result.posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(localizedPath(locale, `/blog/${post.slug}`)),
        name: post.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.homeLabel, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: copy.title, item: absoluteUrl(localizedPath(locale, '/blog')) },
      { '@type': 'ListItem', position: 3, name: copy.tagsTitle, item: absoluteUrl(localizedPath(locale, '/blog/tags')) },
      { '@type': 'ListItem', position: 4, name: result.tag },
    ],
  };

  return (
    <BlogShell>
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="storefront-container py-10 md:py-16">
        <nav className="mb-6 flex flex-wrap justify-start gap-2 text-sm font-medium text-[#526071]">
          <Link href={localizedPath(locale, '/blog')} className="hover:text-[#101010]">{copy.title}</Link>
          <span>/</span>
          <Link href={localizedPath(locale, '/blog/tags')} className="hover:text-[#101010]">{copy.tagsTitle}</Link>
          <span>/</span>
          <span className="text-[#101010]">{result.tag}</span>
        </nav>

        <header className="mb-12 max-w-4xl">
          <p className="tn-kicker mb-3">TrendingNow.ge</p>
          <h1 className="tn-page-title">
            {result.tag}
          </h1>
          <p className="tn-page-lede mt-4">
            {result.posts.length} {copy.articlesLabel}
          </p>
        </header>

        {result.posts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {result.posts.map((post, index) => (
              <BlogCard key={post.id} post={post} locale={locale} index={index} className={index === 0 ? 'sm:col-span-2 xl:col-span-2' : undefined} />
            ))}
          </div>
        ) : (
          <div className="tn-commerce-card px-5 py-14 text-center text-[#526071]">
            {copy.noPostsForTag}
          </div>
        )}

        <div className="mx-auto max-w-5xl">
          <ProductCrossLink tags={[result.tag]} locale={locale} />
        </div>
      </div>
    </BlogShell>
  );
}
