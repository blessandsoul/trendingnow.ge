'use client';

import type React from 'react';
import Link from 'next/link';
import { BadgeDollarSign, RotateCcw, ShoppingBag, Truck, type LucideIcon } from 'lucide-react';

import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

const icons: LucideIcon[] = [ShoppingBag, BadgeDollarSign, Truck, RotateCcw];
const hrefs = [ROUTES.PRODUCTS, ROUTES.FAQ, ROUTES.DELIVERY, ROUTES.WARRANTY];

export function BuyerConfidenceRail({
  className,
  contained = true,
  tone = 'dark',
  mobileLayout = 'scroll',
}: {
  className?: string;
  contained?: boolean;
  tone?: 'dark' | 'light';
  mobileLayout?: 'scroll' | 'stack';
}): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const isDark = tone === 'dark';

  return (
    <section
      className={cn(
        contained && 'storefront-container',
        className,
      )}
      aria-labelledby="buyer-confidence-title"
    >
      <div
        className={cn(
          'overflow-hidden border border-white/20 px-4 py-5 shadow-[0_14px_34px_rgba(17,20,27,0.08)] sm:px-6 sm:py-6 lg:px-8',
          isDark
            ? 'bg-[#101010] text-white'
            : 'border border-[#DDE3EA] bg-white text-[#101010]',
        )}
      >
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2.2fr)] lg:items-start lg:gap-8">
          <div>
            <p className={cn('text-xs font-semibold tracking-[0.08em]', isDark ? 'text-[#FFE622]' : 'text-[#092BB4]')}>
              {copy.buyerConfidence.eyebrow}
            </p>
            <h2 id="buyer-confidence-title" className="mt-2 max-w-[420px] text-balance text-xl font-semibold leading-tight tracking-[-0.03em] sm:text-2xl">
              {copy.buyerConfidence.title}
            </h2>
          </div>

          <ol
            className={cn(
              'gap-2 min-[700px]:mx-0 min-[700px]:grid min-[700px]:grid-cols-2 min-[700px]:overflow-visible min-[700px]:px-0 min-[700px]:pb-0 xl:grid-cols-4',
              mobileLayout === 'scroll'
                ? 'no-scrollbar -mx-1 flex snap-x snap-mandatory overflow-x-auto px-1 pb-1'
                : 'grid grid-cols-1',
            )}
          >
            {copy.buyerConfidence.items.map((item, index) => {
              const Icon = icons[index] ?? ShoppingBag;

              return (
                <li
                  key={item.title}
                  className={cn(
                    'group relative min-w-0 p-3.5 transition-[transform,background-color] duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transition-none min-[700px]:w-auto min-[700px]:max-w-none',
                    mobileLayout === 'scroll' && 'w-[78vw] max-w-[290px] shrink-0 snap-start',
                    isDark ? 'bg-white/[0.065] hover:bg-white/[0.09]' : 'bg-[#F4F2ED] hover:bg-[#EEF1F5]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums',
                        isDark ? 'bg-[#092BB4] text-white' : 'bg-[#101010] text-white',
                      )}
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('size-4 shrink-0', isDark ? 'text-[#FFE622]' : 'text-[#092BB4]')} aria-hidden="true" />
                        <h3 className="text-sm font-semibold leading-5">{item.title}</h3>
                      </div>
                      <p className={cn('mt-1.5 text-xs leading-5', isDark ? 'text-white/75' : 'text-[#657080]')}>{item.text}</p>
                      <Link
                        href={localizeHref(hrefs[index] ?? ROUTES.FAQ)}
                        className={cn(
                          'mt-2 inline-flex min-h-10 items-center rounded-md text-xs font-semibold underline decoration-transparent underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/60',
                          isDark ? 'text-white hover:text-[#FFE622] hover:decoration-current' : 'text-[#101010] hover:text-[#092BB4] hover:decoration-current',
                        )}
                      >
                        {copy.buyerConfidence.detailsLabel}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
