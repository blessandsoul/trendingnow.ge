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
    <div className="tn-page">
      <StorefrontHeader />

      <main>
        <section className="storefront-container py-7 sm:py-10 lg:py-12">
          <div className="tn-surface mx-auto max-w-[560px] overflow-hidden lg:max-w-[1240px]">
            <div className="grid lg:min-h-[620px] lg:grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] xl:grid-cols-[minmax(450px,0.72fr)_minmax(0,1.28fr)]">
              <section className="flex items-center justify-center bg-white/92 px-5 py-8 sm:px-8 lg:justify-start lg:px-11 lg:py-12">
                <div className="w-full max-w-[430px]">
                  <div className="mb-6 hidden items-center justify-between gap-4 border-b border-[#ECEEF3] pb-5 lg:flex">
                    <span className="tn-kicker">{copy.auth.shell.accountLabel}</span>
                    <Link href={localizedPath(locale, ROUTES.HOME)} className="text-sm font-bold text-[#69717E] transition hover:text-[#FF4057]">
                      {copy.auth.shell.backToStore}
                    </Link>
                  </div>
                  {children}
                </div>
              </section>

              <aside className="tn-dark-panel relative hidden overflow-hidden lg:block">
                <Image
                  src="/storefront/hero-products.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1280px) 58vw, 920px"
                  className="object-cover object-center opacity-35 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#11141B] via-[#24183E]/82 to-transparent" />
                <div className="absolute right-8 top-8 flex items-end gap-1.5" aria-hidden="true">
                  <span className="h-6 w-2 rounded-full bg-[#FF4057]" />
                  <span className="h-10 w-2 rounded-full bg-[#8C5CF6]" />
                  <span className="h-14 w-2 rounded-full bg-[#19C6A6]" />
                </div>
                <div className="relative z-10 flex min-h-full flex-col justify-between px-10 py-10 xl:px-12">
                  <div className="max-w-[520px]">
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[#FF8C9A]">TrendingNow.ge</p>
                    <h2 className="text-4xl font-black leading-tight text-white text-balance xl:text-[46px]">
                      {panelTitle}
                    </h2>
                    <p className="mt-4 max-w-[500px] text-base leading-7 text-white/68">
                      {panelDescription}
                    </p>
                    <Button
                      asChild
                      className="tn-primary-action mt-7 h-11 px-6 font-black"
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
                        className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-[14px] border border-white/12 bg-white/8 p-3.5 backdrop-blur-md"
                      >
                        <span className="grid size-11 place-items-center rounded-[12px] bg-white/12 text-[#FF8C9A]">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-white">{title}</h3>
                          <p className="mt-1 text-sm leading-5 text-white/58">{description}</p>
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
            className="mt-4 inline-flex text-sm font-bold text-[#69717E] transition hover:text-[#FF4057] lg:hidden"
          >
            {copy.auth.shell.backToStore}
          </Link>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
