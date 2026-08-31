'use client';

import type React from 'react';
import Link from 'next/link';
import { CheckCircle2, PackageCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getCopy } from '@/i18n/copy';
import { localizedPath, type ActiveLocale } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';
import { useAppSelector } from '@/store/hooks';

interface OrderSuccessPageProps {
  orderCode: string;
  locale?: ActiveLocale;
}

export function OrderSuccessPage({ orderCode, locale = 'ka' }: OrderSuccessPageProps): React.ReactElement {
  const copy = getCopy(locale);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <main className="min-h-dvh bg-[#F5F7FA] px-4 py-10 text-[#07152A]">
      <section className="mx-auto grid min-h-[70dvh] max-w-[720px] place-items-center">
        <div className="w-full rounded-[8px] border border-[#DFE6EF] bg-white p-6 text-center shadow-[0_18px_50px_rgba(7,21,42,0.08)] sm:p-8">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#EAF8EF] text-[#2A9D4A]">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
            {copy.orderSuccess.title(orderCode)}
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-[#526071] sm:text-base">
            {copy.orderSuccess.text}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild className="h-11 rounded-[9px] bg-[#FF4057] px-6 font-black text-white hover:bg-[#F02F48]">
              <Link href={localizedPath(locale, ROUTES.PRODUCTS)}>{copy.orderSuccess.continueShopping}</Link>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" className="h-11 rounded-[7px] border-[#07152A] px-6 font-black">
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
  );
}
