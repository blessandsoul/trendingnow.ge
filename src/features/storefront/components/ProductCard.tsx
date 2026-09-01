'use client';

import type React from 'react';
import Link from 'next/link';
import { CircleCheck, Heart, ShoppingCart } from 'lucide-react';

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
import { AiImageMark } from './AiImageMark';

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

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[348px] flex-col rounded-[22px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_6px_18px_rgba(17,20,27,0.04)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_34px_rgba(17,20,27,0.1)] focus-within:shadow-[0_0_0_2px_rgba(255,64,87,0.45),0_18px_34px_rgba(17,20,27,0.1)] motion-reduce:transition-none sm:min-h-[386px] sm:rounded-[24px] sm:p-3',
        compact && 'min-h-[132px] flex-row items-center gap-3 p-3 sm:min-h-[132px] sm:p-3',
      )}
    >
      <div
        className={cn(
          'relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-[12px] bg-[#F1F3F6] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]',
          compact && 'mb-0 h-[104px] w-[116px] shrink-0',
        )}
      >
        {(product.isBestseller || product.isNew) && !compact && (
          <Badge
            className="absolute left-2 top-2 z-10 border-transparent bg-[#11141B] text-[10px] font-black text-white shadow-sm"
          >
            {product.isNew ? copy.productCard.new : copy.productCard.bestseller}
          </Badge>
        )}
        <button
          type="button"
          aria-label={isFavorite ? copy.productCard.removeFromWishlistAria : copy.productCard.addToWishlistAria}
          disabled={isFavoritePending}
          onClick={() => toggleFavorite.toggleFavorite({ productId: product.id, productSlug: product.slug, isFavorite })}
          className={cn(
            'absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full bg-white/92 text-[#7C8490] shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_4px_12px_rgba(17,20,27,0.08)] backdrop-blur transition-[color,transform,box-shadow] duration-150 ease-out hover:text-[#11141B] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none',
            isFavorite && 'text-[#D92F49] hover:text-[#B4233A]',
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
          <p className="mb-1 line-clamp-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#B4233A] sm:text-[11px]">
            {displayCategoryName}
          </p>
        )}
        <Link
          href={productHref}
          className="line-clamp-2 min-h-10 rounded-[4px] text-sm font-extrabold leading-5 tracking-[-0.015em] text-[#11141B] transition-colors duration-150 hover:text-[#B4233A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92F49]/55 sm:min-h-[42px] sm:text-[15px]"
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
            </div>
          </div>
          {!compact && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold leading-4 text-[#476052]">
              <CircleCheck className="size-3.5 shrink-0 text-[#2A8C47]" aria-hidden="true" />
              {copy.productCard.orderOnDemand}
            </p>
          )}
          {!compact && (
            <Button
              type="button"
              className="mt-3 h-11 w-full rounded-[12px] bg-[#D92F49] pl-4 pr-3.5 font-black text-white shadow-[0_8px_18px_rgba(217,47,73,0.22)] hover:bg-[#B4233A]"
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
