'use client';

import type React from 'react';
import Link from 'next/link';
import { AlertCircle, Heart, Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { ProductCard } from './ProductCard';
import { DashboardTabs } from './DashboardTabs';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { useFavorites } from '../hooks/useStorefront';

function FavoritesSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-[328px] animate-pulse rounded-[8px] border border-[#DFE6EF] bg-white shadow-[0_8px_24px_rgba(8,21,42,0.04)]"
        />
      ))}
    </div>
  );
}

export function FavoritesDashboard(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { isInitializing } = useAppSelector((state) => state.auth);
  const favorites = useFavorites({ page: 1, limit: 48 });
  const products = favorites.data?.items ?? [];
  const productCount = favorites.data?.pagination.totalItems ?? 0;
  const isLoading = isInitializing || favorites.isLoading;

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#11141B]">
      <StorefrontHeader />

      <main className="bg-[#F5F7FA]">
        <section className="storefront-container py-6 sm:py-8 lg:py-10">
          <DashboardTabs active="favorites" className="mb-5" />

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight text-[#07152A] sm:text-4xl">
                {copy.dashboard.favorites.title}
              </h1>
              <p className="mt-2 max-w-[680px] text-sm leading-6 text-[#526071] sm:text-base">
                {copy.dashboard.favorites.intro}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 min-[430px]:flex-row sm:w-auto sm:items-center">
              {!isLoading && !favorites.error && (
                <span className="inline-flex min-h-10 items-center justify-center rounded-[7px] border border-[#DFE6EF] bg-white px-3 py-2 text-sm font-black leading-5 text-[#526071] min-[430px]:justify-start">
                  {copy.dashboard.favorites.count(productCount)}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-[7px] border-[#DFE6EF] bg-white px-3 font-black text-[#07152A] hover:bg-[#F7F9FB] min-[430px]:w-auto"
                disabled={favorites.isFetching}
                onClick={() => void favorites.refetch()}
              >
                {favorites.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {copy.dashboard.favorites.refresh}
              </Button>
            </div>
          </div>

          {isLoading && <FavoritesSkeleton />}

          {!isLoading && favorites.error && (
            <div className="rounded-[8px] border border-[#F2D6D6] bg-white p-6 text-[#7A1E1E]">
              <AlertCircle className="size-6" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black">{copy.dashboard.favorites.errorTitle}</h2>
              <p className="mt-2 text-sm leading-6">{copy.dashboard.favorites.errorText}</p>
            </div>
          )}

          {!isLoading && !favorites.error && products.length === 0 && (
            <div className="rounded-[8px] border border-[#DFE6EF] bg-white p-8 text-center shadow-[0_8px_24px_rgba(8,21,42,0.04)]">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#FFF7D7] text-[#07152A]">
                <Heart className="size-7" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-black text-[#07152A]">{copy.dashboard.favorites.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-[420px] text-sm leading-6 text-[#6B7685]">
                {copy.dashboard.favorites.emptyText}
              </p>
              <Button asChild className="mt-5 h-11 rounded-[9px] bg-[#FF4057] px-6 font-black text-white hover:bg-[#F02F48]">
                <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.dashboard.favorites.continueShopping}</Link>
              </Button>
            </div>
          )}

          {!isLoading && !favorites.error && products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
