import type React from 'react';

import Link from 'next/link';

import { getAllTags } from '../lib/api';
import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import { BlogShell } from './BlogShell';

interface TagsIndexPageProps {
  locale: BlogLocale;
}

export async function TagsIndexPage({ locale }: TagsIndexPageProps): Promise<React.ReactElement> {
  const tags = await getAllTags(locale);
  const copy = getBlogCopy(locale);

  return (
    <BlogShell>
      <div className="storefront-container py-10 md:py-16">
        <header className="mb-12 max-w-4xl">
          <p className="tn-kicker mb-3">{copy.title}</p>
          <h1 className="tn-page-title">
            {copy.tagsTitle}
          </h1>
          <p className="tn-page-lede mt-4">{copy.subtitle}</p>
        </header>

        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tags.map(({ tag, slug, count }) => (
            <Link
              key={slug}
              href={localizedPath(locale, `/blog/tags/${slug}`)}
              className="tn-commerce-card flex min-h-20 items-center justify-between gap-3 px-4 py-3 font-semibold text-[#101010] transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[#092BB4] hover:bg-[#EEF2FF] motion-reduce:transform-none"
            >
              <span>{tag}</span>
              <span className="shrink-0 rounded-full bg-[#F4F2ED] px-2 py-1 text-sm font-medium tabular-nums text-[#657080]">{count}</span>
            </Link>
          ))}
        </div>
      </div>
    </BlogShell>
  );
}
