'use client';

import type React from 'react';
import { BadgeDollarSign, Cable, Images, Layers3, PackageOpen, Ruler } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocale, useLocaleCopy } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { formatGel, formatStorefrontDate } from '../lib/format';
import { buildSupportMailto } from '../lib/support-mailto';
import type { StorefrontProductDetailProduct } from '../types/storefront.types';

type BuyerFactState = 'confirmed' | 'needs-confirmation' | 'unavailable';

type BuyerFact = {
  painId: string;
  label: string;
  detail: React.ReactNode;
  state: BuyerFactState;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
};

function FactState({ state }: { state: BuyerFactState }): React.ReactElement {
  const copy = useLocaleCopy();
  const label = state === 'confirmed'
    ? copy.product.decisionPassport.states.confirmed
    : state === 'needs-confirmation'
      ? copy.product.decisionPassport.states.needsConfirmation
      : copy.product.decisionPassport.states.unavailable;

  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-full border px-2 py-0.5 text-[11px] font-black leading-4',
        state === 'confirmed' && 'border-[#BFE4CA] bg-[#F0FAF3] text-[#237A3E]',
        state === 'needs-confirmation' && 'border-[#FFD0D6] bg-[#FFF3F5] text-[#B4233A]',
        state === 'unavailable' && 'border-[#DDE3EA] bg-[#F5F7FA] text-[#657080]',
      )}
    >
      {label}
    </span>
  );
}

export function BuyerDecisionPassport({ product }: { product: StorefrontProductDetailProduct }): React.ReactElement {
  const locale = useLocale();
  const copy = useLocaleCopy();
  const passport = copy.product.decisionPassport;
  const checkedDate = formatStorefrontDate(product.updatedAt, locale);
  const packageSummary = product.description?.trim() || product.category.name;
  const supportHref = buildSupportMailto(
    passport.emailSubject(product.name, product.attributes.sku),
    passport.emailBody(product.name, product.attributes.sku),
  );

  const facts: BuyerFact[] = [
    {
      painId: 'TN-BX-11',
      label: passport.fit.label,
      detail: passport.fit.detail,
      state: 'needs-confirmation',
      icon: Ruler,
    },
    {
      painId: 'TN-BX-12',
      label: passport.compatibility.label,
      detail: passport.compatibility.detail,
      state: 'needs-confirmation',
      icon: Cable,
    },
    {
      painId: 'TN-BX-15',
      label: passport.material.label,
      detail: passport.material.detail,
      state: 'needs-confirmation',
      icon: Layers3,
    },
    {
      painId: 'TN-BX-16',
      label: passport.package.label,
      detail: <>{passport.package.detail} <strong className="font-extrabold text-[#303844]">{packageSummary}</strong></>,
      state: 'needs-confirmation',
      icon: PackageOpen,
    },
    {
      painId: 'TN-BX-17',
      label: passport.price.label,
      detail: (
        <div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-bold text-[#303844]">
            <span>{passport.price.current}: {formatGel(product.salePrice)}</span>
            {product.originalPrice !== null ? <span>{passport.price.previous}: {formatGel(product.originalPrice)}</span> : null}
            <span>{passport.price.checked}: {checkedDate}</span>
          </div>
          <p className="mt-1.5">{passport.price.detail}</p>
        </div>
      ),
      state: 'confirmed',
      icon: BadgeDollarSign,
    },
    {
      painId: 'TN-BX-14',
      label: passport.visual.label,
      detail: passport.visual.detail,
      state: 'confirmed',
      icon: Images,
    },
  ];

  return (
    <section className="storefront-container mt-7" aria-labelledby="buyer-passport-title">
      <div className="overflow-hidden rounded-[14px] border border-[#DDE3EA] bg-white">
        <div className="grid gap-4 border-b border-[#E3E8EF] bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-[720px]">
            <h2 id="buyer-passport-title" className="text-xl font-black tracking-[-0.025em] text-[#11141B] sm:text-2xl">
              {passport.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#657080]">{passport.intro}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="h-10 rounded-[8px] bg-[#11141B] px-4 font-black text-white hover:bg-[#252A33]">
              <a href={supportHref}>{passport.confirmCta}</a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {facts.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <article
                key={fact.painId}
                data-pain-id={fact.painId}
                className={cn(
                  'grid grid-cols-[40px_minmax(0,1fr)] gap-3 border-[#E7EBF0] px-4 py-5 sm:px-6',
                  index < facts.length - 1 && 'border-b',
                  index % 2 === 0 && 'md:border-r',
                  index < facts.length - 2 && 'md:border-b',
                )}
              >
                <span className="grid size-10 place-items-center rounded-[8px] bg-[#F1F4F7] text-[#11141B]">
                  <Icon className="size-5" aria-hidden={true} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-[#11141B] sm:text-base">{fact.label}</h3>
                    <FactState state={fact.state} />
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#657080]">{fact.detail}</div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="border-t border-[#E3E8EF] px-4 py-3 text-xs font-semibold leading-5 text-[#657080] sm:px-6">
          {passport.contactHint} SKU: {product.attributes.sku}
        </p>
      </div>
    </section>
  );
}
