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
    <div className="min-h-dvh bg-[#F5F7FA] text-[#11141B]">
      <StorefrontHeader />

      <main>
        <section className="storefront-container py-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(320px,0.34fr)] lg:items-end">
            <div>
              <p className="text-sm font-bold text-[#FF4057]">{eyebrow}</p>
              <h1 className="mt-3 max-w-[860px] text-3xl font-black leading-tight text-[#07152A] text-balance sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-[780px] text-base leading-7 text-[#526071] sm:text-lg">
                {intro}
              </p>
            </div>

            <div className="rounded-[8px] border border-[#DFE6EF] bg-white p-4 shadow-[0_18px_45px_rgba(7,21,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#07152A]">
                <FileText className="size-4 text-[#FF4057]" />
                Continuum GE
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6B7685]">
                {copy.infoPageShell.supportText}
              </p>
              <Button asChild className="mt-4 h-10 rounded-[7px] bg-[#07152A] text-white hover:bg-[#142238]">
                <Link href={localizeHref(ROUTES.PRODUCTS)}>
                  {copy.infoPageShell.catalogCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {cards.length > 0 && (
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div key={card.label} className="rounded-[8px] border border-[#DFE6EF] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8B96A5]">{card.label}</p>
                  <p className="mt-2 text-lg font-black text-[#07152A]">{card.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="storefront-container pb-12">
          <div className="grid gap-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[8px] border border-[#DFE6EF] bg-white p-5 sm:p-6">
                {section.eyebrow && (
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#FF4057]">{section.eyebrow}</p>
                )}
                <h2 className="text-xl font-black text-[#07152A] sm:text-2xl">{section.title}</h2>

                {section.text && (
                  <div className="mt-4 space-y-3 text-sm leading-7 text-[#526071] sm:text-base">
                    {section.text.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {section.items && (
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#526071] sm:text-base">
                    {section.items.map((item) => (
                      <li key={item} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 text-[#FF4057]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.blocks && (
                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    {section.blocks.map((block) => (
                      <div key={block.title} className="rounded-[8px] border border-[#EEF2F6] bg-[#FAFBFC] p-4">
                        <h3 className="text-base font-extrabold text-[#07152A]">{block.title}</h3>
                        {block.text && <p className="mt-2 text-sm leading-6 text-[#526071]">{block.text}</p>}
                        {block.items && (
                          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#526071]">
                            {block.items.map((item) => (
                              <li key={item}>• {item}</li>
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
