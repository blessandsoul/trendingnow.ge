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
      <div className="storefront-container py-10 md:py-16">
        <div className="tn-surface mx-auto mb-12 max-w-4xl rounded-[24px] px-6 py-10 text-center sm:px-10 md:py-14">
          <p className="tn-kicker mb-3">{copy.title}</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[#11141B] sm:text-5xl md:text-6xl">
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
                className="rounded-full border border-[#E8E0F8] bg-white px-4 py-2 font-semibold text-[#11141B] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#8C5CF6] hover:bg-[#F7F2FF]"
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
