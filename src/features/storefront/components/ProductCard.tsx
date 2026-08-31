'use client';

import type React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { useAddCartItem, useFavoriteIds, useToggleFavorite } from '../hooks/useStorefront';
import { formatGel, toStorefrontUppercase } from '../lib/format';
import type { StorefrontProduct } from '../types/storefront.types';

interface ProductCardProps {
  product: StorefrontProduct;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps): React.ReactElement {
  const addCartItem = useAddCartItem();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const productHref = localizeHref(ROUTES.PRODUCT_DETAIL(product.slug));
  const isFavorite = favoriteIds.data?.productIds.includes(product.id) ?? false;
  const isFavoritePending = toggleFavorite.isPending && toggleFavorite.variables?.productId === product.id;
  const displayName = toStorefrontUppercase(product.name);
  const displayCategoryName = toStorefrontUppercase(product.category.name);
  const hasDiscount = product.originalPrice !== null && product.originalPrice > product.salePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.salePrice) / product.originalPrice!) * 100)
    : 0;
  const savings = hasDiscount ? product.originalPrice! - product.salePrice : 0;

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[348px] flex-col rounded-[22px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_6px_18px_rgba(17,20,27,0.04)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_34px_rgba(17,20,27,0.1)] focus-within:shadow-[0_0_0_2px_rgba(255,64,87,0.45),0_18px_34px_rgba(17,20,27,0.1)] motion-reduce:transition-none sm:min-h-[386px] sm:rounded-[24px] sm:p-3',
        compact && 'min-h-[132px] flex-row items-center gap-3 p-3 sm:min-h-[132px] sm:p-3',
      )}
    >
      <div
        className={cn(
          'relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-[12px] bg-[#F1F3F6] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]',
          compact && 'mb-0 h-[104px] w-[116px] shrink-0',
        )}
      >
        {(hasDiscount || product.isBestseller || product.isNew) && !compact && (
          <Badge
            className={cn(
              'absolute left-2 top-2 z-10 border-transparent text-[10px] font-black text-white shadow-sm',
              hasDiscount ? 'bg-[#FF4057]' : 'bg-[#11141B]',
            )}
          >
            {hasDiscount ? `-${discountPercent}%` : product.isNew ? copy.productCard.new : copy.productCard.bestseller}
          </Badge>
        )}
        <button
          type="button"
          aria-label={isFavorite ? copy.productCard.removeFromWishlistAria : copy.productCard.addToWishlistAria}
          disabled={isFavoritePending}
          onClick={() => toggleFavorite.toggleFavorite({ productId: product.id, productSlug: product.slug, isFavorite })}
          className={cn(
            'absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full bg-white/92 text-[#7C8490] shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_4px_12px_rgba(17,20,27,0.08)] backdrop-blur transition-[color,transform,box-shadow] duration-150 ease-out hover:text-[#11141B] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none',
            isFavorite && 'text-[#FF4057] hover:text-[#F02F48]',
          )}
        >
          <Heart className={cn('size-4', isFavorite && 'fill-current')} />
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
            className="object-contain p-3 outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-500 ease-out group-hover:scale-[1.045] group-focus-within:scale-[1.025] motion-reduce:transition-none dark:outline-white/10 sm:p-4"
          />
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {!compact && (
          <p className="mb-1 line-clamp-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#FF4057] sm:text-[11px]">
            {displayCategoryName}
          </p>
        )}
        <Link
          href={productHref}
          className="line-clamp-2 min-h-10 rounded-[4px] text-sm font-extrabold leading-5 tracking-[-0.015em] text-[#11141B] transition-colors duration-150 hover:text-[#FF4057] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/55 sm:min-h-[42px] sm:text-[15px]"
        >
          {displayName}
        </Link>
        {!compact && product.description && (
          <p className="mt-1.5 line-clamp-1 text-pretty text-xs font-medium text-[#69717E]">{product.description}</p>
        )}
        <div className="mt-auto pt-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
              <span className="whitespace-nowrap text-lg font-black tracking-[-0.03em] text-[#11141B] sm:text-xl">{formatGel(product.salePrice)}</span>
              {hasDiscount && (
                <span className="text-xs font-semibold text-[#8A929E] line-through sm:text-sm">{formatGel(product.originalPrice!)}</span>
              )}
            </div>
            {hasDiscount && (
              <p className="mt-0.5 text-[11px] font-bold text-[#2A8C47]">
                {copy.productCard.savings(formatGel(savings))}
              </p>
            )}
          </div>
          {!compact && (
            <Button
              type="button"
              className="mt-3 h-11 w-full rounded-[12px] bg-[#FF4057] pl-4 pr-3.5 font-black text-white shadow-[0_8px_18px_rgba(255,64,87,0.22)] hover:bg-[#F02F48]"
              disabled={addCartItem.isPending}
              onClick={() => addCartItem.mutate({ productSlug: product.slug })}
              aria-label={copy.productCard.addToCartAria(product.name)}
            >
              <ShoppingCart className="size-4" />
              {copy.productCard.addToCart}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
