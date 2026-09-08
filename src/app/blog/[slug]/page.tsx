import type { Metadata } from 'next';
import type React from 'react';

import { BlogPostPage } from '@/features/blog/pages/BlogPostPage';
import { getPosts } from '@/features/blog/lib/api';
import { getAcceptedCollections } from '@/features/blog/lib/accepted-collections';
import { DEFAULT_BLOG_LOCALE } from '@/features/blog/lib/locales';
import { buildBlogPostMetadata } from '@/features/blog/lib/metadata';

// A missing slug deliberately reaches the shared not-found boundary. The post
// renderer also reads the request nonce for JSON-LD, so this route must stay
// request-dynamic instead of failing during static fallback rendering.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getPosts(DEFAULT_BLOG_LOCALE);
  const collections = await getAcceptedCollections(DEFAULT_BLOG_LOCALE);
  return [...posts.map((post) => ({ slug: post.slug })), ...collections.map((collection) => ({ slug: collection.slug }))];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildBlogPostMetadata(slug, DEFAULT_BLOG_LOCALE);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  return <BlogPostPage slug={slug} locale={DEFAULT_BLOG_LOCALE} />;
}
