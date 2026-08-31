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
      src="/storefront/trendingnow/favicon.png"
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
    <Image
      src={tone === 'dark' ? '/storefront/trendingnow/logo-dark.png' : '/storefront/trendingnow/logo.png'}
      alt="TrendingNow.ge"
      width={1600}
      height={320}
      className={cn('block h-auto w-[190px] shrink-0 object-contain', className)}
      priority
      data-logo-format="png"
      data-logo-tone={tone}
    />
  );
}
