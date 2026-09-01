'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MoveHorizontal } from 'lucide-react';

import { useLocale, useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { formatGel, formatStorefrontDate } from '../lib/format';
import { selectComparableProducts } from '../lib/product-comparison';
import type { StorefrontProduct } from '../types/storefront.types';

export function ProductComparisonLedger({
  currentProduct,
  alternatives,
}: {
  currentProduct: StorefrontProduct;
  alternatives: StorefrontProduct[];
}): React.ReactElement | null {
  const locale = useLocale();
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const uniqueAlternatives = selectComparableProducts(currentProduct, alternatives);
  const products = [currentProduct, ...uniqueAlternatives];

  if (products.length < 2) return null;

  const rows = [
    { label: copy.product.comparison.price, value: (product: StorefrontProduct) => formatGel(product.salePrice) },
    { label: copy.product.comparison.category, value: (product: StorefrontProduct) => product.category.name },
    { label: copy.product.comparison.summary, value: (product: StorefrontProduct) => product.description || product.category.name },
    { label: copy.product.comparison.checked, value: (product: StorefrontProduct) => formatStorefrontDate(product.updatedAt, locale) },
  ];

  return (
    <section
      data-pain-id="TN-BX-13"
      className="storefront-container mt-8"
      aria-labelledby="product-comparison-title"
    >
      <div className="mb-4 max-w-[760px]">
        <h2 id="product-comparison-title" className="text-xl font-black tracking-[-0.025em] text-[#11141B] sm:text-2xl">
          {copy.product.comparison.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#657080]">{copy.product.comparison.intro}</p>
        <p className="mt-2 flex items-center gap-2 text-xs font-bold text-[#657080] sm:hidden">
          <MoveHorizontal className="size-4" aria-hidden="true" />
          {copy.product.comparison.scrollHint}
        </p>
      </div>

      <div
        className="no-scrollbar overflow-x-auto rounded-[12px] border border-[#DDE3EA] bg-white"
        role="region"
        aria-label={copy.product.comparison.scrollAria}
        tabIndex={0}
      >
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#DDE3EA] bg-[#F8FAFC]">
              <th scope="col" className="w-[150px] px-4 py-4 font-black text-[#657080]">{copy.product.comparison.product}</th>
              {products.map((product, index) => (
                <th key={product.id} scope="col" className="px-4 py-4 align-top text-[#11141B]">
                  {index === 0 ? (
                    <span className="mb-2 inline-flex rounded-full bg-[#FFF0F3] px-2 py-1 text-[11px] font-black text-[#B4233A]">
                      {copy.product.comparison.current}
                    </span>
                  ) : null}
                  <span className="block text-sm font-black leading-5">{product.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[#E7EBF0] last:border-b-0">
                <th scope="row" className="px-4 py-4 align-top font-bold text-[#657080]">{row.label}</th>
                {products.map((product) => (
                  <td key={`${row.label}-${product.id}`} className="px-4 py-4 align-top font-semibold leading-5 text-[#303844]">
                    {row.value(product)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-[#FCFDFE]">
              <th scope="row" className="px-4 py-4 font-bold text-[#657080]">{copy.product.comparison.view}</th>
              {products.map((product) => (
                <td key={`link-${product.id}`} className="px-4 py-4">
                  <Link
                    href={localizeHref(ROUTES.PRODUCT_DETAIL(product.slug))}
                    className="inline-flex min-h-10 items-center gap-1.5 py-2 font-black text-[#D92F49] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F80]"
                  >
                    {copy.product.comparison.view}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
