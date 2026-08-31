import type { Metadata } from 'next';
import type React from 'react';

import { BlogPostPage } from '@/features/blog/pages/BlogPostPage';
import { getPosts } from '@/features/blog/lib/api';
import { DEFAULT_BLOG_LOCALE } from '@/features/blog/lib/locales';
import { buildBlogPostMetadata } from '@/features/blog/lib/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getPosts(DEFAULT_BLOG_LOCALE);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildBlogPostMetadata(slug, DEFAULT_BLOG_LOCALE);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  return <BlogPostPage slug={slug} locale={DEFAULT_BLOG_LOCALE} />;
}
