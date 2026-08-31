import type { Metadata } from 'next';
import type React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';

import { BlogPostPage } from '@/features/blog/pages/BlogPostPage';
import { getPosts } from '@/features/blog/lib/api';
import {
  DEFAULT_BLOG_LOCALE,
  PREFIXED_BLOG_LOCALES,
  isActiveBlogLocale,
  isBlogLocale,
  localizedPath,
  type BlogLocale,
} from '@/features/blog/lib/locales';
import { buildBlogPostMetadata } from '@/features/blog/lib/metadata';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function assertPrefixedLocale(
  locale: string,
  slug: string,
): Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE> {
  if (!isBlogLocale(locale)) notFound();
  if (locale === DEFAULT_BLOG_LOCALE) permanentRedirect(localizedPath(DEFAULT_BLOG_LOCALE, `/blog/${slug}`));
  if (!isActiveBlogLocale(locale)) notFound();
  return locale as Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE>;
}

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  const params = await Promise.all(
    PREFIXED_BLOG_LOCALES.map(async (locale) => {
      const posts = await getPosts(locale);
      return posts.map((post) => ({ locale, slug: post.slug }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isBlogLocale(rawLocale)) return {};
  if (rawLocale !== DEFAULT_BLOG_LOCALE && !isActiveBlogLocale(rawLocale)) return {};
  const locale = rawLocale === DEFAULT_BLOG_LOCALE ? DEFAULT_BLOG_LOCALE : rawLocale;

  return buildBlogPostMetadata(slug, locale);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertPrefixedLocale(rawLocale, slug);

  return <BlogPostPage slug={slug} locale={locale} />;
}
