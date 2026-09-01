import type React from 'react';

import { cn } from '@/lib/utils';

interface AiImageMarkProps {
  label: string;
  variant?: 'card' | 'compact' | 'gallery';
  className?: string;
}

export function AiImageMark({
  label,
  variant = 'card',
  className,
}: AiImageMarkProps): React.ReactElement {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'pointer-events-none grid place-items-center border border-white/70 bg-[#11141B]/84 font-black leading-none text-white shadow-[0_5px_16px_rgba(17,20,27,0.18)] backdrop-blur-sm',
        variant === 'card' && 'size-7 rounded-[9px] text-[9px] tracking-[-0.04em]',
        variant === 'compact' && 'size-6 rounded-[8px] text-[8px] tracking-[-0.04em]',
        variant === 'gallery' && 'size-8 rounded-[10px] text-[10px] tracking-[-0.04em]',
        className,
      )}
    >
      AI
    </span>
  );
}
