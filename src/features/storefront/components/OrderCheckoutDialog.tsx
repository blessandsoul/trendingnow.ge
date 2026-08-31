'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShoppingBag, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { formatGel } from '../lib/format';
import { useCart, useCreateOrder } from '../hooks/useStorefront';
import {
  storefrontDeliveryPrices,
  type CreateStorefrontOrderRequest,
  type DeliveryZone,
} from '../types/storefront.types';

interface OrderCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryZone?: DeliveryZone | null;
}

type CheckoutDraft = Omit<CreateStorefrontOrderRequest, 'deliveryZone'>;

const emptyDraft: CheckoutDraft = {
  firstName: '',
  lastName: '',
  phone: '',
  deliveryAddress: '',
};

export function OrderCheckoutDialog({
  open,
  onOpenChange,
  deliveryZone = null,
}: OrderCheckoutDialogProps): React.ReactElement | null {
  const copy = useLocaleCopy();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localizeHref = useLocalizedPath();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const [draft, setDraft] = useState<CheckoutDraft>(emptyDraft);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showDeliveryError, setShowDeliveryError] = useState(false);
  const items = cart?.items ?? [];
  const hasItems = items.length > 0;
  const deliveryPrice = deliveryZone ? storefrontDeliveryPrices[deliveryZone] : 0;
  const total = (cart?.summary.subtotal ?? 0) - (cart?.summary.discount ?? 0) + deliveryPrice;

  const registerHref = useMemo(() => {
    const query = searchParams.toString();
    const fromPath = `${pathname || ROUTES.CART}${query ? `?${query}` : ''}`;
    return `${localizeHref(ROUTES.REGISTER)}?from=${encodeURIComponent(fromPath)}`;
  }, [localizeHref, pathname, searchParams]);

  if (!open) return null;

  const updateField = (field: keyof CheckoutDraft, value: string): void => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const submitOrder = (): void => {
    if (!hasItems || createOrder.isPending) return;
    if (!deliveryZone) {
      setShowDeliveryError(true);
      return;
    }

    createOrder.mutate({ ...draft, deliveryZone }, {
      onSuccess: ({ order }) => {
        setDraft(emptyDraft);
        setShowGuestPrompt(false);
        setShowDeliveryError(false);
        onOpenChange(false);
        router.push(localizeHref(ROUTES.ORDER_SUCCESS(order.publicCode)));
      },
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!hasItems || createOrder.isPending) return;
    if (!deliveryZone) {
      setShowDeliveryError(true);
      return;
    }
    if (!isAuthenticated && !showGuestPrompt) {
      setShowGuestPrompt(true);
      return;
    }
    submitOrder();
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#07152A]/55 px-3 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-dialog-title"
        className="max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-[8px] border border-[#DFE6EF] bg-white shadow-[0_24px_70px_rgba(7,21,42,0.26)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E3E8EF] px-5 py-4">
          <div className="min-w-0">
            <h2 id="checkout-dialog-title" className="text-xl font-black text-[#07152A]">
              {copy.checkout.title}
            </h2>
            <p className="mt-1 text-sm leading-5 text-[#526071]">{copy.checkout.description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-full"
            onClick={() => onOpenChange(false)}
            aria-label={copy.common.closeMenu}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          {showDeliveryError && !deliveryZone && (
            <p role="alert" className="rounded-[7px] border border-[#F2D0D0] bg-[#FFF5F5] px-3 py-2 text-sm text-[#A23A3A]">
              {copy.checkout.deliveryZoneRequired}
            </p>
          )}
          <div className="rounded-[8px] border border-[#E3E8EF] bg-[#F8FAFC] p-4">
            {isLoading && <div className="h-16 animate-pulse rounded-[6px] bg-white" />}
            {!isLoading && !hasItems && (
              <div className="text-center">
                <ShoppingBag className="mx-auto size-8 text-[#8B96A5]" />
                <p className="mt-2 text-sm font-bold text-[#07152A]">{copy.checkout.emptyCart}</p>
              </div>
            )}
            {!isLoading && hasItems && (
              <div className="space-y-2">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-bold text-[#07152A]">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="shrink-0 font-black tabular-nums text-[#07152A]">{formatGel(item.lineTotal)}</span>
                  </div>
                ))}
                {items.length > 3 && <p className="text-xs font-semibold text-[#6B7685]">{copy.checkout.moreItems(items.length - 3)}</p>}
                <div className="flex items-center justify-between border-t border-dashed border-[#CFD8E4] pt-3 text-sm">
                  <span className="font-bold text-[#526071]">{copy.cart.grandTotal}</span>
                  <span className="text-xl font-black tabular-nums text-[#07152A]">{formatGel(total)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-[#07152A]">{copy.checkout.firstName}</span>
              <Input
                required
                value={draft.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-[#07152A]">{copy.checkout.lastName}</span>
              <Input
                required
                value={draft.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-[#07152A]">{copy.checkout.phone}</span>
            <Input
              required
              minLength={5}
              value={draft.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              autoComplete="tel"
              inputMode="tel"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-[#07152A]">{copy.checkout.deliveryAddress}</span>
            <textarea
              required
              minLength={5}
              value={draft.deliveryAddress}
              onChange={(event) => updateField('deliveryAddress', event.target.value)}
              autoComplete="street-address"
              rows={3}
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </label>

          {showGuestPrompt && (
            <div className="rounded-[8px] border border-[#FFE8AA] bg-[#FFF9E6] p-4">
              <h3 className="text-base font-black text-[#07152A]">{copy.checkout.guestTitle}</h3>
              <p className="mt-1 text-sm leading-5 text-[#526071]">{copy.checkout.guestText}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[7px] border-[#07152A]"
                  onClick={() => router.push(registerHref)}
                >
                  {copy.checkout.loginToTrack}
                </Button>
                <Button
                  type="button"
                  className="rounded-[9px] bg-[#FF4057] font-black text-white hover:bg-[#F02F48]"
                  disabled={!deliveryZone || createOrder.isPending}
                  onClick={submitOrder}
                >
                  {createOrder.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {copy.checkout.continueAsGuest}
                </Button>
              </div>
            </div>
          )}

          {!showGuestPrompt && (
            <Button
              type="submit"
              className="h-11 rounded-[9px] bg-[#FF4057] font-black text-white hover:bg-[#F02F48]"
              disabled={!hasItems || !deliveryZone || createOrder.isPending}
            >
              {createOrder.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {createOrder.isPending ? copy.checkout.submitting : copy.checkout.submit}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
