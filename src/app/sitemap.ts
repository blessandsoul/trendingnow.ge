import type { MetadataRoute } from 'next';

import { getAvailableLocales, getPosts } from '@/features/blog/lib/api';
import { getLocalProducts } from '@/features/storefront/data/local-storefront';
import { absoluteUrl, languageAlternates } from '@/lib/seo/metadata';
import { collectProductSitemapEntries } from '@/lib/seo/sitemap-products';
import { ACTIVE_BLOG_LOCALES, DEFAULT_BLOG_LOCALE, localizedPath, type BlogLocale } from '@/features/blog/lib/locales';

const STATIC_PATHS = [
  '/',
  '/products',
  '/delivery',
  '/warranty',
  '/contact',
  '/payment-methods',
  '/faq',
  '/corporate-offer',
] as const;

function blogLanguageAlternates(path: string, locales: BlogLocale[] = [...ACTIVE_BLOG_LOCALES]): Record<string, string> {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  });
  languages['x-default'] = absoluteUrl(localizedPath(DEFAULT_BLOG_LOCALE, path));
  return languages;
}

async function fetchProductSitemapPage(page: number) {
  const payload = getLocalProducts({ page, limit: 48, sort: 'featured' });
  return {
    items: payload.items.map(({ slug, updatedAt }) => ({ slug, updatedAt })),
    totalPages: payload.pagination.totalPages,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  ACTIVE_BLOG_LOCALES.forEach((locale) => {
    STATIC_PATHS.forEach((path) => {
      entries.push({
        url: absoluteUrl(localizedPath(locale, path)),
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.7,
        alternates: { languages: languageAlternates(path) },
      });
    });
  });

  ACTIVE_BLOG_LOCALES.forEach((locale) => {
    entries.push({
      url: absoluteUrl(localizedPath(locale, '/blog')),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: blogLanguageAlternates('/blog') },
    });
  });

  const seen = new Set<string>();
  for (const locale of ACTIVE_BLOG_LOCALES) {
    const posts = await getPosts(locale);
    posts.forEach((post) => {
      const key = `${locale}:${post.slug}`;
      if (seen.has(key)) return;
      seen.add(key);

      const availableLocales = getAvailableLocales(post.slug);
      entries.push({
        url: absoluteUrl(localizedPath(locale, `/blog/${post.slug}`)),
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.75,
        alternates: {
          languages: blogLanguageAlternates(`/blog/${post.slug}`, availableLocales),
        },
      });
    });
  }

  entries.push(...await collectProductSitemapEntries(fetchProductSitemapPage));

  return entries;
}
