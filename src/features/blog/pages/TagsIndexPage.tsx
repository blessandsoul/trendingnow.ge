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
  const maxCount = tags[0]?.count ?? 1;

  return (
    <BlogShell>
      <div className="storefront-container py-14 md:py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-[#8B96A5]">{copy.title}</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[#07152A] sm:text-5xl md:text-6xl">
            {copy.tagsTitle}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#526071] md:text-xl">{copy.subtitle}</p>
        </div>

        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
          {tags.map(({ tag, slug, count }) => {
            const scale = 0.9 + (count / maxCount) * 0.45;
            return (
              <Link
                key={slug}
                href={localizedPath(locale, `/blog/tags/${slug}`)}
                className="rounded-full border border-[#DFE6EF] bg-white px-4 py-2 font-semibold text-[#07152A] transition-colors hover:border-[#C89300] hover:bg-[#FFF8D7]"
                style={{ fontSize: `${scale}rem` }}
              >
                {tag}
                <span className="ml-2 text-sm text-[#8B96A5]">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </BlogShell>
  );
}
