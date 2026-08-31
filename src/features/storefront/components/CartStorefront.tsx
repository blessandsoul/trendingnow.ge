'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, ShoppingBag, Trash2, Truck, WalletCards } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { publicMediaUrl } from '@/lib/utils/media';
import { NewsletterBand } from './NewsletterBand';
import { OrderCheckoutDialog } from './OrderCheckoutDialog';
import { ProductCard } from './ProductCard';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useStorefrontHome,
  useUpdateCartItem,
} from '../hooks/useStorefront';
import { formatGel } from '../lib/format';
import { storefrontDeliveryPrices, type DeliveryZone } from '../types/storefront.types';

export function CartStorefront(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const { data: cart, isLoading } = useCart();
  const { data: home } = useStorefrontHome();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const deliveryPrice = deliveryZone ? storefrontDeliveryPrices[deliveryZone] : 0;
  const grandTotal = (cart?.summary.subtotal ?? 0) - (cart?.summary.discount ?? 0) + deliveryPrice;
  const trustItems = [
    { icon: ShieldCheck, ...copy.cart.trustItems[0] },
    { icon: Truck, ...copy.cart.trustItems[1] },
    { icon: ShoppingBag, ...copy.cart.trustItems[2] },
    { icon: WalletCards, ...copy.cart.trustItems[3] },
  ];

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#11141B]">
      <StorefrontHeader />

      <main className="storefront-container py-7">
        <p className="text-sm text-[#6B7685]">{copy.cart.breadcrumb}</p>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">{copy.cart.title}</h1>

        <section className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-[8px] border border-[#DFE6EF] bg-white">
            <div className="hidden grid-cols-[1fr_120px_150px_110px] border-b border-[#E3E8EF] bg-[#F8FAFC] px-5 py-4 text-sm font-bold text-[#526071] lg:grid">
              <span>{copy.cart.columns.product}</span>
              <span>{copy.cart.columns.price}</span>
              <span>{copy.cart.columns.quantity}</span>
              <span className="text-right">{copy.cart.columns.total}</span>
            </div>

            {isLoading && <div className="h-[300px] animate-pulse bg-[#F8FAFC]" />}

            {!isLoading && cart?.items.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                <ShoppingBag className="mb-3 size-10 text-[#8B96A5]" />
                <h2 className="text-lg font-bold">{copy.cart.emptyTitle}</h2>
                <p className="mt-1 max-w-[420px] text-sm text-[#6B7685]">
                  {copy.cart.emptyText}
                </p>
                <Button asChild className="mt-5 rounded-[9px] bg-[#FF4057] text-white hover:bg-[#F02F48]">
                  <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.common.browseProducts}</Link>
                </Button>
              </div>
            )}

            {cart?.items.map((item) => (
              <div key={item.id} className="grid gap-4 border-b border-[#E3E8EF] px-4 py-4 last:border-b-0 sm:px-5 lg:grid-cols-[1fr_120px_150px_110px] lg:items-center">
                <div className="flex min-w-0 gap-4">
                  <Link
                    href={localizeHref(ROUTES.PRODUCT_DETAIL(item.product.slug))}
                    className="relative size-[92px] shrink-0 overflow-hidden rounded-[8px] bg-[#F8FAFC]"
                  >
                    <SafeImage src={publicMediaUrl(item.product.imageUrl)} alt={item.product.name} fill sizes="92px" className="object-contain p-2" />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={localizeHref(ROUTES.PRODUCT_DETAIL(item.product.slug))}
                      className="line-clamp-2 text-sm font-bold text-[#11141B] hover:text-[#FF4057]"
                    >
                      <h2>{item.product.name}</h2>
                    </Link>
                    <p className="mt-1 text-xs text-[#6B7685]">{item.product.category.name}</p>
                    <p className="mt-2 text-xs font-semibold text-[#2A9D4A]">{copy.cart.deliveryEstimate}</p>
                  </div>
                </div>

                <div className="font-bold tabular-nums">{formatGel(item.unitPrice)}</div>

                <div className="flex w-fit items-center rounded-[7px] border border-[#DFE6EF]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={item.quantity <= 1 || updateCartItem.isPending}
                    onClick={() => updateCartItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                  >
                    -
                  </Button>
                  <span className="w-9 text-center text-sm font-bold">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={updateCartItem.isPending}
                    onClick={() => updateCartItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  >
                    +
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <span className="font-extrabold tabular-nums">{formatGel(item.lineTotal)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-[#8B96A5] hover:text-[#B42318]"
                    onClick={() => removeCartItem.mutate(item.id)}
                    aria-label={copy.cart.removeItemAria}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            {cart && cart.items.length > 0 && (
              <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:justify-between sm:px-5">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[7px] border-[#DFE6EF]"
                  onClick={() => clearCart.mutate(undefined)}
                >
                  <Trash2 className="size-4" />
                  {copy.cart.clear}
                </Button>
                <Button type="button" variant="ghost" className="text-[#1D5FD3]">
                  {copy.cart.refresh} <RotateCcw className="size-4" />
                </Button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[8px] border border-[#DFE6EF] bg-white p-5 shadow-[0_8px_24px_rgba(8,21,42,0.05)]">
              <h2 className="text-xl font-extrabold">{copy.cart.summaryTitle}</h2>
              <fieldset className="mt-4" aria-describedby="delivery-zone-hint" aria-required="true">
                <legend className="text-sm font-bold text-[#07152A]">
                  {copy.cart.deliveryZoneTitle} <span aria-hidden="true">*</span>
                </legend>
                <p id="delivery-zone-hint" className="mt-1 text-xs leading-5 text-[#6B7685]">
                  {copy.cart.deliveryZoneHint}
                </p>
                <div className="mt-3 grid gap-2">
                  {(Object.keys(storefrontDeliveryPrices) as DeliveryZone[]).map((zone) => {
                    const isSelected = deliveryZone === zone;

                    return (
                      <label
                        key={zone}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-[7px] border px-3 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? 'border-[#8C5CF6] bg-[#F7F2FF]'
                            : 'border-[#DFE6EF] hover:border-[#B9C4D2]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 font-bold text-[#07152A]">
                          <input
                            type="radio"
                            name="delivery-zone"
                            value={zone}
                            checked={isSelected}
                            onChange={() => setDeliveryZone(zone)}
                            className="size-4 accent-[#07152A]"
                          />
                          {copy.cart.deliveryZones[zone]}
                        </span>
                        <span className="font-black tabular-nums">{formatGel(storefrontDeliveryPrices[zone])}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-[#6B7685]">{copy.cart.subtotal}</span><span>{formatGel(cart?.summary.subtotal ?? 0)}</span></div>
                <div className="flex justify-between gap-3 text-[#2A9D4A]"><span>{copy.cart.discount}</span><span>- {formatGel(cart?.summary.discount ?? 0)}</span></div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#6B7685]">{copy.cart.shipping}</span>
                  {deliveryZone ? (
                    <span>+ {formatGel(deliveryPrice)}</span>
                  ) : (
                    <span className="font-semibold text-[#8B96A5]">{copy.cart.deliveryZoneRequired}</span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#E3E8EF] pt-4">
                <span className="text-sm text-[#6B7685]">{copy.cart.grandTotal}</span>
                <strong className="text-3xl tabular-nums">{formatGel(grandTotal)}</strong>
              </div>

              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-[9px] bg-[#FF4057] font-black text-white hover:bg-[#F02F48]"
                disabled={!cart || cart.items.length === 0 || !deliveryZone}
                onClick={() => setIsCheckoutOpen(true)}
              >
                {copy.cart.checkout}
              </Button>
              <Button asChild type="button" variant="outline" className="mt-2 h-10 w-full rounded-[7px] border-[#07152A]">
                <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.cart.continueShopping}</Link>
              </Button>
            </div>

            <div className="rounded-[8px] border border-[#DFE6EF] bg-white p-5">
              <div className="space-y-4">
                {trustItems.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-3">
                    <Icon className="size-6 shrink-0 text-[#07152A]" />
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="text-xs text-[#6B7685]">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-extrabold">{copy.cart.mayAlsoLike}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-5">
            {(home?.featuredProducts ?? []).slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <NewsletterBand />
      <StorefrontFooter />
      <OrderCheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        deliveryZone={deliveryZone}
      />
    </div>
  );
}
