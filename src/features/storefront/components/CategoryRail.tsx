'use client';

import type React from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { publicMediaUrl } from '@/lib/utils/media';
import { toStorefrontUppercase } from '../lib/format';
import type { StorefrontCategory } from '../types/storefront.types';
import { resolveCategoryImageUrl } from './category-image';

export function CategoryRail({ categories }: { categories: StorefrontCategory[] }): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  return (
    <section className="storefront-container mt-5">
      <div className="no-scrollbar grid auto-cols-[minmax(206px,72vw)] grid-flow-col snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-7">
        {categories.slice(0, 6).map((category) => {
          const displayName = toStorefrontUppercase(category.name);
          const imageUrl = resolveCategoryImageUrl(category);

          return (
            <Link
              key={category.slug}
              href={localizeHref(`${ROUTES.PRODUCTS}?category=${category.slug}`)}
              className="group snap-start overflow-hidden rounded-[16px] border border-[#DDE2E9] bg-white p-2 shadow-[0_8px_24px_rgba(17,20,27,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-[#C8CFD9] hover:shadow-[0_18px_34px_rgba(17,20,27,0.1)] active:translate-y-px motion-reduce:transition-none"
            >
              {imageUrl && (
                <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[11px] bg-[#EEF1F5]">
                  <SafeImage
                    src={publicMediaUrl(imageUrl)}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 14vw, (min-width: 640px) 30vw, 72vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
                  />
                </span>
              )}
              <span className="block min-w-0 px-1.5 pb-1 pt-3 text-[#11141B]">
                <span className="block break-words text-[15px] font-black leading-[1.18] tracking-[-0.025em] sm:text-base">{displayName}</span>
                <span className="mt-1.5 block whitespace-nowrap text-[11px] font-semibold text-[#69717E] sm:text-xs">
                  {copy.categoryRail.productCount(category.productCount)}
                </span>
              </span>
            </Link>
          );
        })}

        <Link
          href={localizeHref(ROUTES.PRODUCTS)}
          className="group relative min-h-[190px] snap-start overflow-hidden rounded-[16px] bg-[#11141B] p-5 text-white shadow-[0_8px_24px_rgba(17,20,27,0.08)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(17,20,27,0.18)] active:translate-y-px motion-reduce:transition-none"
        >
          <span className="absolute -right-8 -top-10 h-40 w-16 rotate-[24deg] bg-[#FF4057]" aria-hidden="true" />
          <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#11141B]">
            <MoreHorizontal className="size-5" strokeWidth={2.25} />
          </span>
          <span className="relative mt-10 block min-w-0 break-words text-[16px] font-black leading-[1.22] tracking-[-0.025em]">
            {toStorefrontUppercase(copy.categoryRail.allCategories)}
          </span>
        </Link>
      </div>
    </section>
  );
}
