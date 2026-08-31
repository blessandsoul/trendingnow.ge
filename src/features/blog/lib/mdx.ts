import 'server-only';

import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { marked } from 'marked';

import { tagToSlug } from './slugify';
import type { BlogPost } from '../types';

const blogRoot = path.join(process.cwd(), 'content', 'blog');

marked.setOptions({
  gfm: true,
  breaks: false,
});

function getLocaleDir(locale: string): string {
  return path.join(blogRoot, locale);
}

function safeSlug(slug: string): string | undefined {
  const realSlug = slug.replace(/\.mdx$/, '');
  if (!realSlug || realSlug.includes('..') || /[\\/]/.test(realSlug)) {
    return undefined;
  }
  return realSlug;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, '').trim());
}

function addHeadingIds(html: string): string {
  const used = new Map<string, number>();

  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs: string, inner: string) => {
    if (/\sid\s*=/.test(attrs)) return match;

    const base = tagToSlug(stripTags(inner)) || `heading-${used.size + 1}`;
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const id = count > 0 ? `${base}-${count + 1}` : base;

    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

function renderMarkdown(raw: string): string {
  const html = marked.parse(raw) as string;

  return addHeadingIds(
    html.replace(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      '',
    ),
  );
}

export function getPostSlugs(locale = 'ka'): string[] {
  const dir = getLocaleDir(locale);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'));
}

export function getPostBySlug(
  slug: string,
  locale = 'ka',
  fields: string[] = [],
): Partial<BlogPost> {
  const realSlug = safeSlug(slug);
  if (!realSlug) return {};

  const fullPath = path.join(getLocaleDir(locale), `${realSlug}.mdx`);
  if (!fs.existsSync(fullPath)) return {};

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const items: Record<string, unknown> = {};

    fields.forEach((field) => {
      if (field === 'slug') items[field] = realSlug;
      if (field === 'id') items[field] = realSlug;
      if (field === 'content') items[field] = renderMarkdown(content);
      if (typeof data[field] !== 'undefined') items[field] = data[field];
    });

    items.locale = locale;
    return items as Partial<BlogPost>;
  } catch (error) {
    console.error(`Error reading blog post ${fullPath}`, error);
    return {};
  }
}

export function getAllPosts(locale = 'ka', fields: string[] = []): Partial<BlogPost>[] {
  return getPostSlugs(locale)
    .map((slug) => getPostBySlug(slug, locale, fields))
    .filter((post) => post.slug || post.id)
    .sort((postA, postB) => ((postA.date ?? '') > (postB.date ?? '') ? -1 : 1));
}
