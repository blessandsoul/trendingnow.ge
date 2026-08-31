import type React from 'react';
import { Suspense } from 'react';

import { StorefrontFooter } from '@/features/storefront/components/StorefrontFooter';
import { StorefrontHeader } from '@/features/storefront/components/StorefrontHeader';

function HeaderFallback(): React.ReactElement {
  return <div className="h-[124px] border-b border-[#E3E8EF] bg-white" />;
}

interface BlogShellProps {
  children: React.ReactNode;
}

export function BlogShell({ children }: BlogShellProps): React.ReactElement {
  return (
    <div className="tn-page min-h-dvh text-[#11141B]">
      <Suspense fallback={<HeaderFallback />}>
        <StorefrontHeader />
      </Suspense>
      <main className="relative">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
