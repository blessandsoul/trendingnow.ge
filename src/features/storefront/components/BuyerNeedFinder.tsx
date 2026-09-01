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
      <div className="overflow-hidden rounded-[14px] bg-[#11141B] text-white shadow-[0_16px_38px_rgba(17,20,27,0.14)]">
        <div className="grid gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.4fr)] lg:items-end lg:px-7 lg:py-7">
          <div className="max-w-[460px]">
            <h2 id="buyer-need-finder-title" className="text-xl font-black leading-tight tracking-[-0.025em] sm:text-2xl">
              {copy.products.needFinder.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#C8D0DA]">{copy.products.needFinder.intro}</p>
            <Link
              href={localizeHref(ROUTES.WARRANTY)}
              className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#FF9DA9] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9DA9]"
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
                className="group flex min-h-12 w-[220px] shrink-0 snap-start items-center justify-between gap-3 rounded-[10px] border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:border-white/30 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F80] lg:w-auto"
              >
                <span>{copy.products.needFinder.options[index]}</span>
                <ArrowUpRight className="size-4 shrink-0 text-[#FF7E8E] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
