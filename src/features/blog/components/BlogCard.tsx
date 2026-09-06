'use client';

import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  locale: BlogLocale;
  className?: string;
  index?: number;
}

export function BlogCard({ post, locale, className, index = 0 }: BlogCardProps): React.ReactElement {
  const copy = getBlogCopy(locale);

  return (
    <Link
      href={localizedPath(locale, `/blog/${post.slug}`)}
      className={cn(
        'group flex h-full cursor-pointer flex-col overflow-hidden border border-[#D9DDE7] bg-white shadow-[0_8px_24px_rgba(17,20,27,0.055)]',
        'transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#092BB4] hover:shadow-[0_14px_34px_rgba(17,20,27,0.09)] motion-reduce:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/70 focus-visible:ring-offset-2',
        className,
      )}
      data-featured={index === 0 ? 'true' : undefined}
    >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F4F2ED]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={post.coverImage.startsWith('/api/og')}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#101010]/70 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-55" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="border border-white/20 bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-[#101010] transition-colors group-hover:text-[#061E81]">
            {post.title}
          </h3>
          <p className="text-sm leading-6 text-[#526071]">
            {post.excerpt.length > 112 ? `${post.excerpt.slice(0, 112)}... ` : `${post.excerpt} `}
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#092BB4] transition-[gap] group-hover:gap-2">
              {copy.readMore} <span aria-hidden="true">-&gt;</span>
            </span>
          </p>
        </div>
    </Link>
  );
}
