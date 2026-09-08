'use client';

import type React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocaleCopy } from '@/i18n/context';
import type { StorefrontHomeNewsletter } from '../types/storefront.types';
import { buildSupportMailto } from '../lib/support-mailto';

export function NewsletterBand({ newsletter }: { newsletter?: StorefrontHomeNewsletter | null }): React.ReactElement {
  const copy = useLocaleCopy();
  void newsletter;
  const contactHref = buildSupportMailto(copy.newsletter.contactSubject, [copy.newsletter.contactBody]);

  return (
    <section className="storefront-container mt-8">
      <div className="tn-signal-edge flex flex-col gap-5 overflow-hidden border border-[#101010] bg-[#101010] px-6 py-6 text-white lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-none bg-[#092BB4] text-white">
            <Mail className="size-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-[-0.015em] text-white">{copy.newsletter.title}</h2>
            <p className="text-sm leading-6 text-white/75">{copy.newsletter.description}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row lg:w-[460px]">
          <p className="flex min-h-11 min-w-0 flex-1 items-center border border-white/14 bg-white/10 px-3 text-sm leading-5 text-white/80">
            {copy.newsletter.contactHint}
          </p>
          <Button asChild className="h-11 rounded-none bg-[#092BB4] px-6 font-bold text-white hover:bg-[#061E81]">
            <a href={contactHref}>{copy.newsletter.button}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
