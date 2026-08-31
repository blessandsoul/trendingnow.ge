import type React from 'react';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { getPostWithFallback, getRelatedPosts } from '../lib/api';
import { getBlogCopy } from '../lib/copy';
import { DEFAULT_BLOG_LOCALE, localizedPath, type BlogLocale } from '../lib/locales';
import { absoluteUrl, SITE_NAME, SITE_URL } from '../lib/site';
import { extractFaqItems, stripHtml } from '../lib/structured-data';
import { BlogPost } from '../components/BlogPost';
import { ProductCrossLink } from '../components/ProductCrossLink';
import { ReadingProgress } from '../components/ReadingProgress';
import { RelatedPosts } from '../components/RelatedPosts';
import { BlogShell } from './BlogShell';

interface BlogPostPageProps {
  slug: string;
  locale: BlogLocale;
}

export async function BlogPostPage({ slug, locale }: BlogPostPageProps): Promise<React.ReactElement> {
  const result = await getPostWithFallback(slug, locale);
  if (!result) notFound();

  const { post, isFallback } = result;
  const copy = getBlogCopy(locale);
  const relatedLocale = isFallback ? DEFAULT_BLOG_LOCALE : locale;
  const relatedPosts = await getRelatedPosts(post.slug, relatedLocale, 3);
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage.startsWith('http') ? post.coverImage : absoluteUrl(post.coverImage),
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: post.locale || locale,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/storefront/trendingnow/logo.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(localizedPath(locale, `/blog/${slug}`)),
    },
    keywords: (post.tags || []).join(', '),
    wordCount: stripHtml(post.content).split(/\s+/).filter(Boolean).length,
    articleSection: (post.tags || [])[0],
  };

  const faqItems = extractFaqItems(post.content);
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.homeLabel, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: copy.title, item: absoluteUrl(localizedPath(locale, '/blog')) },
      { '@type': 'ListItem', position: 3, name: post.title },
    ],
  };

  return (
    <BlogShell>
      <ReadingProgress />
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          nonce={nonce}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {isFallback && (
        <div className="storefront-container max-w-4xl pt-8">
          <div className="rounded-[8px] border border-[#F6D98B] bg-[#FFF8D7] p-4 text-center text-sm font-semibold text-[#8A6500]">
            {copy.fallbackNotice}
          </div>
        </div>
      )}
      <BlogPost post={post} locale={locale} />
      <div className="storefront-container max-w-5xl pb-20">
        <ProductCrossLink tags={post.tags || []} locale={locale} />
        <RelatedPosts posts={relatedPosts} locale={locale} />
      </div>
    </BlogShell>
  );
}
