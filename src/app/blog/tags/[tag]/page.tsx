import type { Metadata } from 'next';
import type React from 'react';

import { getAllTags } from '@/features/blog/lib/api';
import { DEFAULT_BLOG_LOCALE } from '@/features/blog/lib/locales';
import { buildTagMetadata } from '@/features/blog/lib/metadata';
import { TagPage } from '@/features/blog/pages/TagPage';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const tags = await getAllTags(DEFAULT_BLOG_LOCALE);
  return tags.map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return buildTagMetadata(tag, DEFAULT_BLOG_LOCALE);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { tag } = await params;
  return <TagPage tag={tag} locale={DEFAULT_BLOG_LOCALE} />;
}
