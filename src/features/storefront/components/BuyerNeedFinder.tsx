'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Gift } from 'lucide-react';

import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';

const needLinks = [
  `${ROUTES.PRODUCTS}?category=care`,
  `${ROUTES.PRODUCTS}?category=automotive`,
  `${ROUTES.PRODUCTS}?category=fashion`,
  `${ROUTES.PRODUCTS}?category=technology`,
  `${ROUTES.PRODUCTS}?category=sport`,
  `${ROUTES.PRODUCTS}?maxPrice=30&sort=price-asc`,
  `${ROUTES.PRODUCTS}?maxPrice=60&sort=price-asc`,
] as const;

export function BuyerNeedFinder(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  return (
    <section
      data-pain-id="TN-BX-18 TN-BX-19"
      className="storefront-container mb-7"
      aria-labelledby="buyer-need-finder-title"
    >
      <div className="overflow-hidden border border-[#101010] bg-[#092BB4] text-white shadow-[0_16px_38px_rgba(9,43,180,0.2)]">
        <div className="grid gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.4fr)] lg:items-end lg:px-7 lg:py-7">
          <div className="max-w-[460px]">
            <h2 id="buyer-need-finder-title" className="text-xl font-semibold leading-tight tracking-[-0.025em] sm:text-2xl">
              {copy.products.needFinder.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80">{copy.products.needFinder.intro}</p>
            <Link
              href={localizeHref(ROUTES.WARRANTY)}
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#FFE622] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE622]"
            >
              <Gift className="size-4" aria-hidden="true" />
              {copy.products.needFinder.giftTerms}
            </Link>
          </div>

          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-3">
            {needLinks.map((href, index) => (
              <Link
                key={href}
                href={localizeHref(href)}
                className="group flex min-h-12 w-[220px] shrink-0 snap-start items-center justify-between gap-3 border border-[#101010]/20 bg-[#FFE622] px-4 py-3 text-sm font-bold text-[#101010] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:w-auto"
              >
                <span>{copy.products.needFinder.options[index]}</span>
                <ArrowUpRight className="size-4 shrink-0 text-[#092BB4] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
