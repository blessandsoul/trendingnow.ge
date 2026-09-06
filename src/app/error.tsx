'use client';

import type React from 'react';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StorefrontFooter } from '@/features/storefront/components/StorefrontFooter';
import { StorefrontHeader } from '@/features/storefront/components/StorefrontHeader';
import { useLocaleCopy } from '@/i18n/context';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  const copy = useLocaleCopy();

  return (
    <div className="tn-page min-h-dvh text-[#101010]">
      <StorefrontHeader />
      <main className="storefront-container grid min-h-[58dvh] place-items-center py-12 text-center">
        <section className="tn-commerce-card w-full max-w-[620px] p-8 sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#EEF2FF] text-[#C72D42]">
            <AlertCircle className="size-8" aria-hidden="true" />
          </span>
          <p className="tn-kicker mt-5">TrendingNow.ge</p>
          <h1 className="mt-3 text-3xl font-semibold">{copy.errors.globalTitle}</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#526071]">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : copy.errors.globalDescription}
          </p>
          <Button className="tn-primary-action mt-6 h-11 px-6" onClick={reset}>{copy.errors.retry}</Button>
        </section>
      </main>
      <StorefrontFooter />
    </div>
  );
}
