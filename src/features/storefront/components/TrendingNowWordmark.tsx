import type React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

type TrendingNowLogoTone = 'light' | 'dark';

interface TrendingNowLogoProps {
  className?: string;
  tone?: TrendingNowLogoTone;
}

export function TrendingNowLogoMark({ className, tone = 'light' }: TrendingNowLogoProps): React.ReactElement {
  return (
    <Image
      src="/storefront/trendingnow/logo.png"
      alt=""
      width={512}
      height={512}
      className={cn('block size-10 shrink-0 object-contain', className)}
      aria-hidden="true"
      priority
      data-logo-format="png"
      data-logo-tone={tone}
    />
  );
}

export function TrendingNowWordmark({ className, tone = 'light' }: TrendingNowLogoProps): React.ReactElement {
  return (
    <span
      className={cn('inline-flex items-center', className)}
      aria-label="TrendingNow.ge"
    >
      <TrendingNowLogoMark className="size-full" tone={tone} />
    </span>
  );
}
