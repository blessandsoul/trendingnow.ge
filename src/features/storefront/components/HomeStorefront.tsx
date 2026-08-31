'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Heart, ShieldCheck, Truck, WalletCards, type LucideIcon } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { CategoryRail } from './CategoryRail';
import { NewsletterBand } from './NewsletterBand';
import { ProductCard } from './ProductCard';
import { PromoBanners } from './PromoBanners';
import { Reveal } from './Reveal';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { useStorefrontHome } from '../hooks/useStorefront';
import { toStorefrontUppercase } from '../lib/format';
import type { StorefrontHomeHero, StorefrontHomeProductRow, StorefrontHomeServiceItem } from '../types/storefront.types';

const productGridClass = 'storefront-container mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-6';
const heroSlideStepSeconds = 5.2;

const heroSlides = [
  '/storefront/trendingnow/hero-discovery-v2.webp',
  '/storefront/trendingnow/hero-fashion-city-v2.webp',
  '/storefront/trendingnow/hero-home-care-v2.webp',
] as const;

const serviceIconMap: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  truck: Truck,
  wallet: WalletCards,
  walletcards: WalletCards,
  heart: Heart,
};

function SectionHeader({ title, href }: { title: string; href?: string }): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  return (
    <div className="storefront-container mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-balance text-2xl font-black tracking-[-0.03em] text-[#11141B] md:text-3xl">{toStorefrontUppercase(title)}</h2>
      {href && (
        <Link
          href={localizeHref(href)}
          className="group flex min-h-10 w-fit items-center gap-2 rounded-[8px] px-1 text-sm font-bold text-[#11141B] transition-[color,transform] duration-150 ease-out hover:text-[#FF4057] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/55"
        >
          {toStorefrontUppercase(copy.common.viewAllProducts)} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function LoadingGrid(): React.ReactElement {
  return (
    <div className={productGridClass}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[328px] animate-pulse rounded-[8px] border border-[#E3E8EF] bg-white" />
      ))}
    </div>
  );
}

function HeroImageSlider({ hero, className }: { hero?: StorefrontHomeHero | null; className?: string }): React.ReactElement {
  const slides = hero?.slides.length
    ? hero.slides.map((slide) => ({ id: slide.id, src: publicMediaUrl(slide.imageUrl), alt: slide.altText ?? '' }))
    : heroSlides.map((src) => ({ id: src, src, alt: '' }));
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleSlides = slides.length > 1;
  const activeSlideIndex = Math.min(activeIndex, slides.length - 1);

  useEffect(() => {
    if (!hasMultipleSlides) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, heroSlideStepSeconds * 1000);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleSlides, slides.length]);

  const showPrevious = (): void => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNext = (): void => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <div data-hero-slider className={cn('relative min-h-[320px] overflow-hidden lg:min-h-[460px]', className)}>
      {slides.map((slide, index) => (
        <SafeImage
          key={slide.id}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 1120px"
          className={cn(
            'object-cover object-center transition-[opacity,transform] duration-700 ease-out',
            index === activeSlideIndex ? 'scale-100' : 'scale-[1.015]',
            index === activeSlideIndex ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      <div
        data-hero-controls
        className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex items-center justify-between gap-2 sm:inset-x-4 sm:bottom-4"
      >
        <div className="pointer-events-auto flex items-center rounded-full bg-white/92 p-0.5 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(17,20,27,0.14)] backdrop-blur-md">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              onClick={() => setActiveIndex(index)}
              className="group/dot grid size-9 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]"
              aria-label={`სურათი ${index + 1}`}
              aria-current={index === activeSlideIndex}
            >
              <span
                className={cn(
                  'block h-2 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none',
                  index === activeSlideIndex ? 'w-7 bg-[#FF4057]' : 'w-2 bg-[#C7CED8] group-hover/dot:bg-[#919BA8]',
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {hasMultipleSlides && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={showPrevious}
              className="grid size-11 place-items-center rounded-full bg-white/92 text-[#11141B] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(17,20,27,0.14)] transition-[background-color,transform,box-shadow] duration-150 ease-out hover:bg-white active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057] motion-reduce:transition-none"
              aria-label="წინა სურათი"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="grid size-11 place-items-center rounded-full bg-white/92 text-[#11141B] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_24px_rgba(17,20,27,0.14)] transition-[background-color,transform,box-shadow] duration-150 ease-out hover:bg-white active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057] motion-reduce:transition-none"
              aria-label="შემდეგი სურათი"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function productRowHref(row: StorefrontHomeProductRow): string {
  return row.source === 'CATEGORY' && row.category
    ? `${ROUTES.PRODUCTS}?category=${row.category.slug}`
    : ROUTES.PRODUCTS;
}

function ProductRowSection({ row }: { row: StorefrontHomeProductRow }): React.ReactElement | null {
  if (!row.isActive || row.products.length === 0) return null;

  return (
    <div>
      <SectionHeader title={row.title} href={productRowHref(row)} />
      <div className={productGridClass}>
        {row.products.map((product, index) => (
          <Reveal key={product.id} delay={index * 0.03}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function serviceIcon(icon: string): LucideIcon {
  return serviceIconMap[icon.toLowerCase().replace(/[^a-z]/g, '')] ?? ShieldCheck;
}

export function HomeStorefront(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { data, isLoading, error } = useStorefrontHome();
  const hero = data?.hero;
  const aboveRows = (data?.productRows ?? []).filter((row) => row.placement === 'ABOVE_BANNERS');
  const belowRows = (data?.productRows ?? []).filter((row) => row.placement === 'BELOW_BANNERS');
  const serviceItems = [
    { icon: ShieldCheck, ...copy.home.serviceItems[0] },
    { icon: Truck, ...copy.home.serviceItems[1] },
    { icon: WalletCards, ...copy.home.serviceItems[2] },
  ];
  const serviceStripItems = data?.serviceItems.length
    ? data.serviceItems.map((item: StorefrontHomeServiceItem) => ({ ...item, icon: serviceIcon(item.icon) }))
    : serviceItems;
  const catalogProductCount = data?.categories.reduce((sum, category) => sum + category.productCount, 0) ?? 0;
  const catalogCategoryCount = data?.categories.length ?? 0;
  const snapshotDate = data?.featuredProducts[0]?.updatedAt
    ? new Intl.DateTimeFormat('ka-GE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
        new Date(data.featuredProducts[0].updatedAt),
      )
    : null;
  const heroFacts: Array<{ value: string; label: string }> = [];
  if (catalogProductCount > 0) heroFacts.push({ value: String(catalogProductCount), label: 'პროდუქტი კატალოგში' });
  if (catalogCategoryCount > 0) heroFacts.push({ value: String(catalogCategoryCount), label: 'კატეგორია' });
  if (snapshotDate) heroFacts.push({ value: snapshotDate, label: 'ბოლო განახლება' });

  return (
    <div className="min-h-dvh bg-[#F5F7FA] text-[#11141B]">
      <StorefrontHeader />

      <main>
        <section className="storefront-container mt-5">
          <div className="relative min-h-[600px] overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_80px_rgba(17,20,27,0.09)] sm:min-h-[560px] sm:rounded-[26px] lg:min-h-[500px]">
            <HeroImageSlider hero={hero} className="absolute inset-0 min-h-full" />
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.96)_68%,rgba(255,255,255,0.72)_100%)] sm:bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.96)_44%,rgba(255,255,255,0.62)_64%,rgba(255,255,255,0.12)_100%)]" />
            <div data-hero-content className="relative z-20 flex min-h-[600px] max-w-full flex-col justify-center px-5 pb-24 pt-10 min-[390px]:px-6 sm:min-h-[560px] sm:max-w-[660px] sm:px-10 sm:pb-24 sm:pt-12 lg:min-h-[500px] lg:px-16">
                {hero?.eyebrow && (
                  <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#FF4057] before:h-px before:w-8 before:bg-current">{hero.eyebrow}</p>
                )}
                <h1 className="max-w-[620px] text-balance text-[30px] font-black leading-[1.08] tracking-[-0.045em] text-[#11141B] min-[390px]:text-[34px] sm:text-5xl lg:text-[56px]">
                  {toStorefrontUppercase(hero?.title ?? copy.home.heroTitle)}
                </h1>
                <p className="mt-5 max-w-[540px] text-pretty text-sm leading-6 text-[#5F6875] sm:text-base">
                  {hero?.text ?? copy.home.heroText}
                </p>
                {heroFacts.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2.5" aria-label="კატალოგის მოკლე ინფორმაცია">
                    {heroFacts.map((fact) => (
                      <div
                        key={fact.label}
                        className="flex min-h-11 items-center gap-2 rounded-[12px] bg-white/86 px-3.5 shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_6px_18px_rgba(17,20,27,0.06)] backdrop-blur-md"
                      >
                        <span className="tabular-nums text-sm font-black text-[#11141B]">{fact.value}</span>
                        <span className="text-[11px] font-semibold text-[#69717E]">{fact.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Button asChild className="mt-7 h-12 w-fit rounded-[12px] bg-[#FF4057] pl-7 pr-6 font-black text-white shadow-[0_12px_26px_rgba(255,64,87,0.28)] hover:-translate-y-0.5 hover:bg-[#F02F48]">
                  <Link href={localizeHref(hero?.ctaHref ?? ROUTES.PRODUCTS)}>
                    {hero?.ctaLabel ?? copy.home.heroCta} <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <p className="mt-3 flex max-w-[520px] items-center gap-2 text-pretty text-xs font-semibold text-[#5F6875]">
                  <ShieldCheck className="size-4 shrink-0 text-[#2A9D4A]" aria-hidden="true" />
                  ფასი და მიწოდების პირობები დასტურდება შეკვეთამდე
                </p>
              </div>
          </div>
        </section>

        {data?.categories && <CategoryRail categories={data.categoryRail.length ? data.categoryRail : data.categories} />}

        {isLoading && <LoadingGrid />}
        {error && (
          <div className="storefront-container mt-5">
            <div className="rounded-[8px] border border-[#F2D0D0] bg-[#FFF5F5] px-4 py-3 text-sm text-[#A23A3A]">
              {copy.home.loadingError}
            </div>
          </div>
        )}
        {aboveRows.map((row) => <ProductRowSection key={row.id} row={row} />)}

        <PromoBanners banners={data?.promoBanners.length ? data.promoBanners : undefined} />

        {belowRows.map((row) => <ProductRowSection key={row.id} row={row} />)}

        <section className="storefront-container mt-8">
          <div className="grid gap-4 rounded-[20px] bg-white px-4 py-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_26px_rgba(17,20,27,0.05)] md:grid-cols-3">
            {serviceStripItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#11141B] text-white"><Icon className="size-5" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-pretty text-xs text-[#69717E]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <NewsletterBand newsletter={data?.newsletter} />
      </main>

      <StorefrontFooter />
    </div>
  );
}
