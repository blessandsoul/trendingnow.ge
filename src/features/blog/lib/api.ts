import 'server-only';

import fs from 'fs';
import path from 'path';

import { ACTIVE_BLOG_LOCALES, DEFAULT_BLOG_LOCALE, type BlogLocale } from './locales';
import { getAllPosts, getPostBySlug as getMdxPost } from './mdx';
import { tagToSlug } from './slugify';
import type { BlogPost } from '../types';

type CoverMapping = Record<string, {
  path: string;
  credit: string;
  creditUrl: string;
  source: 'unsplash' | 'pexels';
  sourceUrl: string;
}>;

let coverMapping: CoverMapping | null = null;

const BLOG_DEFAULTS: Record<BlogLocale, { authorName: string; authorRole: string; readTime: string }> = {
  ka: {
    authorName: 'TrendingNow გუნდი',
    authorRole: 'პროდუქტების რედაქტორები',
    readTime: '4 წუთი',
  },
  en: {
    authorName: 'TrendingNow Team',
    authorRole: 'Product editors',
    readTime: '4 min read',
  },
  ru: {
    authorName: 'Команда TrendingNow',
    authorRole: 'Редакторы по товарам',
    readTime: '4 мин',
  },
};

function getCoverMapping(): CoverMapping {
  if (coverMapping) return coverMapping;

  const mappingPath = path.join(process.cwd(), 'content', 'blog', 'covers.json');
  try {
    if (fs.existsSync(mappingPath)) {
      coverMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as CoverMapping;
      return coverMapping;
    }
  } catch {
    // Fallback to generated OG covers.
  }

  coverMapping = {};
  return coverMapping;
}

function normalizeAuthor(post: Partial<BlogPost>, locale: BlogLocale): Partial<BlogPost> {
  const defaults = BLOG_DEFAULTS[locale] ?? BLOG_DEFAULTS[DEFAULT_BLOG_LOCALE];
  const rawAuthor = post.author as unknown;
  if (typeof rawAuthor === 'string') {
    const [name, role] = rawAuthor.split(/\s*\/\s*/);
    post.author = {
      name: name?.trim() || defaults.authorName,
      role: role?.trim() || defaults.authorRole,
    };
  } else if (!rawAuthor || typeof (rawAuthor as { name?: unknown }).name !== 'string') {
    post.author = { name: defaults.authorName, role: defaults.authorRole };
  }

  return post;
}

function ensureDefaults(post: Partial<BlogPost>, locale: BlogLocale): Partial<BlogPost> {
  if (!post.tags || !Array.isArray(post.tags)) post.tags = [];
  if (!post.readTime) post.readTime = (BLOG_DEFAULTS[locale] ?? BLOG_DEFAULTS[DEFAULT_BLOG_LOCALE]).readTime;
  post.locale = locale;
  return normalizeAuthor(post, locale);
}

function ensureCoverImage(post: Partial<BlogPost>): Partial<BlogPost> {
  const mapping = getCoverMapping();
  const entry = post.slug ? mapping[post.slug] : undefined;

  if (!post.coverImage && entry?.path) {
    post.coverImage = entry.path;
  }

  if (entry && !post.coverCredit) {
    post.coverCredit = {
      credit: entry.credit,
      creditUrl: entry.creditUrl,
      source: entry.source,
      sourceUrl: entry.sourceUrl,
    };
  }

  if (!post.coverImage) {
    const params = new URLSearchParams({ title: post.title || 'TrendingNow.ge' });
    const tags = post.tags?.filter(Boolean).slice(0, 3);
    if (tags?.length) params.set('tags', tags.join(','));
    post.coverImage = `/api/og?${params.toString()}`;
  }

  return post;
}

export async function getPosts(locale: BlogLocale = DEFAULT_BLOG_LOCALE): Promise<BlogPost[]> {
  const posts = getAllPosts(locale, [
    'id',
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'coverQuery',
    'excerpt',
    'tags',
    'readTime',
  ]);

  return posts.map((post) => ensureDefaults(ensureCoverImage(post), locale)) as BlogPost[];
}

export async function getPostBySlug(
  slug: string,
  locale: BlogLocale = DEFAULT_BLOG_LOCALE,
): Promise<BlogPost | undefined> {
  const post = getMdxPost(slug, locale, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'coverImage',
    'coverQuery',
    'excerpt',
    'tags',
    'readTime',
  ]);

  if (!post.slug) return undefined;
  return ensureDefaults(ensureCoverImage(post), locale) as BlogPost;
}

export async function getPostWithFallback(
  slug: string,
  locale: BlogLocale,
): Promise<{ post: BlogPost; isFallback: boolean } | undefined> {
  const post = await getPostBySlug(slug, locale);
  if (post) return { post, isFallback: false };

  if (locale !== DEFAULT_BLOG_LOCALE) {
    const fallback = await getPostBySlug(slug, DEFAULT_BLOG_LOCALE);
    if (fallback) return { post: fallback, isFallback: true };
  }

  return undefined;
}

export async function getRelatedPosts(
  currentSlug: string,
  locale: BlogLocale = DEFAULT_BLOG_LOCALE,
  limit = 3,
): Promise<BlogPost[]> {
  const allPosts = await getPosts(locale);
  const current = allPosts.find((post) => post.slug === currentSlug);
  if (!current) return [];

  return allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => ({
      post,
      score: (post.tags || []).filter((tag) => (current.tags || []).includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}

export function getAvailableLocales(slug: string): BlogLocale[] {
  return ACTIVE_BLOG_LOCALES.filter((locale) => {
    const filePath = path.join(process.cwd(), 'content', 'blog', locale, `${slug}.mdx`);
    return fs.existsSync(filePath);
  });
}

export async function getAllTags(locale: BlogLocale = DEFAULT_BLOG_LOCALE): Promise<{ tag: string; slug: string; count: number }[]> {
  const posts = await getPosts(locale);
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagToSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getTagBySlug(
  slug: string,
  locale: BlogLocale = DEFAULT_BLOG_LOCALE,
): Promise<{ tag: string; posts: BlogPost[] } | undefined> {
  const allPosts = await getPosts(locale);
  let matchedTag: string | undefined;

  for (const post of allPosts) {
    matchedTag = (post.tags || []).find((tag) => tagToSlug(tag) === slug);
    if (matchedTag) break;
  }

  if (!matchedTag) return undefined;

  return {
    tag: matchedTag,
    posts: allPosts.filter((post) => (post.tags || []).some((tag) => tagToSlug(tag) === slug)),
  };
}

export async function getAllTagSlugsAcrossLocales(): Promise<{ locale: BlogLocale; slug: string }[]> {
  const out: { locale: BlogLocale; slug: string }[] = [];

  for (const locale of ACTIVE_BLOG_LOCALES) {
    const tags = await getAllTags(locale);
    tags.forEach(({ slug }) => out.push({ locale, slug }));
  }

  return out;
}
