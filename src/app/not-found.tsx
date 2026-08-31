import type React from 'react';

import Link from 'next/link';

import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StorefrontFooter } from '@/features/storefront/components/StorefrontFooter';
import { StorefrontHeader } from '@/features/storefront/components/StorefrontHeader';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { localizedPath } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';

export default async function NotFound(): Promise<React.ReactElement> {
  const copy = await getRequestCopy();
  const locale = await getRequestLocale();

  return (
    <div className="tn-page min-h-dvh text-[#11141B]">
      <StorefrontHeader />
      <main className="storefront-container grid min-h-[58dvh] place-items-center py-12 text-center">
        <section className="tn-surface w-full max-w-[620px] rounded-[24px] p-8 sm:p-12">
          <span className="tn-soft-icon mx-auto grid size-16 place-items-center">
            <FileQuestion className="size-8" />
          </span>
          <p className="tn-kicker mt-5">TrendingNow.ge</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{copy.errors.notFoundTitle}</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#526071]">
            {copy.errors.notFoundDescription}
          </p>
          <Button asChild className="tn-primary-action mt-6 h-11 px-6">
            <Link href={localizedPath(locale, ROUTES.HOME)}>{copy.errors.goHome}</Link>
          </Button>
        </section>
      </main>
      <StorefrontFooter />
    </div>
  );
}
