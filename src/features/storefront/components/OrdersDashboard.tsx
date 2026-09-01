'use client';

import type React from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { publicMediaUrl } from '@/lib/utils/media';
import { useAppSelector } from '@/store/hooks';
import type { StorefrontOrderStatus } from '../types/storefront.types';
import { formatGel } from '../lib/format';
import { useOrders } from '../hooks/useStorefront';
import { DashboardTabs } from './DashboardTabs';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';

const statusBadgeClasses: Record<StorefrontOrderStatus, string> = {
  PENDING: 'border-[#DCCEFF] bg-[#F7F2FF] text-[#5B2DB6]',
  ACCEPTED: 'border-[#CFE3FF] bg-[#F0F7FF] text-[#174A98]',
  SENT_FOR_DELIVERY: 'border-[#C9F0E7] bg-[#EAFBF7] text-[#08745F]',
  DELIVERED: 'border-[#BFE7CA] bg-[#EAF8EF] text-[#2A7F42]',
};

export function OrdersDashboard(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { isInitializing } = useAppSelector((state) => state.auth);
  const ordersQuery = useOrders({ page: 1, limit: 24 });
  const orders = ordersQuery.data?.items ?? [];
  const count = ordersQuery.data?.pagination.totalItems ?? 0;
  const isLoading = isInitializing || ordersQuery.isLoading;

  return (
    <div className="tn-page min-h-dvh text-[#11141B]">
      <StorefrontHeader />

      <main>
        <section className="storefront-container py-6 sm:py-8 lg:py-10">
          <DashboardTabs active="orders" className="mb-5" />

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight text-[#11141B] sm:text-4xl">
                {copy.dashboard.orders.title}
              </h1>
              <p className="mt-2 max-w-[680px] text-sm leading-6 text-[#526071] sm:text-base">
                {copy.dashboard.orders.intro}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 min-[430px]:flex-row sm:w-auto sm:items-center">
              {!isLoading && !ordersQuery.error && (
                <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#E8E0F8] bg-white px-4 py-2 text-sm font-black leading-5 text-[#526071] min-[430px]:justify-start">
                  {copy.dashboard.orders.count(count)}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                className="tn-secondary-action h-10 w-full px-4 min-[430px]:w-auto"
                disabled={ordersQuery.isFetching}
                onClick={() => void ordersQuery.refetch()}
              >
                {ordersQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {copy.dashboard.orders.refresh}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[18px] border border-[#E8E0F8] bg-white" />
              ))}
            </div>
          )}

          {!isLoading && ordersQuery.error && (
            <div className="tn-surface rounded-[18px] border-[#F2D6D6] p-6 text-[#7A1E1E]">
              <AlertCircle className="size-6" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black">{copy.dashboard.orders.errorTitle}</h2>
              <p className="mt-2 text-sm leading-6">{copy.dashboard.orders.errorText}</p>
            </div>
          )}

          {!isLoading && !ordersQuery.error && orders.length === 0 && (
            <div className="tn-surface rounded-[22px] p-8 text-center">
              <span className="tn-soft-icon mx-auto grid size-14 place-items-center">
                <ShoppingBag className="size-7" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-black text-[#11141B]">{copy.dashboard.orders.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-[420px] text-sm leading-6 text-[#657080]">
                {copy.dashboard.orders.emptyText}
              </p>
              <Button asChild className="mt-5 h-11 rounded-[9px] bg-[#D92F49] px-6 font-black text-white hover:bg-[#B4233A]">
                <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.dashboard.orders.continueShopping}</Link>
              </Button>
            </div>
          )}

          {!isLoading && !ordersQuery.error && orders.length > 0 && (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article key={order.id} className="tn-surface rounded-[20px] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 border-b border-[#E3E8EF] pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8B96A5]">{copy.dashboard.orders.orderCode}</p>
                      <h2 className="mt-1 text-xl font-black text-[#07152A]">{order.publicCode}</h2>
                      <p className="mt-1 text-xs font-semibold text-[#657080]">{new Date(order.createdAt).toLocaleString('ka-GE')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge className={statusBadgeClasses[order.status]}>
                        {copy.dashboard.orders.statusLabels[order.status]}
                      </Badge>
                      <span className="text-xl font-black tabular-nums">{formatGel(order.summary.total)}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3">
                        <span className="relative block aspect-square overflow-hidden rounded-[7px] bg-[#F8FAFC]">
                          <SafeImage src={publicMediaUrl(item.productImageUrl)} alt="" fill sizes="56px" className="object-contain p-1.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">{item.productName}</span>
                          <span className="block text-xs text-[#657080]">x {item.quantity}</span>
                        </span>
                        <span className="text-sm font-black tabular-nums">{formatGel(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
