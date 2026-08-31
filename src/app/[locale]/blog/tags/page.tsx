import type { Metadata } from 'next';
import type React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';

import {
  DEFAULT_BLOG_LOCALE,
  PREFIXED_BLOG_LOCALES,
  isActiveBlogLocale,
  isBlogLocale,
  localizedPath,
  type BlogLocale,
} from '@/features/blog/lib/locales';
import { buildTagsIndexMetadata } from '@/features/blog/lib/metadata';
import { TagsIndexPage } from '@/features/blog/pages/TagsIndexPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function assertPrefixedLocale(locale: string): Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE> {
  if (!isBlogLocale(locale)) notFound();
  if (locale === DEFAULT_BLOG_LOCALE) permanentRedirect(localizedPath(DEFAULT_BLOG_LOCALE, '/blog/tags'));
  if (!isActiveBlogLocale(locale)) notFound();
  return locale as Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE>;
}

export function generateStaticParams(): { locale: string }[] {
  return PREFIXED_BLOG_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isBlogLocale(rawLocale)) return {};
  if (rawLocale !== DEFAULT_BLOG_LOCALE && !isActiveBlogLocale(rawLocale)) return {};
  const locale = rawLocale === DEFAULT_BLOG_LOCALE ? DEFAULT_BLOG_LOCALE : rawLocale;

  return buildTagsIndexMetadata(locale);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = assertPrefixedLocale(rawLocale);

  return <TagsIndexPage locale={locale} />;
}
