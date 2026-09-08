'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { useLocale, useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { TrendingNowWordmark } from './TrendingNowWordmark';
import { discoveryShellCopy } from '../lib/discovery-shell-copy';

export function StorefrontFooter(): React.ReactElement {
  const words = discoveryShellCopy[useLocale()];
  const copy = useLocaleCopy();
  const path = useLocalizedPath();
  const links = [[words.catalog, '/products'], [words.saved, '/saved'], [words.compare, '/compare'], [words.guides, '/blog'], [words.about, '/about-us'], [words.contact, '/contact']];
  const helpLinks = [[copy.infoPages.faq.title, '/faq'], [copy.infoPages.delivery.title, '/delivery'], [copy.infoPages.warranty.title, '/warranty'], [copy.infoPages.paymentMethods.title, '/payment-methods'], [copy.infoPages.corporateOffer.title, '/corporate-offer']];
  return (
    <footer data-discovery-footer className="border-t border-black/30 bg-[#101010] pb-[calc(66px+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div className="storefront-container grid gap-9 py-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="min-w-0">
          <Link href={path('/')} aria-label="TrendingNow.ge" className="inline-flex focus-visible:outline-2 focus-visible:outline-[#ffe622]"><TrendingNowWordmark tone="dark" /></Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/80">{words.summary}</p>
        </div>
        <nav aria-label={words.menu} className="grid grid-cols-2 content-start gap-x-5">
          {links.map(([label, href]) => <Link key={href} href={path(href)} className="flex min-h-11 items-center gap-2 text-sm hover:text-[#ffe622] focus-visible:outline-2 focus-visible:outline-[#ffe622]">{label}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
        </nav>
        <div className="min-w-0 text-sm">
          <h2 className="font-semibold text-[#ffe622]">{words.merchant}</h2>
          <p className="mt-3 leading-7 text-white/80">{words.merchantNote}</p>
          <a href="mailto:contact@ainow.ge" className="mt-3 flex min-h-11 items-center gap-2 underline underline-offset-4 hover:text-[#ffe622]"><Mail className="size-4 shrink-0" aria-hidden="true" />contact@ainow.ge</a>
          <a href="tel:+995574882887" className="flex min-h-11 items-center gap-2 hover:text-[#ffe622]"><Phone className="size-4 shrink-0" aria-hidden="true" />+995 574 88 28 87</a>
        </div>
      </div>
      <nav aria-label={copy.infoPages.faq.title} className="storefront-container flex flex-wrap gap-x-6 border-t border-white/20 py-3">
        {helpLinks.map(([label, href]) => <Link key={href} href={path(href)} className="flex min-h-11 items-center text-xs leading-6 text-white/80 hover:text-[#ffe622] focus-visible:outline-2 focus-visible:outline-[#ffe622]">{label}</Link>)}
      </nav>
      <div className="border-t border-white/20"><div className="storefront-container flex flex-col gap-3 py-5 text-xs leading-6 text-white/70 sm:flex-row sm:justify-between"><p className="max-w-3xl">{words.disclosure}</p><a href="https://ainow.ge" target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-white">aiNOW</a></div></div>
    </footer>
  );
}
