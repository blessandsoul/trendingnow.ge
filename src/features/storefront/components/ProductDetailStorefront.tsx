'use client';

import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  Minus,
  PackageCheck,
  PlayCircle,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  WalletCards,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { SafeImage } from '@/components/common/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { useAddCartItem, useFavoriteIds, useProduct, useToggleFavorite } from '../hooks/useStorefront';
import { formatGel, htmlToPlainText, toStorefrontUppercase } from '../lib/format';
import type {
  StorefrontProduct,
  StorefrontProductBenefit,
  StorefrontProductDetailProduct,
  StorefrontProductDetail,
  StorefrontProductGalleryItem,
  StorefrontProductQuestion,
} from '../types/storefront.types';
import { NewsletterBand } from './NewsletterBand';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';
import { RichText } from './RichText';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { TrendingNowLogoMark } from './TrendingNowWordmark';
import { resolveGallerySwipe, wrapGalleryIndex } from './gallery-swipe';

const iconMap: Record<string, LucideIcon> = {
  box: Box,
  credit: CreditCard,
  heart: Heart,
  refresh: RefreshCw,
  shield: ShieldCheck,
  truck: Truck,
  wallet: WalletCards,
  wifi: Wifi,
  zap: Zap,
};

type DetailTab = 'description' | 'specs' | 'faq';

function DetailIcon({ name, className }: { name: string; className?: string }): React.ReactElement {
  const Icon = iconMap[name] ?? PackageCheck;
  return <Icon className={className} />;
}

function DetailSkeleton(): React.ReactElement {
  return (
    <div className="storefront-container py-6">
      <div className="mb-5 h-5 w-64 animate-pulse rounded bg-[#EEF2F6]" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.78fr)_330px]">
        <div className="h-[420px] animate-pulse rounded-[8px] border border-[#E3E8EF] bg-white" />
        <div className="h-[420px] animate-pulse rounded-[8px] border border-[#E3E8EF] bg-white" />
        <div className="h-[360px] animate-pulse rounded-[8px] border border-[#E3E8EF] bg-white" />
      </div>
    </div>
  );
}

function DetailError(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  return (
    <div className="storefront-container py-12">
      <div className="rounded-[8px] border border-[#F2D0D0] bg-[#FFF5F5] px-5 py-6 text-[#A23A3A]">
        <p className="font-bold">{copy.product.loadingErrorTitle}</p>
        <p className="mt-1 text-sm">{copy.product.loadingErrorText}</p>
        <Button asChild className="mt-4 rounded-[9px] bg-[#11141B] text-white hover:bg-[#252A33]">
          <Link href={localizeHref(ROUTES.PRODUCTS)}>{copy.product.backToProducts}</Link>
        </Button>
      </div>
    </div>
  );
}

function Breadcrumb({ product }: { product: StorefrontProductDetailProduct }): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  return (
    <nav className="storefront-container py-4 text-xs font-medium text-[#6B7685] sm:text-sm">
      <ol className="flex min-w-0 flex-wrap items-center gap-2">
        <li>
          <Link href={localizeHref(ROUTES.HOME)} className="hover:text-[#07152A]">
            {copy.common.home}
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href={localizeHref(ROUTES.PRODUCTS)} className="hover:text-[#07152A]">
            {copy.common.products}
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href={localizeHref(`${ROUTES.PRODUCTS}?category=${product.category.slug}`)} className="hover:text-[#07152A]">
            {product.category.name}
          </Link>
        </li>
        <li>/</li>
        <li className="min-w-0 truncate text-[#07152A]">{product.name}</li>
      </ol>
    </nav>
  );
}

function ProductGallery({
  product,
  selectedIndex,
  onSelect,
  onShare,
}: {
  product: StorefrontProductDetailProduct;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onShare: () => Promise<void>;
}): React.ReactElement {
  const copy = useLocaleCopy();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const isFavorite = favoriteIds.data?.productIds.includes(product.id) ?? false;
  const isFavoritePending = toggleFavorite.isPending && toggleFavorite.variables?.productId === product.id;
  const swipeStart = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const gallery = (product.gallery.length > 0
    ? product.gallery
    : [{ type: 'image', url: product.imageUrl, thumbnailUrl: product.imageUrl, alt: product.name } satisfies StorefrontProductGalleryItem])
    .map((item) => ({
      ...item,
      url: publicMediaUrl(item.url),
      thumbnailUrl: publicMediaUrl(item.thumbnailUrl),
    }));
  const selectedMedia = gallery[Math.min(selectedIndex, gallery.length - 1)] ?? gallery[0];
  const selectPrevious = (): void => onSelect(wrapGalleryIndex(selectedIndex - 1, gallery.length));
  const selectNext = (): void => onSelect(wrapGalleryIndex(selectedIndex + 1, gallery.length));

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!event.isPrimary || event.pointerType === 'mouse') return;
    swipeStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>): void => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.pointerId !== event.pointerId) return;

    const direction = resolveGallerySwipe(start, { x: event.clientX, y: event.clientY });
    if (direction === 'next') selectNext();
    if (direction === 'previous') selectPrevious();
  };

  return (
    <section className="min-w-0">
      <div className="relative overflow-hidden rounded-[8px] border border-[#DFE6EF] bg-white">
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {product.isNew && (
            <Badge className="border-[#D9ECFF] bg-[#F0F7FF] text-[#174A98]">{copy.product.new}</Badge>
          )}
          {product.isBestseller && (
            <Badge className="border-[#DCF2DF] bg-[#F1FFF3] text-[#2A9D4A]">{copy.product.bestseller}</Badge>
          )}
        </div>

        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button
            type="button"
            className={cn(
              'grid size-10 place-items-center rounded-full border border-[#DFE6EF] bg-white/90 text-[#526071] shadow-[0_4px_14px_rgba(8,21,42,0.08)] hover:text-[#07152A] disabled:cursor-not-allowed disabled:opacity-70',
              isFavorite && 'text-[#D91F3C] hover:text-[#B91531]',
            )}
            disabled={isFavoritePending}
            onClick={() => toggleFavorite.toggleFavorite({ productId: product.id, productSlug: product.slug, isFavorite })}
            aria-label={isFavorite ? copy.product.removeFromWishlistAria : copy.product.addToWishlistAria}
          >
            <Heart className={cn('size-4', isFavorite && 'fill-current')} />
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-[#DFE6EF] bg-white/90 text-[#526071] shadow-[0_4px_14px_rgba(8,21,42,0.08)] hover:text-[#07152A]"
            onClick={() => {
              void onShare();
            }}
            aria-label={copy.product.shareAria}
          >
            <Share2 className="size-4" />
          </button>
        </div>

        <div
          className="relative aspect-[4/5] min-h-[360px] touch-pan-y select-none sm:min-h-[520px] xl:min-h-[620px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerEnd}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          aria-roledescription="carousel"
          aria-label={product.name}
        >
          <SafeImage
            src={selectedMedia.url}
            alt={selectedMedia.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 780px"
            className="object-cover"
          />
          {selectedMedia.type === 'video' && (
            <div className="absolute inset-0 grid place-items-center bg-[#07152A]/5">
              <span className="grid size-16 place-items-center rounded-full bg-white/92 text-[#07152A] shadow-[0_14px_36px_rgba(8,21,42,0.16)]">
                <PlayCircle className="size-9" />
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/92 px-2.5 py-1 text-[11px] font-black tabular-nums text-[#11141B] shadow-[0_5px_18px_rgba(17,20,27,0.12)]"
            aria-live="polite"
          >
            <TrendingNowLogoMark className="size-4" />
            <span>{Math.min(selectedIndex + 1, gallery.length)}/{gallery.length}</span>
          </div>
        </div>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={selectPrevious}
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-[#DFE6EF] bg-white/90 text-[#07152A] shadow-[0_4px_16px_rgba(8,21,42,0.12)] hover:bg-[#F7F9FB] sm:grid"
              aria-label={copy.product.previousMediaAria}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={selectNext}
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-[#DFE6EF] bg-white/90 text-[#07152A] shadow-[0_4px_16px_rgba(8,21,42,0.12)] hover:bg-[#F7F9FB] sm:grid"
              aria-label={copy.product.nextMediaAria}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <div className="no-scrollbar mt-3 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1">
        {gallery.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              'relative h-20 w-20 shrink-0 snap-start overflow-hidden rounded-[8px] border bg-white sm:h-24 sm:w-24',
              selectedIndex === index ? 'border-[#FF4057] ring-2 ring-[#FF4057]/25' : 'border-[#DDE2E9]',
            )}
            aria-label={copy.product.showMediaAria(index + 1)}
            aria-current={selectedIndex === index ? 'true' : undefined}
          >
            <SafeImage src={item.thumbnailUrl} alt={item.alt} fill sizes="96px" className="object-cover" />
            {item.type === 'video' && (
              <span className="absolute inset-0 grid place-items-center bg-[#07152A]/10 text-[#07152A]">
                <PlayCircle className="size-6" />
              </span>
            )}
          </button>
        ))}
      </div>
      {gallery.length > 1 && (
        <p className="mt-2 text-xs font-semibold text-[#6B7685] sm:hidden">{copy.product.swipeMediaHint}</p>
      )}
      <p className="mt-2 text-[11px] font-semibold leading-5 text-[#7A8492]">
        AI ვიზუალიზაცია · პროდუქტის რეალური დეტალები და კომპლექტაცია დასტურდება შეკვეთამდე
      </p>
    </section>
  );
}

const EXCERPT_MAX_LENGTH = 220;

function descriptionExcerpt(description: string | null): string {
  const text = htmlToPlainText(description ?? '');
  if (text.length <= EXCERPT_MAX_LENGTH) return text;
  return `${text.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…`;
}

function ProductInfo({ product }: { product: StorefrontProductDetailProduct }): React.ReactElement {
  const copy = useLocaleCopy();
  const discountPercent = product.originalPrice
    ? Math.max(0, Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100))
    : 0;
  const excerpt = descriptionExcerpt(product.description);

  return (
    <section className="min-w-0 rounded-[8px] border border-[#DFE6EF] bg-white p-4 sm:p-5 xl:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-[#E3E8EF] bg-[#F7F9FB] text-[#526071]">{product.category.name}</Badge>
        <span className="text-xs font-semibold text-[#8B96A5]">SKU: {product.attributes.sku}</span>
      </div>

      <h1 className="mt-4 text-2xl font-black leading-tight text-[#07152A] text-balance sm:text-3xl xl:text-4xl">
        {product.name}
      </h1>
      {excerpt.length > 0 && (
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{excerpt}</p>
      )}

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <span className="text-3xl font-black tabular-nums text-[#07152A] sm:text-4xl">
          {formatGel(product.salePrice)}
        </span>
        {product.originalPrice && (
          <span className="pb-1 text-lg font-semibold text-[#8B96A5] line-through">
            {formatGel(product.originalPrice)}
          </span>
        )}
        {discountPercent > 0 && (
          <Badge className="mb-1 border-[#FFC6CE] bg-[#FFF0F3] text-[#C72D42]">-{discountPercent}%</Badge>
        )}
      </div>

      {product.attributes.highlights.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-extrabold text-foreground">{copy.product.highlights}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {product.attributes.highlights.map((highlight) => (
              <li key={highlight} className="flex min-w-0 gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
                <span className="min-w-0 break-words">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}): React.ReactElement {
  const copy = useLocaleCopy();

  return (
    <div className="grid grid-cols-[44px_1fr_44px] overflow-hidden rounded-[8px] border border-[#DFE6EF] bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="grid h-12 place-items-center text-[#07152A] hover:bg-[#F7F9FB]"
        aria-label={copy.product.decreaseQuantityAria}
      >
        <Minus className="size-4" />
      </button>
      <div className="grid h-12 place-items-center border-x border-[#DFE6EF] text-base font-black tabular-nums">
        {quantity}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, quantity + 1))}
        className="grid h-12 place-items-center text-[#07152A] hover:bg-[#F7F9FB]"
        aria-label={copy.product.increaseQuantityAria}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function PurchasePanel({
  product,
  quantity,
  onQuantityChange,
  onShare,
}: {
  product: StorefrontProductDetailProduct;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onShare: () => Promise<void>;
}): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const router = useRouter();
  const addCartItem = useAddCartItem();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const isFavorite = favoriteIds.data?.productIds.includes(product.id) ?? false;
  const isFavoritePending = toggleFavorite.isPending && toggleFavorite.variables?.productId === product.id;

  const addToCart = (): void => {
    addCartItem.mutate({ productSlug: product.slug, quantity });
  };

  const buyNow = (): void => {
    addCartItem.mutate(
      { productSlug: product.slug, quantity },
      {
        onSuccess: () => {
          router.push(localizeHref(ROUTES.CART));
        },
      },
    );
  };

  return (
    <aside className="rounded-[8px] border border-[#DFE6EF] bg-white p-4 shadow-[0_10px_28px_rgba(8,21,42,0.05)] sm:p-5 xl:sticky xl:top-[150px] xl:self-start">
      <div className="flex items-center justify-between gap-3 border-b border-[#E3E8EF] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B96A5]">{copy.product.total}</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-[#07152A]">
            {formatGel(product.salePrice * quantity)}
          </p>
        </div>
        <Badge className="border-[#DCF2DF] bg-[#F1FFF3] text-[#2A9D4A]">{copy.product.online}</Badge>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-bold text-[#07152A]">{copy.product.quantity}</label>
        <QuantityStepper quantity={quantity} onChange={onQuantityChange} />
      </div>

      <div className="mt-4 grid gap-3">
        <Button
          type="button"
          disabled={addCartItem.isPending}
          onClick={addToCart}
          className="h-12 rounded-[10px] bg-[#FF4057] text-base font-black text-white shadow-[0_10px_22px_rgba(255,64,87,0.22)] hover:bg-[#F02F48]"
        >
          <ShoppingCart className="size-5" />
          {copy.product.addToCart}
        </Button>
        <Button
          type="button"
          disabled={addCartItem.isPending}
          onClick={buyNow}
          className="h-12 rounded-[10px] bg-[#11141B] text-base font-black text-white hover:bg-[#252A33]"
        >
          {copy.product.buyNow}
        </Button>
      </div>

      <div className="mt-5 divide-y divide-[#E3E8EF] border-y border-[#E3E8EF]">
        {product.attributes.delivery.map((item) => (
          <div key={`${item.title}-${item.text}`} className="flex items-center gap-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#F7F9FB] text-[#07152A]">
              <DetailIcon name={item.icon} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#07152A]">{item.title}</p>
              <p className="text-xs leading-5 text-[#6B7685]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn('rounded-[7px] border-[#DFE6EF]', isFavorite && 'text-[#D91F3C]')}
          disabled={isFavoritePending}
          onClick={() => toggleFavorite.toggleFavorite({ productId: product.id, productSlug: product.slug, isFavorite })}
          aria-label={isFavorite ? copy.product.removeFromWishlistAria : copy.product.addToWishlistAria}
        >
          <Heart className={cn('size-4', isFavorite && 'fill-current')} />
          {copy.product.wishlist}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-[7px] border-[#DFE6EF]"
          onClick={() => {
            void onShare();
          }}
        >
          <Share2 className="size-4" />
          {copy.product.share}
        </Button>
      </div>
    </aside>
  );
}

function BenefitStrip({ benefits }: { benefits: StorefrontProductBenefit[] }): React.ReactElement {
  return (
    <section className="storefront-container mt-6">
      <div className="grid gap-3 border-y border-[#E3E8EF] py-4 sm:grid-cols-2 xl:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={`${benefit.title}-${benefit.text}`} className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#F7F9FB] text-[#07152A]">
              <DetailIcon name={benefit.icon} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#07152A]">{benefit.title}</p>
              <p className="text-xs leading-5 text-[#6B7685]">{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuestionsAccordion({ questions }: { questions: StorefrontProductQuestion[] }): React.ReactElement {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid gap-3 lg:max-w-4xl">
      {questions.map((entry, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={`${entry.question}-${index}`} className="overflow-hidden rounded-[8px] border border-border bg-card">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-extrabold text-foreground hover:bg-secondary sm:text-base"
            >
              <span className="min-w-0 break-words">{entry.question}</span>
              <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-4">
                <RichText html={entry.answer} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailTabs({ product }: { product: StorefrontProductDetailProduct }): React.ReactElement | null {
  const copy = useLocaleCopy();
  const [activeTab, setActiveTab] = useState<DetailTab>('description');

  const description = (product.description ?? '').trim();
  const hasDescription = description.length > 0;
  const hasSpecs = product.attributes.specificationGroups.length > 0;
  const hasQuestions = product.attributes.questions.length > 0;

  const tabItems: { id: DetailTab; label: string }[] = [
    ...(hasDescription ? [{ id: 'description' as const, label: copy.product.tabs.description }] : []),
    ...(hasSpecs ? [{ id: 'specs' as const, label: copy.product.tabs.specs }] : []),
    ...(hasQuestions ? [{ id: 'faq' as const, label: copy.product.tabs.faq }] : []),
  ];

  if (tabItems.length === 0) return null;

  const effectiveTab = tabItems.some((tab) => tab.id === activeTab) ? activeTab : tabItems[0].id;

  return (
    <section className="storefront-container mt-8">
      <div className="border-b border-border">
        <div className="no-scrollbar flex gap-6 overflow-x-auto">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative shrink-0 py-4 text-sm font-extrabold text-muted-foreground hover:text-foreground',
                effectiveTab === tab.id && 'text-foreground',
              )}
            >
              {tab.label}
              {effectiveTab === tab.id && <span className="absolute inset-x-0 bottom-[-1px] h-[3px] rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="py-6">
        {effectiveTab === 'description' && (
          <div className="min-w-0 lg:max-w-4xl">
            <h2 className="text-xl font-black text-foreground">{copy.product.descriptionHeading}</h2>
            <div className="mt-3">
              <RichText html={description} />
            </div>
            {product.attributes.highlights.length > 0 && (
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                {product.attributes.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="min-w-0 break-words">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {effectiveTab === 'specs' && (
          <div className="grid gap-4 md:grid-cols-2">
            {product.attributes.specificationGroups.map((group) => (
              <div key={group.title} className="rounded-[8px] border border-border bg-card">
                <h3 className="border-b border-border px-4 py-3 text-base font-black text-foreground">
                  {group.title}
                </h3>
                <dl className="divide-y divide-border">
                  {group.items.map((item) => (
                    <div key={`${group.title}-${item.label}`} className="grid grid-cols-[0.9fr_1.1fr] gap-3 px-4 py-3 text-sm">
                      <dt className="min-w-0 break-words text-muted-foreground">{item.label}</dt>
                      <dd className="min-w-0 break-words text-right font-bold text-foreground">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}

        {effectiveTab === 'faq' && <QuestionsAccordion questions={product.attributes.questions} />}
      </div>
    </section>
  );
}

function ProductRail({
  title,
  products,
  compact = false,
}: {
  title: string;
  products: StorefrontProduct[];
  compact?: boolean;
}): React.ReactElement | null {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  if (products.length === 0) return null;

  return (
    <section className="storefront-container mt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-[#07152A] sm:text-2xl">{title}</h2>
        <Link href={localizeHref(ROUTES.PRODUCTS)} className="hidden text-sm font-bold text-[#11141B] hover:text-[#FF4057] sm:inline">
          {toStorefrontUppercase(copy.common.allProducts)}
        </Link>
      </div>
      <div className={compact ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5' : 'grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-6'}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact={compact} />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailStorefront({
  slug,
  initialData,
}: {
  slug: string;
  initialData?: StorefrontProductDetail;
}): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { data, isLoading, error } = useProduct(slug, initialData);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = data?.product;
  const relatedProducts = useMemo(() => data?.relatedProducts ?? [], [data?.relatedProducts]);
  const recentProducts = useMemo(() => data?.recentProducts ?? [], [data?.recentProducts]);
  const handleShare = useCallback(async (): Promise<void> => {
    if (!product) return;

    const url = window.location.href;
    const text = descriptionExcerpt(product.description);

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: text || undefined,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success(copy.product.linkCopied);
    } catch {
      toast.error(copy.product.shareFailed);
    }
  }, [copy.product.linkCopied, copy.product.shareFailed, product]);

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#11141B]">
      <StorefrontHeader />

      <main>
        {isLoading && <DetailSkeleton />}
        {error && <DetailError />}
        {product && (
          <>
            <Breadcrumb product={product} />
            <section className="storefront-container grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.78fr)_330px]">
              <Reveal className="min-w-0">
                <ProductGallery product={product} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onShare={handleShare} />
              </Reveal>
              <Reveal className="min-w-0" delay={0.04}>
                <ProductInfo product={product} />
              </Reveal>
              <Reveal className="min-w-0" delay={0.08}>
                <PurchasePanel product={product} quantity={quantity} onQuantityChange={setQuantity} onShare={handleShare} />
              </Reveal>
            </section>

            <section className="storefront-container mt-4">
              <Button asChild variant="ghost" className="h-10 rounded-[7px] px-0 text-[#526071] hover:text-[#07152A]">
                <Link href={localizeHref(ROUTES.PRODUCTS)}>
                  <ArrowLeft className="size-4" />
                  {copy.product.backToProducts}
                </Link>
              </Button>
            </section>

            <BenefitStrip benefits={product.attributes.benefits} />
            <DetailTabs product={product} />
            <ProductRail title={copy.product.related} products={relatedProducts} />
            <ProductRail title={copy.product.recent} products={recentProducts} compact />
            <NewsletterBand />
          </>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
