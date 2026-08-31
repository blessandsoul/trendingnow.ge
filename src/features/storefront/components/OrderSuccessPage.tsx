'use client';

import type React from 'react';
import Link from 'next/link';
import { CheckCircle2, PackageCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCopy } from '@/i18n/copy';
import { localizedPath, type ActiveLocale } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';

interface OrderSuccessPageProps {
  orderCode: string;
  locale?: ActiveLocale;
}

export function OrderSuccessPage({ orderCode, locale = 'ka' }: OrderSuccessPageProps): React.ReactElement {
  const copy = getCopy(locale);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="tn-page min-h-dvh text-[#11141B]">
      <StorefrontHeader />
      <main className="px-4 py-10 sm:py-14">
        <section className="mx-auto grid min-h-[56dvh] max-w-[720px] place-items-center">
          <div className="tn-surface w-full rounded-[24px] p-6 text-center sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#EAF8EF] text-[#2A9D4A]">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight text-[#11141B] sm:text-4xl">
            {copy.orderSuccess.title(orderCode)}
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-[#526071] sm:text-base">
            {copy.orderSuccess.text}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild className="tn-primary-action h-11 px-6">
              <Link href={localizedPath(locale, ROUTES.PRODUCTS)}>{copy.orderSuccess.continueShopping}</Link>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" className="tn-secondary-action h-11 px-6">
                <Link href={localizedPath(locale, ROUTES.DASHBOARD_ORDERS)}>
                  <PackageCheck className="size-4" />
                  {copy.orderSuccess.viewOrders}
                </Link>
              </Button>
            )}
          </div>
          </div>
        </section>
      </main>
      <StorefrontFooter />
    </div>
  );
}
