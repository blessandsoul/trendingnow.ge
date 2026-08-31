import 'server-only';

import type { Metadata } from 'next';

import { getPostWithFallback, getAvailableLocales, getTagBySlug } from './api';
import { getBlogCopy } from './copy';
import {
  ACTIVE_BLOG_LOCALES,
  DEFAULT_BLOG_LOCALE,
  localizedPath,
  type BlogLocale,
} from './locales';
import { absoluteUrl, SITE_NAME, SITE_URL } from './site';

export const BLOG_PAGE_SIZE = 24;

export function parsePage(raw: string | undefined): number {
  const page = Number.parseInt(raw ?? '1', 10);
  return Number.isNaN(page) || page < 1 ? 1 : page;
}

function clampTitle(title: string, max = 56): string {
  if (title.length <= max) return title;
  const cut = title.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  ACTIVE_BLOG_LOCALES.forEach((locale) => {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  });
  languages['x-default'] = absoluteUrl(localizedPath(DEFAULT_BLOG_LOCALE, path));
  return languages;
}

export function buildBlogIndexMetadata(locale: BlogLocale, page: number): Metadata {
  const copy = getBlogCopy(locale);
  const path = '/blog';
  const suffix = page > 1 ? `?page=${page}` : '';

  return {
    title: page > 1 ? `${copy.seoTitle} - ${page}` : copy.seoTitle,
    description: copy.seoDescription,
    alternates: {
      canonical: `${absoluteUrl(localizedPath(locale, path))}${suffix}`,
      ...(page === 1 ? { languages: languageAlternates(path) } : {}),
    },
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      url: `${absoluteUrl(localizedPath(locale, path))}${suffix}`,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.seoTitle,
      description: copy.seoDescription,
    },
  };
}

export async function buildBlogPostMetadata(slug: string, locale: BlogLocale): Promise<Metadata> {
  const result = await getPostWithFallback(slug, locale);
  const copy = getBlogCopy(locale);
  if (!result) return { title: copy.postNotFoundTitle };

  const { post, isFallback } = result;
  const availableLocales = getAvailableLocales(slug);
  const currentUrl = absoluteUrl(localizedPath(locale, `/blog/${slug}`));
  const defaultUrl = absoluteUrl(localizedPath(DEFAULT_BLOG_LOCALE, `/blog/${slug}`));
  const languages: Record<string, string> = {};

  availableLocales.forEach((availableLocale) => {
    languages[availableLocale] = absoluteUrl(localizedPath(availableLocale, `/blog/${slug}`));
  });
  if (availableLocales.includes(DEFAULT_BLOG_LOCALE)) {
    languages['x-default'] = defaultUrl;
  }

  const ogDate = post.date && !Number.isNaN(new Date(post.date).getTime())
    ? new Date(post.date).toISOString().slice(0, 10)
    : '';
  const ogParams = new URLSearchParams({ title: post.title });
  if (ogDate) ogParams.set('date', ogDate);
  if (post.tags?.length) ogParams.set('tags', post.tags.slice(0, 4).join(','));
  const ogImage = `${SITE_URL}/api/og?${ogParams.toString()}`;

  return {
    title: `${clampTitle(post.title)} | ${SITE_NAME}`,
    description: post.excerpt,
    alternates: {
      canonical: isFallback ? defaultUrl : currentUrl,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: currentUrl,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    robots: {
      index: !isFallback,
      follow: true,
    },
  };
}

export function buildTagsIndexMetadata(locale: BlogLocale): Metadata {
  const copy = getBlogCopy(locale);
  const url = absoluteUrl(localizedPath(locale, '/blog/tags'));
  const title = `${copy.tagsTitle} | ${SITE_NAME}`;

  return {
    title,
    description: copy.seoDescription,
    alternates: {
      canonical: url,
      languages: languageAlternates('/blog/tags'),
    },
    openGraph: { title, description: copy.seoDescription, url, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary', title, description: copy.seoDescription },
    robots: { index: false, follow: true },
  };
}

export async function buildTagMetadata(tagSlug: string, locale: BlogLocale): Promise<Metadata> {
  const result = await getTagBySlug(tagSlug, locale);
  const copy = getBlogCopy(locale);
  if (!result) return { title: copy.tagNotFoundTitle, robots: { index: false, follow: true } };

  const url = absoluteUrl(localizedPath(locale, `/blog/tags/${tagSlug}`));
  const title = `${result.tag} | ${copy.title} | ${SITE_NAME}`;
  const description = `${result.posts.length} ${copy.articlesLabel}: ${result.tag}.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: false, follow: true },
  };
}
