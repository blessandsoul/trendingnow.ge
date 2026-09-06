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
        'inline-flex h-10 w-[190px] shrink-0 items-center gap-1.5 whitespace-nowrap text-[16px] font-semibold leading-none tracking-[-0.045em] sm:text-[17px] xl:text-[18px]',
        tone === 'dark' ? 'text-white' : 'text-[#101010]',
        className,
      )}
      data-logo-format="png"
      data-logo-tone={tone}
      data-logo-version="user-v1-live-text"
    >
      <TrendingNowLogoMark className="size-[1.85em]" tone={tone} />
      <span>
        Trending<span className="text-[#092BB4]">Now</span><span className={tone === 'dark' ? 'text-white/75' : 'text-[#6B7280]'}>.ge</span>
      </span>
    </span>
  );
}
