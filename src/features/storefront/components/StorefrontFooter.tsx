'use client';

import type React from 'react';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { TrendingNowWordmark } from './TrendingNowWordmark';

interface FooterLink {
  label: string;
  href?: string;
}

interface FooterColumn {
  title: string;
  links: readonly FooterLink[];
}

export function StorefrontFooter(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const footerColumns: readonly FooterColumn[] = copy.footer.columns;

  return (
    <footer className="mt-12 border-t border-[#242932] bg-[#101010] text-white">
      <div className="storefront-container grid gap-9 py-11 xl:grid-cols-[1.1fr_1.7fr_0.8fr]">
        <div className="relative overflow-hidden">
          <span className="absolute -left-8 -top-16 h-44 w-10 rotate-[24deg] bg-[#092BB4]" aria-hidden="true" />
          <TrendingNowWordmark className="relative mb-5 h-10 w-[200px]" tone="dark" />
          <p className="relative max-w-[320px] text-sm leading-6 text-white/72">
            {copy.footer.summary}
          </p>
          <div className="relative mt-5 space-y-2 text-sm text-white/76">
            <p className="flex items-center gap-2"><Phone className="size-4 text-[#FFE622]" /> +995 574 88 28 87</p>
            <p className="flex items-center gap-2"><Mail className="size-4 text-[#FFE622]" /> contact@ainow.ge</p>
          </div>
          <div className="relative mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#FFE622]">
            <span className="h-px w-8 bg-current" /> signal pop commerce
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-bold text-white">{column.title}</h3>
              <ul className="space-y-2 text-sm text-white/70">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={localizeHref(link.href)}
                        className="transition-colors hover:text-[#092BB4] focus-visible:text-[#092BB4] focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-white">{copy.footer.paymentMethods}</h3>
          <p className="text-sm leading-6 text-white/72">{copy.footer.paymentStatus}</p>
          <Link
            href={localizeHref(ROUTES.PAYMENT_METHODS)}
            className="mt-3 inline-flex min-h-10 items-center rounded-[8px] border border-white/14 px-3 text-xs font-bold text-white transition-colors hover:border-[#092BB4] hover:text-[#FFE622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/55"
          >
            {copy.footer.paymentDetails}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        <a
          href="https://ainow.ge"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.footer.agencyAria}
          className="inline-flex max-w-full items-center justify-center rounded-md px-2 py-1 font-bold tracking-[-0.025em] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]/35"
        >
          aiNOW
        </a>
      </div>
    </footer>
  );
}
