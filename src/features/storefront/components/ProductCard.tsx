'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Heart } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale, useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { useFavoriteIds, useToggleFavorite } from '../hooks/useStorefront';
import { formatGel, toStorefrontUppercase } from '../lib/format';
import type { StorefrontProduct } from '../types/storefront.types';
import { AiImageMark } from './AiImageMark';

interface ProductCardProps {
  product: StorefrontProduct;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps): React.ReactElement {
  const legacy = {
    ka: { label: 'არქივის ჩანაწერი', price: 'ისტორიული ფასი', details: 'ჩანაწერის ნახვა' },
    en: { label: 'Archived record', price: 'Historical price', details: 'View record' },
    ru: { label: 'Архивная запись', price: 'Историческая цена', details: 'Подробнее' },
  }[useLocale()];
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const productHref = localizeHref(ROUTES.PRODUCT_DETAIL(product.slug));
  const isFavorite = favoriteIds.data?.productIds.includes(product.id) ?? false;
  const isFavoritePending = toggleFavorite.isPending && toggleFavorite.variables?.productId === product.id;
  const displayName = toStorefrontUppercase(product.name);
  const displayCategoryName = toStorefrontUppercase(product.category.name);

  return (
    <article
      data-product-card={compact ? 'compact' : 'standard'}
      className={cn(
        'group relative flex h-full min-h-[348px] flex-col border border-[#D9DDE7] bg-white p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_6px_18px_rgba(17,20,27,0.04)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-[#092BB4] hover:shadow-[0_0_0_1px_rgba(9,43,180,0.16),0_18px_34px_rgba(17,20,27,0.1)] focus-within:shadow-[0_0_0_2px_rgba(9,43,180,0.45),0_18px_34px_rgba(17,20,27,0.1)] motion-reduce:transition-none sm:min-h-[386px] sm:p-3',
        compact && 'min-h-[132px] flex-row items-center gap-3 p-3 sm:min-h-[132px] sm:p-3',
      )}
    >
      <div
        className={cn(
          'relative mb-3 aspect-[4/5] w-full overflow-hidden border border-[#D9DDE7] bg-[#EEF2FF] shadow-[inset_0_0_0_1px_rgba(9,43,180,0.06)]',
          compact && 'mb-0 h-[104px] w-[116px] shrink-0',
        )}
      >
        {!compact && (
          <Badge
            className="absolute left-2 top-2 z-10 border-transparent bg-[#101010] text-[10px] font-bold text-white shadow-sm"
          >
            {legacy.label}
          </Badge>
        )}
        <button
          type="button"
          aria-label={isFavorite ? copy.productCard.removeFromWishlistAria : copy.productCard.addToWishlistAria}
          disabled={isFavoritePending}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite.toggleFavorite({ productId: product.id, productSlug: product.slug, isFavorite })}
          className={cn(
            'absolute right-0 top-0 z-10 grid size-11 place-items-center text-[#657080] transition-colors hover:text-[#092BB4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4] disabled:cursor-not-allowed disabled:opacity-70',
            isFavorite && 'text-[#092BB4] hover:text-[#061E81]',
          )}
        >
          <span className={cn('grid size-8 place-items-center border border-black/10 bg-white/95', compact && 'size-6')}>
            <Heart aria-hidden="true" className={cn('size-4', compact && 'size-3.5', isFavorite && 'fill-current')} />
          </span>
        </button>
        <Link
          href={productHref}
          className="absolute inset-0"
          aria-label={copy.productCard.openProductAria(product.name)}
        >
          <SafeImage
            src={publicMediaUrl(product.imageUrl)}
            alt={product.name}
            fill
            sizes={compact ? '116px' : '(max-width: 1023px) 46vw, (max-width: 1280px) 30vw, 260px'}
            className="object-cover outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-500 ease-out group-hover:scale-[1.035] group-focus-within:scale-[1.02] motion-reduce:transition-none dark:outline-white/10"
          />
        </Link>
        <AiImageMark
          label={copy.product.aiImageAria}
          variant={compact ? 'compact' : 'card'}
          className="absolute bottom-2 left-2 z-10"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {!compact && (
          <p className="mb-1 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#061E81] sm:text-[11px]">
            {displayCategoryName}
          </p>
        )}
        <Link
          href={productHref}
          className="line-clamp-2 min-h-10 rounded-[4px] text-sm font-semibold leading-5 tracking-[-0.015em] text-[#101010] transition-colors duration-150 hover:text-[#061E81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/55 sm:min-h-[42px] sm:text-[15px]"
        >
          {displayName}
        </Link>
        {!compact && product.description && (
          <p className="mt-1.5 line-clamp-1 text-pretty text-xs font-medium text-[#69717E]">{product.description}</p>
        )}
        <div className="mt-auto pt-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs leading-5 text-neutral-600">{legacy.price}</p>
            <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
              <span className="whitespace-nowrap text-lg font-bold tracking-[-0.03em] text-[#101010] sm:text-xl">{formatGel(product.salePrice)}</span>
            </div>
          </div>
          {!compact && (
            <Button asChild className="mt-3 h-auto min-h-11 w-full rounded-none bg-[#092BB4] px-2 py-3 text-xs font-semibold whitespace-normal text-white hover:bg-[#061E81]"><Link href={productHref}><span className="min-w-0">{legacy.details}</span><ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></Link></Button>
          )}
        </div>
      </div>
    </article>
  );
}
