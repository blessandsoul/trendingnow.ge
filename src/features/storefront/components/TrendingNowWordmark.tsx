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
      src="/storefront/trendingnow/logo-mark-user-v1.png"
      alt=""
      width={1254}
      height={1254}
      className={cn('block size-10 shrink-0 object-contain', className)}
      aria-hidden="true"
      priority
      data-logo-format="png"
      data-logo-tone={tone}
      data-logo-version="user-v1"
    />
  );
}

export function TrendingNowWordmark({ className, tone = 'light' }: TrendingNowLogoProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap font-[family-name:Discovery_Anton] text-[29px] font-normal leading-none tracking-[-1px] sm:text-[35px]',
        tone === 'dark' ? 'text-white' : 'text-[#101010]',
        className,
      )}
      data-logo-format="text"
      data-logo-tone={tone}
      data-logo-version="bold-discovery"
    >
      TrendingNow.ge
    </span>
  );
}
