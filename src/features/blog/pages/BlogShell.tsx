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
    <div className="min-h-dvh bg-white text-[#07152A]">
      <Suspense fallback={<HeaderFallback />}>
        <StorefrontHeader />
      </Suspense>
      <main>{children}</main>
      <StorefrontFooter />
    </div>
  );
}
