import type React from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

import { getAllTags, getPosts } from '../lib/api';
import { getAcceptedCollections } from '../lib/accepted-collections';
import { getBlogCopy } from '../lib/copy';
import { BLOG_PAGE_SIZE, parsePage } from '../lib/metadata';
import { DEFAULT_BLOG_LOCALE, localizedPath, type BlogLocale } from '../lib/locales';
import { BlogList } from '../components/BlogList';
import { CuratedCollectionSection } from '../components/CuratedCollectionGrid';
import { Pagination } from '../components/Pagination';
import { BlogShell } from './BlogShell';

interface BlogIndexPageProps {
  locale: BlogLocale;
  rawPage?: string;
}

export async function BlogIndexPage({ locale, rawPage }: BlogIndexPageProps): Promise<React.ReactElement> {
  const copy = getBlogCopy(locale);
  let posts = await getPosts(locale);
  const curatedCollections = await getAcceptedCollections(locale);
  const isFallback = posts.length === 0 && locale !== DEFAULT_BLOG_LOCALE;
  if (isFallback) posts = await getPosts(DEFAULT_BLOG_LOCALE);

  const contentLocale = isFallback ? DEFAULT_BLOG_LOCALE : locale;
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const pagePosts = posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const topTags = (await getAllTags(contentLocale)).slice(0, 24);

  return (
    <BlogShell>
      <CuratedCollectionSection collections={curatedCollections} locale={locale} />
      <div className="storefront-container py-10 md:py-16">
        <header className="tn-page-intro mb-12">
          <div>
            <p className="tn-kicker">TrendingNow.ge</p>
            <h1 className="tn-page-title mt-4">{copy.title}</h1>
            <p className="tn-page-lede mt-4">{copy.subtitle}</p>
          </div>
          <aside className="tn-dark-panel p-5 shadow-[0_14px_38px_rgba(17,20,27,0.14)] sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Newspaper className="size-4 text-[#FFE622]" aria-hidden="true" />
              {copy.topicsHeading}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/70">{copy.subtitle}</p>
            <Link
              href={localizedPath(locale, '/blog/tags')}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-none bg-[#092BB4] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(9,43,180,0.22)] transition-[background-color,transform] hover:bg-[#061E81] active:scale-[0.96]"
            >
              {copy.viewAllTags}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </aside>
        </header>

        {isFallback && (
          <div className="mx-auto mb-8 max-w-3xl rounded-none border border-[#D9DDE7] bg-[#EEF2FF] p-4 text-center text-sm font-semibold text-[#061E81]">
            {copy.fallbackNotice}
          </div>
        )}

        <section aria-labelledby="blog-latest">
          <h2 id="blog-latest" className="tn-section-title mb-8">
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
