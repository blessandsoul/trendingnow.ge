import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StorefrontFooter } from '@/features/storefront/components/StorefrontFooter';
import { StorefrontHeader } from '@/features/storefront/components/StorefrontHeader';
import { localizedPath } from '@/i18n/locales';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { ROUTES } from '@/lib/constants/routes';

interface AuthPanelItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface AuthPageShellProps {
  children: React.ReactNode;
  panelTitle: string;
  panelDescription: string;
  panelItems: AuthPanelItem[];
}

export function AuthPageShell({
  children,
  panelTitle,
  panelDescription,
  panelItems,
}: AuthPageShellProps): Promise<React.ReactElement> {
  return AuthPageShellInner({ children, panelTitle, panelDescription, panelItems });
}

async function AuthPageShellInner({
  children,
  panelTitle,
  panelDescription,
  panelItems,
}: AuthPageShellProps): Promise<React.ReactElement> {
  const copy = await getRequestCopy();
  const locale = await getRequestLocale();

  return (
    <div className="min-h-dvh bg-white text-[#07152A]">
      <StorefrontHeader />

      <main className="bg-[#F5F7FA]">
        <section className="storefront-container py-5 sm:py-7 lg:py-8">
          <div className="mx-auto max-w-[560px] overflow-hidden rounded-[12px] border border-[#E3E8EF] bg-white shadow-[0_8px_24px_rgba(8,21,42,0.04)] lg:max-w-none">
            <div className="grid lg:min-h-[560px] lg:grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] xl:grid-cols-[minmax(430px,0.72fr)_minmax(0,1.28fr)]">
              <section className="flex items-center justify-center bg-white px-5 py-7 sm:px-8 lg:justify-start lg:px-10 lg:py-10">
                <div className="w-full max-w-[430px]">
                  <div className="mb-5 hidden items-center justify-between gap-4 border-b border-[#EEF2F6] pb-4 lg:flex">
                    <span className="text-sm font-extrabold text-[#8A6A00]">{copy.auth.shell.accountLabel}</span>
                    <Link href={localizedPath(locale, ROUTES.HOME)} className="text-sm font-bold text-[#526071] hover:text-[#07152A]">
                      {copy.auth.shell.backToStore}
                    </Link>
                  </div>
                  {children}
                </div>
              </section>

              <aside className="relative hidden overflow-hidden bg-gradient-to-r from-[#EAF5FF] via-white to-[#FFE8AA] lg:block">
                <Image
                  src="/storefront/hero-products.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1280px) 58vw, 920px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/78 to-white/8" />
                <div className="relative z-10 flex min-h-full flex-col justify-between px-10 py-10 xl:px-12">
                  <div className="max-w-[520px]">
                    <h2 className="text-4xl font-black leading-tight text-[#07152A] text-balance xl:text-[44px]">
                      {panelTitle}
                    </h2>
                    <p className="mt-4 max-w-[500px] text-base leading-7 text-[#526071]">
                      {panelDescription}
                    </p>
                    <Button
                      asChild
                      className="mt-6 h-11 rounded-[7px] bg-[#FDC302] px-6 font-bold text-[#07152A] hover:bg-[#F2B900]"
                    >
                      <Link href={localizedPath(locale, ROUTES.PRODUCTS)}>
                        {copy.auth.shell.browseProducts}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid max-w-[640px] gap-3">
                    {panelItems.map(({ icon: Icon, title, description }) => (
                      <article
                        key={title}
                        className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-[8px] border border-white/70 bg-white/88 p-3 shadow-[0_8px_24px_rgba(8,21,42,0.05)]"
                      >
                        <span className="grid size-10 place-items-center rounded-[8px] bg-[#FFF7D7] text-[#07152A]">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-[#07152A]">{title}</h3>
                          <p className="mt-1 text-sm leading-5 text-[#6B7685]">{description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>

          <Link
            href={localizedPath(locale, ROUTES.HOME)}
            className="mt-4 inline-flex text-sm font-bold text-[#526071] hover:text-[#07152A] lg:hidden"
          >
            {copy.auth.shell.backToStore}
          </Link>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
