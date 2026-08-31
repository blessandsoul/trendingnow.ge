import type { Metadata } from 'next';
import type React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';

import { getAllTagSlugsAcrossLocales } from '@/features/blog/lib/api';
import {
  DEFAULT_BLOG_LOCALE,
  isActiveBlogLocale,
  isBlogLocale,
  localizedPath,
  type BlogLocale,
} from '@/features/blog/lib/locales';
import { buildTagMetadata } from '@/features/blog/lib/metadata';
import { TagPage } from '@/features/blog/pages/TagPage';

interface PageProps {
  params: Promise<{ locale: string; tag: string }>;
}

function assertPrefixedLocale(
  locale: string,
  tag: string,
): Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE> {
  if (!isBlogLocale(locale)) notFound();
  if (locale === DEFAULT_BLOG_LOCALE) permanentRedirect(localizedPath(DEFAULT_BLOG_LOCALE, `/blog/tags/${tag}`));
  if (!isActiveBlogLocale(locale)) notFound();
  return locale as Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE>;
}

export async function generateStaticParams(): Promise<{ locale: string; tag: string }[]> {
  const tags = await getAllTagSlugsAcrossLocales();
  return tags
    .filter(({ locale }) => locale !== DEFAULT_BLOG_LOCALE && isActiveBlogLocale(locale))
    .map(({ locale, slug }) => ({ locale, tag: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, tag } = await params;
  if (!isBlogLocale(rawLocale)) return {};
  if (rawLocale !== DEFAULT_BLOG_LOCALE && !isActiveBlogLocale(rawLocale)) return {};
  const locale = rawLocale === DEFAULT_BLOG_LOCALE ? DEFAULT_BLOG_LOCALE : rawLocale;

  return buildTagMetadata(tag, locale);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { locale: rawLocale, tag } = await params;
  const locale = assertPrefixedLocale(rawLocale, tag);

  return <TagPage tag={tag} locale={locale} />;
}
