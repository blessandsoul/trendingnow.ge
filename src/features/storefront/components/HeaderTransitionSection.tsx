import type React from 'react';

import { cn } from '@/lib/utils';

interface HeaderTransitionSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  expanded: boolean;
}

export function HeaderTransitionSection({
  children,
  className,
  expanded,
  ...props
}: HeaderTransitionSectionProps): React.ReactElement {
  return (
    <div
      aria-hidden={!expanded}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
        expanded
          ? 'grid-rows-[1fr] overflow-visible opacity-100'
          : 'pointer-events-none grid-rows-[0fr] overflow-hidden opacity-0',
        className,
      )}
      {...props}
    >
      <div className={cn('min-h-0', !expanded && 'overflow-hidden')}>{children}</div>
    </div>
  );
}
