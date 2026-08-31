import type { Metadata } from 'next';
import type React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';

import { BlogIndexPage } from '@/features/blog/pages/BlogIndexPage';
import {
  DEFAULT_BLOG_LOCALE,
  PREFIXED_BLOG_LOCALES,
  isActiveBlogLocale,
  isBlogLocale,
  type BlogLocale,
} from '@/features/blog/lib/locales';
import { buildBlogIndexMetadata, parsePage } from '@/features/blog/lib/metadata';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function assertPrefixedLocale(locale: string): Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE> {
  if (!isBlogLocale(locale)) notFound();
  if (locale === DEFAULT_BLOG_LOCALE) permanentRedirect('/blog');
  if (!isActiveBlogLocale(locale)) notFound();
  return locale as Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE>;
}

export function generateStaticParams(): { locale: string }[] {
  return PREFIXED_BLOG_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isBlogLocale(rawLocale)) return {};
  if (rawLocale !== DEFAULT_BLOG_LOCALE && !isActiveBlogLocale(rawLocale)) return {};
  const locale = rawLocale === DEFAULT_BLOG_LOCALE ? DEFAULT_BLOG_LOCALE : rawLocale;
  const query = searchParams ? await searchParams : {};

  return buildBlogIndexMetadata(locale, parsePage(firstParam(query.page)));
}

export default async function Page({ params, searchParams }: PageProps): Promise<React.ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = assertPrefixedLocale(rawLocale);
  const query = searchParams ? await searchParams : {};

  return <BlogIndexPage locale={locale} rawPage={firstParam(query.page)} />;
}
