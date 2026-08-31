import type React from 'react';
import Link from 'next/link';

import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import { BlogCard } from './BlogCard';
import type { BlogPost } from '../types';

interface BlogListProps {
  posts: BlogPost[];
  locale: BlogLocale;
  topTags?: { tag: string; slug: string }[];
}

export function BlogList({ posts, locale, topTags = [] }: BlogListProps): React.ReactElement {
  const copy = getBlogCopy(locale);

  return (
    <div>
      {posts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard key={post.id} post={post} locale={locale} index={index} />
          ))}
        </div>
      ) : (
        <div className="tn-surface rounded-[20px] px-5 py-14 text-center text-[#526071]">
          {copy.noPostsForTag}
        </div>
      )}

      {topTags.length > 0 && (
        <section aria-labelledby="blog-topics" className="mt-14">
          <h2 id="blog-topics" className="mb-4 text-center text-xl font-black tracking-tight text-[#11141B]">
            {copy.topicsHeading}
          </h2>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {topTags.map(({ tag, slug }) => (
              <Link
                key={slug}
                href={localizedPath(locale, `/blog/tags/${slug}`)}
                className="rounded-full border border-[#E8E0F8] bg-white px-4 py-1.5 text-sm font-semibold text-[#526071] transition-colors hover:border-[#8C5CF6] hover:bg-[#F7F2FF] hover:text-[#5B2DB6]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="text-center">
        <Link
          href={localizedPath(locale, '/blog/tags')}
          className="text-sm font-semibold text-[#5B2DB6] underline-offset-4 transition-colors hover:text-[#FF4057] hover:underline"
        >
          {copy.viewAllTags}
        </Link>
      </div>
    </div>
  );
}
