'use client';

import type React from 'react';
import { Suspense, useCallback } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocaleCopy } from '@/i18n/context';

interface PaginationProps {
  page: number;
  totalPages: number;
}

const PaginationInner = ({ page, totalPages }: PaginationProps): React.ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = useLocaleCopy();

  const createPageUrl = useCallback(
    (pageNumber: number): string => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pageNumber.toString());
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(createPageUrl(page - 1))}
        disabled={page <= 1}
        aria-label={copy.common.previousPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm tabular-nums text-muted-foreground">
        {copy.common.pageStatus(page, totalPages)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(createPageUrl(page + 1))}
        disabled={page >= totalPages}
        aria-label={copy.common.nextPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const Pagination = ({ page, totalPages }: PaginationProps): React.ReactElement => {
  return (
    <Suspense>
      <PaginationInner page={page} totalPages={totalPages} />
    </Suspense>
  );
};
