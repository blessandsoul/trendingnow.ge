import type React from 'react';

import { getAllTags, getPosts } from '../lib/api';
import { getBlogCopy } from '../lib/copy';
import { BLOG_PAGE_SIZE, parsePage } from '../lib/metadata';
import { DEFAULT_BLOG_LOCALE, type BlogLocale } from '../lib/locales';
import { BlogList } from '../components/BlogList';
import { Pagination } from '../components/Pagination';
import { BlogShell } from './BlogShell';

interface BlogIndexPageProps {
  locale: BlogLocale;
  rawPage?: string;
}

export async function BlogIndexPage({ locale, rawPage }: BlogIndexPageProps): Promise<React.ReactElement> {
  const copy = getBlogCopy(locale);
  let posts = await getPosts(locale);
  const isFallback = posts.length === 0 && locale !== DEFAULT_BLOG_LOCALE;
  if (isFallback) posts = await getPosts(DEFAULT_BLOG_LOCALE);

  const contentLocale = isFallback ? DEFAULT_BLOG_LOCALE : locale;
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const pagePosts = posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const topTags = (await getAllTags(contentLocale)).slice(0, 24);

  return (
    <BlogShell>
      <div className="storefront-container py-10 md:py-16">
        <div className="tn-dark-panel relative mx-auto mb-14 max-w-5xl overflow-hidden px-6 py-12 text-center sm:px-10 md:py-16">
          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-[#8C5CF6]/35 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-12 size-60 rounded-full bg-[#19C6A6]/20 blur-3xl" aria-hidden="true" />
          <p className="tn-kicker relative mb-4 text-white/70">TrendingNow.ge</p>
          <h1 className="relative text-4xl font-black leading-tight tracking-tight text-white text-balance sm:text-5xl md:text-6xl">
            {copy.title}
          </h1>
          <p className="relative mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/70 md:text-xl">{copy.subtitle}</p>
        </div>

        {isFallback && (
          <div className="mx-auto mb-8 max-w-3xl rounded-[16px] border border-[#D9C7FF] bg-[#F7F2FF] p-4 text-center text-sm font-semibold text-[#5B2DB6]">
            {copy.fallbackNotice}
          </div>
        )}

        <section aria-labelledby="blog-latest">
          <h2 id="blog-latest" className="mb-8 text-2xl font-black tracking-tight text-[#11141B]">
            {copy.latestHeading}
          </h2>
          <BlogList posts={pagePosts} locale={locale} topTags={topTags} />
        </section>

        <Pagination
          page={page}
          totalPages={totalPages}
          prevLabel={copy.prevPage}
          nextLabel={copy.nextPage}
          locale={locale}
        />
      </div>
    </BlogShell>
  );
}
