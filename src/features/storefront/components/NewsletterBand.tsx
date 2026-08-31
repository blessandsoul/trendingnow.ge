'use client';

import type React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocaleCopy } from '@/i18n/context';
import type { StorefrontHomeNewsletter } from '../types/storefront.types';

export function NewsletterBand({ newsletter }: { newsletter?: StorefrontHomeNewsletter | null }): React.ReactElement {
  const copy = useLocaleCopy();

  return (
    <section className="storefront-container mt-8">
      <div className="tn-signal-edge flex flex-col gap-5 overflow-hidden rounded-[18px] bg-[#11141B] px-6 py-6 text-white shadow-[0_18px_42px_rgba(17,20,27,0.12)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-[#FF4057] text-white">
            <Mail className="size-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black tracking-[-0.015em] text-white">{newsletter?.title ?? copy.newsletter.title}</h2>
            <p className="text-sm leading-6 text-white/62">
              {newsletter?.text ?? copy.newsletter.description}
            </p>
          </div>
        </div>

        <form className="flex min-w-0 flex-col gap-2 sm:flex-row lg:w-[460px]">
          <Input
            type="email"
            placeholder={newsletter?.placeholder ?? copy.newsletter.placeholder}
            className="h-11 border-white/14 bg-white text-[#11141B] placeholder:text-[#7C8490]"
          />
          <Button type="button" className="h-11 rounded-[9px] bg-[#FF4057] px-6 font-black text-white hover:bg-[#F02F48]">
            {newsletter?.buttonLabel ?? copy.newsletter.button}
          </Button>
        </form>
      </div>
    </section>
  );
}
