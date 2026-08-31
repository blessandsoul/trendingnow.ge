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
      <div className="storefront-container py-14 md:py-20">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-[#8B96A5]">Continuum GE</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[#07152A] text-balance sm:text-5xl md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#526071] md:text-xl">{copy.subtitle}</p>
        </div>

        {isFallback && (
          <div className="mx-auto mb-8 max-w-3xl rounded-[8px] border border-[#F6D98B] bg-[#FFF8D7] p-4 text-center text-sm font-semibold text-[#8A6500]">
            {copy.fallbackNotice}
          </div>
        )}

        <section aria-labelledby="blog-latest">
          <h2 id="blog-latest" className="mb-8 text-2xl font-black tracking-tight text-[#07152A]">
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
