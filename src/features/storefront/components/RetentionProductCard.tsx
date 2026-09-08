'use client';

import type React from 'react';
import Link from 'next/link';
import { ExternalLink, Trash2 } from 'lucide-react';

import { useLocale, useLocalizedPath } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { formatGel, formatStorefrontDate } from '../lib/format';
import { getDiscoveryCategoryLabel, type RetentionProduct } from '../lib/retention-products';
import { DiscoveryProductImage } from './DiscoveryProductImage';

export function RetentionProductCard({
  product,
  onRemove,
}: {
  product: RetentionProduct;
  onRemove?: () => void;
}): React.ReactElement {
  const localizeHref = useLocalizedPath();
  const locale = useLocale();
  const cardCopy = {
    ka: { unknownPrice: 'ფასი ამჟამად უცნობია', seller: 'გამყიდველი', sku: 'SKU', price: 'ფასი', checked: 'შემოწმება', delete: 'წაშლა შენახულიდან', details: 'დეტალების ნახვა', store: 'მაღაზიის გვერდი' },
    en: { unknownPrice: 'Price is currently unknown', seller: 'Seller', sku: 'SKU', price: 'Price', checked: 'Checked', delete: 'Remove from saved', details: 'View details', store: 'Store page' },
    ru: { unknownPrice: 'Цена сейчас неизвестна', seller: 'Продавец', sku: 'SKU', price: 'Цена', checked: 'Проверено', delete: 'Удалить из сохранённых', details: 'Подробнее', store: 'Страница магазина' },
  }[locale];
  const priceLabel = product.price === null ? cardCopy.unknownPrice : formatGel(product.price);
  const categoryLabel = getDiscoveryCategoryLabel(product.categoryKey, locale);

  return (
    <article className="flex min-w-0 flex-col border border-black bg-[#FAF9F6]">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#092BB4] p-5 text-white">
        <DiscoveryProductImage src={product.imageUrl} alt={product.name} />
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 grid size-11 place-items-center border border-black/20 bg-white text-[#101010] transition-colors hover:bg-[#FFE622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`${cardCopy.delete}: ${product.name}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#092BB4]">{categoryLabel}</p>
        <h2 className="mt-3 break-words text-lg font-bold leading-7 text-[#101010]">{product.name}</h2>
        <dl className="mt-4 grid gap-2 text-sm leading-6 text-[#4D5868]">
          <div className="flex min-w-0 justify-between gap-3 border-t border-black/10 pt-2"><dt>{cardCopy.seller}</dt><dd className="min-w-0 break-words text-right font-semibold text-[#101010]">{product.merchantName}</dd></div>
          <div className="flex min-w-0 justify-between gap-3"><dt>{cardCopy.sku}</dt><dd className="min-w-0 break-all text-right font-semibold text-[#101010]">{product.merchantSku}</dd></div>
          <div className="flex min-w-0 justify-between gap-3"><dt>{cardCopy.price}</dt><dd className={cn('text-right font-bold text-[#101010]', product.price === null && 'font-medium text-[#657080]')}>{priceLabel}</dd></div>
          <div className="flex min-w-0 justify-between gap-3"><dt>{cardCopy.checked}</dt><dd className="text-right text-xs">{formatStorefrontDate(product.checkedAt, locale)}</dd></div>
        </dl>
        <div className="mt-auto grid gap-2 pt-5">
          <Link href={localizeHref(`/products/${product.slug}`)} className="inline-flex min-h-11 items-center justify-between gap-2 border border-black px-4 py-2 text-sm font-bold text-[#101010] transition-colors hover:bg-[#FFE622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]">
            {cardCopy.details}
          </Link>
          {product.offerHref ? <a href={product.offerHref} target="_blank" rel={product.offerRel ?? 'noopener noreferrer'} className="inline-flex min-h-11 items-center justify-between gap-2 bg-[#092BB4] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#061E81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE622]">
            {cardCopy.store} <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
          </a> : <p role="status" className="border border-black bg-[#FFF8C2] p-3 text-sm leading-6">{locale === 'ka' ? 'მაღაზიის ბმული ხელახლა მოწმდება.' : locale === 'en' ? 'Store link needs another review.' : 'Ссылка магазина требует повторной проверки.'}</p>}
        </div>
      </div>
    </article>
  );
}
