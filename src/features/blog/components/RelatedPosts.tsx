import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import type { BlogPost } from '../types';

interface RelatedPostsProps {
  posts: BlogPost[];
  locale: BlogLocale;
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps): React.ReactElement | null {
  const copy = getBlogCopy(locale);

  if (!posts.length) return null;

  return (
    <aside className="mt-16 border-t border-[#DFE6EF] pt-10" aria-label={copy.relatedPosts}>
      <h2 className="mb-6 text-xl font-black tracking-tight text-[#07152A]">{copy.relatedPosts}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={localizedPath(locale, `/blog/${post.slug}`)}
            className="group flex gap-3 rounded-[8px] border border-[#DFE6EF] bg-white p-3 transition-all hover:bg-[#FAFBFC] hover:shadow-md"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-[7px] bg-[#F5F7FA]">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="80px" unoptimized={post.coverImage.startsWith('/api/og')} />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <h3 className="line-clamp-2 text-sm font-bold text-[#07152A] transition-colors group-hover:text-[#174A98]">
                {post.title}
              </h3>
              <time dateTime={post.date} className="mt-1 text-xs text-[#8B96A5]">
                {new Date(post.date).toLocaleDateString('ka-GE', { month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
