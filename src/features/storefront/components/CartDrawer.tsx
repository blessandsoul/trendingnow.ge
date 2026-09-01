'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../hooks/useStorefront';
import { formatGel } from '../lib/format';

interface CartDrawerTriggerState {
  itemCount: number;
  total: number;
}

interface CartDrawerProps {
  renderTrigger?: (state: CartDrawerTriggerState) => React.ReactElement;
}

function CartDrawerSkeleton(): React.ReactElement {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3 rounded-[8px] border border-[#E3E8EF] p-3">
          <div className="size-20 animate-pulse rounded-[8px] bg-[#EEF2F6]" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#EEF2F6]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEF2F6]" />
            <div className="h-8 w-28 animate-pulse rounded bg-[#EEF2F6]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartDrawer({ renderTrigger }: CartDrawerProps = {}): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { data: cart, isLoading, error } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const itemCount = cart?.summary.itemCount ?? 0;
  const total = cart?.summary.total ?? 0;
  const trigger = renderTrigger ? (
    renderTrigger({ itemCount, total })
  ) : (
    <Button type="button" variant="ghost" className="relative h-11 shrink-0 gap-2 px-2 text-[#11141B] sm:min-w-20">
      <span className="relative">
        <ShoppingCart className="size-6" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#D92F49] text-[11px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </span>
      <span className="hidden text-left text-xs font-semibold sm:block">
        {copy.cart.title}
        <span className="block text-[12px] text-[#11141B]">{formatGel(total)}</span>
      </span>
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>

      <SheetContent side="right" className="w-full bg-white p-0 text-[#11141B] sm:max-w-[460px]">
        <SheetHeader className="border-b border-[#E3E8EF] px-5 py-5 pr-12">
          <SheetTitle className="flex items-center gap-2 text-xl font-black">
            <ShoppingBag className="size-5" />
            {copy.cart.title}
          </SheetTitle>
          <SheetDescription>
            {copy.cart.drawerDescription(itemCount)}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {isLoading && <CartDrawerSkeleton />}

          {!isLoading && error && (
            <div className="rounded-[8px] border border-[#F2D0D0] bg-[#FFF5F5] px-4 py-3 text-sm text-[#A23A3A]">
              {copy.home.loadingError}
            </div>
          )}

          {!isLoading && !error && cart?.items.length === 0 && (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-[#F7F9FB] text-[#8B96A5]">
                <ShoppingBag className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black">{copy.cart.emptyTitle}</h3>
              <p className="mt-2 max-w-[300px] text-sm leading-6 text-[#657080]">
                {copy.cart.drawerEmptyText}
              </p>
              <SheetClose asChild>
                <Link
                  href={localizeHref(ROUTES.PRODUCTS)}
                  className={cn(
                    buttonVariants({ variant: 'default' }),
                    'mt-5 h-10 rounded-[9px] bg-[#D92F49] px-5 font-bold text-white hover:bg-[#B4233A]',
                  )}
                >
                  {copy.common.browseProducts}
                </Link>
              </SheetClose>
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <article key={item.id} className="rounded-[8px] border border-[#DFE6EF] bg-white p-3">
                  <div className="flex min-w-0 gap-3">
                    <Link
                      href={localizeHref(ROUTES.PRODUCT_DETAIL(item.product.slug))}
                      className="relative size-20 shrink-0 overflow-hidden rounded-[8px] bg-[#F8FAFC]"
                    >
                      <SafeImage
                        src={publicMediaUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={localizeHref(ROUTES.PRODUCT_DETAIL(item.product.slug))}
                        className="line-clamp-2 text-sm font-extrabold leading-5 text-[#11141B] hover:text-[#B4233A]"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 truncate text-xs text-[#657080]">{item.product.category.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black tabular-nums">{formatGel(item.unitPrice)}</span>
                        <span className="text-xs text-[#8B96A5]">{copy.cart.drawerLineTotal(formatGel(item.lineTotal))}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-[#8B96A5] hover:text-[#B42318]"
                      disabled={removeCartItem.isPending}
                      onClick={() => removeCartItem.mutate(item.id)}
                      aria-label={copy.cart.removeItemAria}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-[7px] border border-[#DFE6EF]">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={item.quantity <= 1 || updateCartItem.isPending}
                        onClick={() => updateCartItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                        aria-label={copy.product.decreaseQuantityAria}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-9 text-center text-sm font-black tabular-nums">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={item.quantity >= 99 || updateCartItem.isPending}
                        onClick={() => updateCartItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        aria-label={copy.product.increaseQuantityAria}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-[#E3E8EF] bg-white px-4 py-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-[#657080]">{copy.cart.products}</span>
              <span className="font-semibold tabular-nums">{formatGel(cart?.summary.subtotal ?? 0)}</span>
            </div>
            {(cart?.summary.discount ?? 0) > 0 && (
              <div className="flex justify-between gap-3 text-[#2A9D4A]">
                <span>{copy.cart.discount}</span>
                <span className="font-semibold tabular-nums">- {formatGel(cart?.summary.discount ?? 0)}</span>
              </div>
            )}
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-dashed border-[#CFD8E4] pt-3">
            <span className="text-sm text-[#657080]">{copy.cart.totalShort}</span>
            <strong className="text-2xl font-black tabular-nums">{formatGel(total)}</strong>
          </div>

          <SheetClose asChild>
            <Link
              href={localizeHref(ROUTES.CART)}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'h-11 rounded-[9px] bg-[#D92F49] text-base font-black text-white hover:bg-[#B4233A]',
              )}
            >
              {copy.cart.viewCart}
              <ArrowRight className="size-4" />
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href={localizeHref(ROUTES.PRODUCTS)}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-10 rounded-[7px] border-[#DFE6EF] font-bold',
              )}
            >
              {copy.cart.continueShopping}
            </Link>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
