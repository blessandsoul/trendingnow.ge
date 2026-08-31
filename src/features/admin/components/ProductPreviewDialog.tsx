'use client';

import type React from 'react';
import { useState } from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';
import { Dialog } from 'radix-ui';

import { SafeImage } from '@/components/common/SafeImage';
import { copy } from '@/i18n/copy';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { formatGel } from '@/features/storefront/lib/format';
import { RichText } from '@/features/storefront/components/RichText';
import type { ICreateStorefrontProductRequest } from '../types/admin.types';

const adminCopy = copy.admin.editor;

export function ProductPreviewDialog({
  draft,
  open,
  onOpenChange,
}: {
  draft: Pick<ICreateStorefrontProductRequest, 'name' | 'brand' | 'description' | 'imageUrl' | 'salePrice' | 'originalPrice'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement {
  const [viewport, setViewport] = useState<'desktop' | 'phone'>('desktop');
  const isPhoneViewport = viewport === 'phone';
  const price = Number(draft.salePrice || 0);
  const originalPrice = draft.originalPrice ? Number(draft.originalPrice) : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#07152A]/55 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-3 top-1/2 z-50 max-h-[calc(100dvh-1.5rem)] -translate-y-1/2 overflow-hidden rounded-2xl border border-[#DFE6EF] bg-[#F6F8FB] shadow-[0_28px_90px_rgba(7,21,42,0.32)] sm:inset-x-6 lg:left-1/2 lg:right-auto lg:w-[min(1120px,calc(100vw-3rem))] lg:-translate-x-1/2">
          <header className="flex items-center gap-3 border-b border-[#DFE6EF] bg-white px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <Dialog.Title className="truncate font-black tracking-tight text-[#07152A]">{adminCopy.previewProductTitle}</Dialog.Title>
              <Dialog.Description className="sr-only">{adminCopy.previewProductTitle}</Dialog.Description>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-lg border border-[#DFE6EF] bg-[#F7F9FB] p-1">
              <button
                type="button"
                aria-pressed={viewport === 'desktop'}
                onClick={() => setViewport('desktop')}
                className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-bold transition', viewport === 'desktop' ? 'bg-white text-[#07152A] shadow-sm' : 'text-[#657184] hover:text-[#07152A]')}
              >
                <Monitor className="size-3.5" />
                <span className="hidden sm:inline">{adminCopy.previewDesktop}</span>
              </button>
              <button
                type="button"
                aria-pressed={viewport === 'phone'}
                onClick={() => setViewport('phone')}
                className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-bold transition', viewport === 'phone' ? 'bg-white text-[#07152A] shadow-sm' : 'text-[#657184] hover:text-[#07152A]')}
              >
                <Smartphone className="size-3.5" />
                <span className="hidden sm:inline">{adminCopy.previewPhone}</span>
              </button>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label={adminCopy.previewClose} className="grid size-9 place-items-center rounded-full text-[#526071] transition hover:bg-[#EEF2F6] hover:text-[#07152A]">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </header>

          <div className="max-h-[calc(100dvh-5.75rem)] overflow-y-auto p-4 sm:p-6">
            <div
              className={cn(
                'mx-auto overflow-hidden rounded-xl border border-[#DFE6EF] bg-white shadow-[0_14px_40px_rgba(7,21,42,0.08)] transition-[width]',
                isPhoneViewport ? 'w-full max-w-[390px]' : 'w-full max-w-[1040px]',
              )}
            >
              <div className={cn('border-b border-[#E7ECF2] py-3 text-xs font-black uppercase tracking-[0.14em] text-[#526071]', isPhoneViewport ? 'px-4' : 'px-4 sm:px-6')}>
                TrendingNow.ge
              </div>
              <article className={cn(
                'grid',
                isPhoneViewport ? 'gap-5 p-4' : 'gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-9 md:p-8',
              )}>
                <div className="relative aspect-square overflow-hidden rounded-xl border border-[#E3E8EF] bg-white">
                  <SafeImage
                    src={publicMediaUrl(draft.imageUrl)}
                    alt={draft.name || adminCopy.product}
                    fill
                    sizes={isPhoneViewport ? '390px' : '(max-width: 768px) 100vw, 470px'}
                    className={cn('object-contain', isPhoneViewport ? 'p-5' : 'p-6 sm:p-9')}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#6B7685]">{draft.brand || 'TrendingNow.ge'}</p>
                  <h2 className={cn('mt-2 font-black tracking-tight text-[#07152A]', isPhoneViewport ? 'text-2xl leading-tight' : 'text-2xl sm:text-3xl')}>{draft.name || adminCopy.product}</h2>
                  <div className={cn('flex flex-wrap items-end gap-x-3 gap-y-1', isPhoneViewport ? 'mt-4' : 'mt-5')}>
                    <span className={cn('font-black text-[#07152A]', isPhoneViewport ? 'text-xl' : 'text-2xl')}>{formatGel(price)}</span>
                    {originalPrice && originalPrice > price && <span className="text-sm font-semibold text-[#8490A0] line-through">{formatGel(originalPrice)}</span>}
                  </div>
                </div>
              </article>
              <section className={cn('border-t border-[#E7ECF2]', isPhoneViewport ? 'px-4 py-5' : 'px-4 py-6 sm:px-8 sm:py-8')}>
                <div className={cn(!isPhoneViewport && 'mx-auto max-w-[760px]')}>
                  <p className={cn('font-black uppercase tracking-[0.12em] text-[#526071]', isPhoneViewport ? 'mb-2 text-[11px]' : 'mb-3 text-xs')}>{adminCopy.description}</p>
                  <RichText html={String(draft.description ?? '')} responsiveMode={isPhoneViewport ? 'phone' : 'auto'} />
                </div>
              </section>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
