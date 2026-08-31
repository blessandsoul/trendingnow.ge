'use client';

import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { getBlogCopy } from '../lib/copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import { tagToSlug } from '../lib/slugify';
import { TableOfContents } from './TableOfContents';
import type { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
  post: BlogPostType;
  locale: BlogLocale;
}

export function BlogPost({ post, locale }: BlogPostProps): React.ReactElement {
  const copy = getBlogCopy(locale);
  const dateLocale = locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <article className="storefront-container max-w-5xl py-10 md:py-14">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 md:mb-12"
      >
        <nav aria-label={copy.breadcrumbLabel} className="mb-6 flex justify-center md:justify-start">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm text-[#526071]">
            <li>
              <Link href={localizedPath(locale, '/')} className="flex items-center gap-1 transition-colors hover:text-[#07152A]">
                <HomeIcon className="size-3.5" />
                <span className="sr-only">{copy.homeLabel}</span>
              </Link>
            </li>
            <li><ChevronRightIcon className="size-3.5 text-[#8B96A5]" /></li>
            <li>
              <Link href={localizedPath(locale, '/blog')} className="transition-colors hover:text-[#07152A]">
                {copy.title}
              </Link>
            </li>
            <li><ChevronRightIcon className="size-3.5 text-[#8B96A5]" /></li>
            <li className="max-w-[220px] truncate font-semibold text-[#07152A] sm:max-w-none" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={localizedPath(locale, `/blog/tags/${tagToSlug(tag)}`)}
              className="rounded-full border border-[#FF4057]/40 bg-[#F7F2FF] px-3 py-1 text-xs font-bold text-[#5B2DB6] transition-colors hover:border-[#8C5CF6]"
            >
              {tag}
            </Link>
          ))}
        </div>

        <h1 className="max-w-4xl text-center text-3xl font-black leading-tight tracking-tight text-[#11141B] text-balance sm:text-4xl md:text-left md:text-5xl lg:text-6xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-[#526071] md:justify-start">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}</time>
          <span aria-hidden="true">/</span>
          <span>{post.readTime}</span>
          <span aria-hidden="true">/</span>
          <span>{post.author.name}</span>
        </div>
      </motion.header>

      <motion.figure
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-[24px] border border-[#E8E0F8] bg-[#F5F7FA] shadow-xl"
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover transition-transform duration-700 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
          unoptimized={post.coverImage.startsWith('/api/og')}
        />
        {post.coverCredit && (
          <figcaption className="absolute bottom-0 right-0 rounded-tl-[8px] bg-black/40 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur-sm">
            <a href={post.coverCredit.creditUrl} target="_blank" rel="nofollow noopener noreferrer" className="hover:text-white">
              {post.coverCredit.credit}
            </a>
            {' / '}
            <a href={post.coverCredit.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="capitalize hover:text-white">
              {post.coverCredit.source}
            </a>
          </figcaption>
        )}
      </motion.figure>

      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="hidden lg:sticky lg:top-24 lg:block">
          <TableOfContents content={post.content} locale={locale} />
        </motion.aside>

        <div className="lg:hidden">
          <TableOfContents content={post.content} locale={locale} />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="prose prose-lg max-w-none
            prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[#07152A]
            prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl prose-h2:md:text-3xl
            prose-h3:mb-3 prose-h3:mt-7 prose-h3:text-xl
            prose-p:mb-5 prose-p:leading-8 prose-p:text-[#526071]
            prose-a:font-bold prose-a:text-[#5B2DB6] prose-a:no-underline hover:prose-a:underline
            prose-li:text-[#526071] prose-li:marker:text-[#8C5CF6]
            prose-strong:font-black prose-strong:text-[#07152A]
            prose-blockquote:rounded-r-[16px] prose-blockquote:border-l-4 prose-blockquote:border-[#FF4057] prose-blockquote:bg-[#FFF0F3] prose-blockquote:px-5 prose-blockquote:py-2 prose-blockquote:not-italic
            prose-code:rounded-md prose-code:bg-[#F5F7FA] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-[#174A98] prose-code:before:content-none prose-code:after:content-none
            prose-hr:border-[#DFE6EF]
            [&>*:first-child]:!mt-0"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="mt-16 border-t border-[#DFE6EF] pt-8">
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Link key={tag} href={localizedPath(locale, `/blog/tags/${tagToSlug(tag)}`)}>
              <Badge variant="secondary" className="cursor-pointer rounded-full transition-colors hover:bg-secondary/80">#{tag}</Badge>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href={localizedPath(locale, '/blog')} className="inline-flex items-center gap-2 text-sm font-black text-[#5B2DB6] transition-all hover:gap-3">
            &lt;- {copy.backToBlog}
          </Link>
        </div>
      </motion.footer>
    </article>
  );
}
