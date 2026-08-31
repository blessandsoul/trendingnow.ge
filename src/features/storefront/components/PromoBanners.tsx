'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { getCopy } from '@/i18n/copy';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { toStorefrontUppercase } from '../lib/format';

interface PromoBanner {
  id?: string;
  src?: string;
  imageUrl?: string;
  title: string;
  eyebrow?: string | null;
  cta?: string | null;
  ctaLabel?: string | null;
  href?: string | null;
  ctaHref?: string | null;
  tone: string;
}

export const promoBanners: readonly PromoBanner[] = getCopy().promoBanners;

export function PromoCard({
  banner,
  className,
  priority = false,
}: {
  banner: PromoBanner;
  className?: string;
  priority?: boolean;
}): React.ReactElement {
  const localizeHref = useLocalizedPath();
  const imageUrl = publicMediaUrl(banner.imageUrl ?? banner.src ?? '/storefront/promo-audio-sale.png');
  const ctaLabel = banner.ctaLabel ?? banner.cta;
  const ctaHref = banner.ctaHref ?? banner.href;
  const eyebrow = banner.eyebrow ? toStorefrontUppercase(banner.eyebrow) : null;
  const title = toStorefrontUppercase(banner.title);
  const displayCtaLabel = ctaLabel ? toStorefrontUppercase(ctaLabel) : null;

  return (
    <article
      className={cn(
        'group relative min-h-[244px] overflow-hidden rounded-[18px] border border-[#DDE2E9] bg-white shadow-[0_12px_34px_rgba(17,20,27,0.06)]',
        className,
      )}
    >
      <SafeImage
        src={imageUrl}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 58vw"
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.92)_36%,rgba(255,255,255,0.18)_68%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute left-0 top-0 h-16 w-1.5 -skew-x-[18deg] bg-[#FF4057]" aria-hidden="true" />
      <div className="relative z-10 flex min-h-[244px] max-w-[84%] flex-col justify-center px-5 py-6 sm:max-w-[56%] sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.11em] text-[#FF4057]">{eyebrow}</p>
        <h3 className="mt-2 text-xl font-black leading-7 tracking-[-0.03em] text-[#11141B] text-balance sm:text-2xl">
          {title}
        </h3>
        {displayCtaLabel && ctaHref && (
          <Button
            asChild
            variant="outline"
            className="mt-5 h-9 w-fit rounded-[8px] border-[#C8CFD9] bg-white px-4 text-xs font-black text-[#11141B] hover:border-[#FF4057] hover:bg-white hover:text-[#FF4057]"
          >
            <Link href={localizeHref(ctaHref)}>
              {displayCtaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

export function PromoBanners({ banners }: { banners?: readonly PromoBanner[] }): React.ReactElement {
  const copy = useLocaleCopy();
  const resolvedBanners: readonly PromoBanner[] = banners ?? copy.promoBanners;

  return (
    <section className="storefront-container mt-8 grid gap-4 lg:grid-cols-12">
      {resolvedBanners.map((banner, index) => (
        <PromoCard
          key={banner.id ?? banner.imageUrl ?? banner.src ?? banner.title}
          banner={banner}
          className={index % 4 === 0 || index % 4 === 3 ? 'lg:col-span-7' : 'lg:col-span-5'}
        />
      ))}
    </section>
  );
}
