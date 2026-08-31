'use client';

import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import { tagToSlug } from '../lib/slugify';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  locale: BlogLocale;
  className?: string;
  index?: number;
}

export function BlogCard({ post, locale, className, index = 0 }: BlogCardProps): React.ReactElement {
  const router = useRouter();
  const copy = getBlogCopy(locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={localizedPath(locale, `/blog/${post.slug}`)}
        className={cn(
          'group flex h-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[#E8E0F8] bg-white shadow-[0_12px_34px_rgba(17,20,27,0.06)]',
          'transition-all duration-300 hover:-translate-y-1 hover:border-[#8C5CF6] hover:shadow-xl hover:shadow-[#07152A]/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/70 focus-visible:ring-offset-2',
          className,
        )}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F5F7FA]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={post.coverImage.startsWith('/api/og')}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#07152A]/70 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-55" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  router.push(localizedPath(locale, `/blog/tags/${tagToSlug(tag)}`));
                }}
                className="rounded-full border border-white/20 bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/30"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 line-clamp-2 text-base font-black leading-snug text-[#11141B] transition-colors group-hover:text-[#5B2DB6]">
            {post.title}
          </h3>
          <p className="text-sm leading-6 text-[#526071]">
            {post.excerpt.length > 112 ? `${post.excerpt.slice(0, 112)}... ` : `${post.excerpt} `}
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#FF4057] transition-all group-hover:gap-2">
              {copy.readMore} <span aria-hidden="true">-&gt;</span>
            </span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
