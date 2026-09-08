'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';

interface InfoCard {
  label: string;
  value: string;
}

interface InfoBlock {
  title: string;
  text?: string;
  items?: readonly string[];
}

interface InfoSection {
  title: string;
  eyebrow?: string;
  text?: readonly string[];
  items?: readonly string[];
  blocks?: readonly InfoBlock[];
}

interface StorefrontInfoPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  cards?: readonly InfoCard[];
  sections: readonly InfoSection[];
}

function contactHref(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === 'contact@ainow.ge') return 'mailto:contact@ainow.ge';
  if (trimmed === '+995 574 88 28 87') return 'tel:+995574882887';
  return null;
}

function renderContactAwareText(value: string): React.ReactNode {
  const email = 'contact@ainow.ge';
  const phone = '+995 574 88 28 87';
  if (!value.includes(email) && !value.includes(phone)) return value;

  const parts = value.split(new RegExp(`(${email.replace('.', '\\.')})|(${phone.replace(/[+ ]/g, '\\$&')})`, 'g'));
  return parts.filter(Boolean).map((part, index) => {
    const href = contactHref(part);
    return href ? <a key={`${part}-${index}`} href={href} className="font-semibold text-[#061E81] underline-offset-4 hover:underline">{part}</a> : part;
  });
}

export function StorefrontInfoPage({
  eyebrow,
  title,
  intro,
  cards = [],
  sections,
}: StorefrontInfoPageProps): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();

  return (
    <div className="tn-page min-h-dvh text-[#101010]">
      <StorefrontHeader />

      <main className="relative">
        <section className="storefront-container py-8 sm:py-12">
          <div className="tn-page-intro">
            <div>
              <p className="tn-kicker">{eyebrow}</p>
              <h1 className="tn-page-title mt-4">
                {title}
              </h1>
              <p className="tn-page-lede mt-4">
                {intro}
              </p>
            </div>

            <div className="tn-dark-panel p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <FileText className="size-4 text-[#FFE622]" aria-hidden="true" />
                TrendingNow.ge
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {copy.infoPageShell.supportText}
              </p>
              <Button asChild className="tn-primary-action mt-5 h-11 px-5">
                <Link href={localizeHref(ROUTES.PRODUCTS)}>
                  {copy.infoPageShell.catalogCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {cards.length > 0 && (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <div key={card.label} className="tn-commerce-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#657080]">{card.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[#101010]">
                    {contactHref(card.value) ? <a href={contactHref(card.value) ?? undefined} className="underline-offset-4 hover:underline">{card.value}</a> : card.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="storefront-container pb-12">
          <div className="grid gap-4">
            {sections.map((section) => (
              <article key={section.title} className="tn-commerce-card p-5 sm:p-7">
                {section.eyebrow && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#061E81]">{section.eyebrow}</p>
                )}
                <h2 className="tn-section-title">{section.title}</h2>

                {section.text && (
                  <div className="tn-body-copy mt-4 space-y-3 text-sm sm:text-base">
                    {section.text.map((paragraph) => (
                      <p key={paragraph}>{renderContactAwareText(paragraph)}</p>
                    ))}
                  </div>
                )}

                {section.items && (
                  <ul className="tn-body-copy mt-4 grid gap-3 text-sm sm:text-base">
                    {section.items.map((item) => (
                      <li key={item} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 text-[#061E81]" aria-hidden="true" />
                        <span>{renderContactAwareText(item)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.blocks && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {section.blocks.map((block) => (
                      <div key={block.title} className="border border-black/25 bg-[#faf9f6] p-4">
                        <h3 className="text-base font-semibold text-[#101010]">{block.title}</h3>
                        {block.text && <p className="mt-2 text-sm leading-6 text-[#526071]">{renderContactAwareText(block.text)}</p>}
                        {block.items && (
                          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#526071]">
                            {block.items.map((item) => (
                              <li key={item}>• {renderContactAwareText(item)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
