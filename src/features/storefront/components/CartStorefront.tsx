'use client';

import type React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { useLocale, useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { publicMediaUrl } from '@/lib/utils/media';
import { NewsletterBand } from './NewsletterBand';
import { ProductCard } from './ProductCard';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { useCart, useStorefrontHome } from '../hooks/useStorefront';
import { formatGel } from '../lib/format';

const archiveCopy = {
  ka: {
    eyebrow: 'ძველი კალათის არქივი',
    notice: 'ეს გვერდი მხოლოდ წინა კალათის ჩანაწერს ინახავს. აქ ახალი შეკვეთა, ჩვენი მარაგი ან ჩვენი მიწოდების პირობა არ იქმნება.',
    subtotal: 'წინა კალათის ქვეჯამი',
    discount: 'წინა ფასდაკლება',
    historicalTotal: 'ისტორიული კალათის ჯამი',
    nextStep: 'ახალი ყიდვისთვის გახსენით კატალოგი ან დაგვიკავშირდით SKU-ით.',
    contact: 'კონტაქტი ჩანაწერზე',
  },
  en: {
    eyebrow: 'Legacy cart archive',
    notice: 'This page preserves an earlier cart record only. It does not create a new order or promise our stock or delivery.',
    subtotal: 'Historical cart subtotal',
    discount: 'Historical discount',
    historicalTotal: 'Historical cart total',
    nextStep: 'For a new purchase, browse the catalog or contact us with the SKU.',
    contact: 'Contact about this record',
  },
  ru: {
    eyebrow: 'Архив старой корзины',
    notice: 'Эта страница сохраняет только запись прежней корзины. Новый заказ здесь не создаётся, а наши наличие и доставка не обещаются.',
    subtotal: 'Историческая сумма корзины',
    discount: 'Историческая скидка',
    historicalTotal: 'Исторический итог корзины',
    nextStep: 'Для новой покупки откройте каталог или напишите нам с SKU.',
    contact: 'Связаться по записи',
  },
} as const;

export function CartStorefront(): React.ReactElement {
  const locale = useLocale();
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { data: cart, isLoading } = useCart();
  const { data: home } = useStorefrontHome();
  const archive = archiveCopy[locale];
  const historicalTotal = (cart?.summary.subtotal ?? 0) - (cart?.summary.discount ?? 0);

  return (
    <div className="tn-page min-h-dvh min-w-0 max-w-full text-[#101010]">
      <StorefrontHeader />

      <main className="storefront-container min-w-0 py-7">
        <p className="text-sm text-[#657080]">{copy.cart.breadcrumb}</p>
        <h1 className="tn-page-title mt-5">{archive.eyebrow}</h1>

        <div className="mt-6 min-w-0 border border-[#DDE3EA] bg-white px-4 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#092BB4]">{archive.eyebrow}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#596473]">{archive.notice}</p>
        </div>

        <section className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="tn-commerce-card min-w-0 overflow-hidden">
            <div className="hidden grid-cols-[1fr_120px_150px_110px] border-b border-[#E3E8EF] bg-[#F4F2ED] px-5 py-4 text-sm font-bold text-[#526071] lg:grid">
              <span>{copy.cart.columns.product}</span>
              <span>{copy.cart.columns.price}</span>
              <span>{copy.cart.columns.quantity}</span>
              <span className="text-right">{copy.cart.columns.total}</span>
            </div>

            {isLoading && <div className="h-[300px] animate-pulse bg-[#F4F2ED]" />}

            {!isLoading && cart?.items.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                <ShoppingBag className="mb-3 size-10 text-[#657080]" />
                <h2 className="text-lg font-semibold">{copy.cart.emptyTitle}</h2>
                <p className="mt-1 max-w-[420px] text-sm text-[#657080]">
                  {copy.cart.emptyText}
                </p>
                <Button asChild className="mt-5 rounded-none bg-[#092BB4] text-white hover:bg-[#061E81]">
                  <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.common.browseProducts}</Link>
                </Button>
              </div>
            )}

            {cart?.items.map((item) => (
              <div key={item.id} className="grid min-w-0 gap-4 border-b border-[#E3E8EF] px-4 py-4 last:border-b-0 sm:px-5 lg:grid-cols-[minmax(0,1fr)_120px_150px_110px] lg:items-center">
                <div className="flex min-w-0 gap-4">
                  <Link
                    href={localizeHref(ROUTES.PRODUCT_DETAIL(item.product.slug))}
                    className="relative size-[92px] shrink-0 overflow-hidden rounded-none bg-[#F4F2ED]"
                  >
                    <SafeImage src={publicMediaUrl(item.product.imageUrl)} alt={item.product.name} fill sizes="92px" className="object-contain p-2" />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={localizeHref(ROUTES.PRODUCT_DETAIL(item.product.slug))}
                      className="line-clamp-2 text-sm font-semibold text-[#101010] hover:text-[#061E81]"
                    >
                      <h2>{item.product.name}</h2>
                    </Link>
                    <p className="mt-1 text-xs text-[#657080]">{item.product.category.name}</p>
                  </div>
                </div>

                <div className="font-semibold tabular-nums">{formatGel(item.unitPrice)}</div>

                <div className="text-sm font-semibold tabular-nums">× {item.quantity}</div>

                <div className="text-left font-semibold tabular-nums lg:text-right">
                  <span className="font-semibold tabular-nums">{formatGel(item.lineTotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <aside className="min-w-0">
            <div className="tn-commerce-card min-w-0 p-5">
              <h2 className="tn-section-title">{archive.historicalTotal}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex min-w-0 justify-between gap-3"><span className="text-[#657080]">{archive.subtotal}</span><span className="shrink-0 tabular-nums">{formatGel(cart?.summary.subtotal ?? 0)}</span></div>
                <div className="flex min-w-0 justify-between gap-3 text-[#596473]"><span>{archive.discount}</span><span className="shrink-0 tabular-nums">- {formatGel(cart?.summary.discount ?? 0)}</span></div>
              </div>

              <div className="mt-5 flex min-w-0 items-end justify-between gap-3 border-t border-[#E3E8EF] pt-4">
                <span className="min-w-0 text-sm text-[#657080]">{archive.historicalTotal}</span>
                <strong className="shrink-0 text-3xl tabular-nums">{formatGel(historicalTotal)}</strong>
              </div>

              <p className="mt-3 bg-[#F3F6FF] px-3 py-2 text-xs font-semibold leading-5 text-[#061E81]">{archive.nextStep}</p>
              <div className="mt-4 grid min-w-0 gap-2">
                <Button asChild type="button" variant="outline" className="tn-secondary-action h-auto min-h-11 min-w-0 w-full py-3 whitespace-normal">
                  <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.cart.continueShopping}</Link>
                </Button>
                <Button asChild type="button" variant="outline" className="tn-secondary-action h-auto min-h-11 min-w-0 w-full py-3 whitespace-normal">
                  <Link href={localizeHref(ROUTES.CONTACT)}>{archive.contact}</Link>
                </Button>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 min-w-0">
          <h2 className="tn-section-title mb-4">{copy.cart.mayAlsoLike}</h2>
          <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-5">
            {(home?.featuredProducts ?? []).slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <NewsletterBand />
      <StorefrontFooter />
    </div>
  );
}
