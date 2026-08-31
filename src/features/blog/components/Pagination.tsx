import type React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { localizedPath, type BlogLocale } from '../lib/locales';

type PageItem = number | '...';

function pageWindow(current: number, total: number): PageItem[] {
  const wanted = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const out: PageItem[] = [];
  let prev = 0;

  for (const page of pages) {
    if (page - prev === 2) out.push(prev + 1);
    else if (page - prev > 2) out.push('...');
    out.push(page);
    prev = page;
  }

  return out;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  locale: BlogLocale;
}

export function Pagination({ page, totalPages, prevLabel, nextLabel, locale }: PaginationProps): React.ReactElement | null {
  if (totalPages <= 1) return null;

  const href = (nextPage: number): string => {
    const base = localizedPath(locale, '/blog');
    return nextPage === 1 ? base : `${base}?page=${nextPage}`;
  };
  const arrowPill = 'rounded-full border border-[#E8E0F8] bg-white px-4 py-2 text-sm font-semibold text-[#526071] transition-colors hover:border-[#8C5CF6] hover:bg-[#F7F2FF] hover:text-[#5B2DB6]';
  const numPill = 'flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm font-semibold transition-colors';

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2 px-2 sm:px-0">
      {page > 1 && (
        <Link rel="prev" href={href(page - 1)} className={arrowPill}>
          &lt;- <span className="hidden sm:inline">{prevLabel}</span>
        </Link>
      )}

      {pageWindow(page, totalPages).map((item, index) =>
        item === '...' ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-[#8B96A5]" aria-hidden="true">
            ...
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={cn(numPill, 'border-[#FF4057] bg-[#FF4057] text-white')}>
            {item}
          </span>
        ) : (
          <Link key={item} href={href(item)} className={cn(numPill, 'border-[#E8E0F8] bg-white text-[#526071] hover:border-[#8C5CF6] hover:text-[#5B2DB6]')}>
            {item}
          </Link>
        ),
      )}

      {page < totalPages && (
        <Link rel="next" href={href(page + 1)} className={arrowPill}>
          <span className="hidden sm:inline">{nextLabel}</span> -&gt;
        </Link>
      )}
    </nav>
  );
}
