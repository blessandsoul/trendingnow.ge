import type { Metadata } from 'next';
import type React from 'react';

import { BlogIndexPage } from '@/features/blog/pages/BlogIndexPage';
import { DEFAULT_BLOG_LOCALE } from '@/features/blog/lib/locales';
import { buildBlogIndexMetadata, parsePage } from '@/features/blog/lib/metadata';

interface PageProps {
  searchParams?: Promise<{ page?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : {};
  return buildBlogIndexMetadata(DEFAULT_BLOG_LOCALE, parsePage(firstParam(params.page)));
}

export default async function Page({ searchParams }: PageProps): Promise<React.ReactElement> {
  const params = searchParams ? await searchParams : {};
  return <BlogIndexPage locale={DEFAULT_BLOG_LOCALE} rawPage={firstParam(params.page)} />;
}
