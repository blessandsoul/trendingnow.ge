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
import styles from '@/features/storefront/components/BoldDiscoveryHome.module.css';

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
    <div className={`${styles.fonts} min-h-svh bg-[#faf9f6] text-[#101010]`}>
      <StorefrontHeader />

      <main className="border-b border-black/25">
        <section className="mx-auto w-full max-w-[1680px] px-0 sm:px-5 lg:px-8 xl:px-12">
          <div className="border-x border-black/25 bg-[#faf9f6]">
            <div className="grid lg:min-h-[650px] lg:grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] xl:grid-cols-[minmax(450px,0.72fr)_minmax(0,1.28fr)]">
              <section className="flex items-center justify-center bg-[#faf9f6] px-5 py-10 sm:px-8 lg:justify-start lg:px-11 lg:py-12">
                <div className="w-full max-w-[430px]">
                  <div className="mb-7 hidden items-center justify-between gap-4 border-b border-black/20 pb-5 lg:flex">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#092bb4]">{copy.auth.shell.accountLabel}</span>
                    <Link href={localizedPath(locale, ROUTES.HOME)} className="text-sm font-semibold text-neutral-600 transition hover:text-[#092bb4]">
                      {copy.auth.shell.backToStore}
                    </Link>
                  </div>
                  {children}
                </div>
              </section>

              <aside className="relative hidden overflow-hidden bg-[#092bb4] lg:block">
                <Image
                  src="/storefront/bold-discovery/hero-lamp.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1280px) 58vw, 920px"
                  className="pointer-events-none object-contain object-center opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#092bb4] via-[#092bb4]/88 to-[#092bb4]/20" />
                <div className="relative z-10 flex min-h-full flex-col justify-between px-10 py-10 xl:px-12">
                  <div className="max-w-[520px]">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#ffe622]">TrendingNow.ge</p>
                    <h2 className={`${styles.display} text-4xl font-bold leading-tight text-white text-balance xl:text-[52px]`}>
                      {panelTitle}
                    </h2>
                    <p className="mt-4 max-w-[500px] text-base leading-7 text-white/78">
                      {panelDescription}
                    </p>
                    <Button
                      asChild
                      className="mt-7 h-12 rounded-none border border-black bg-[#ffe622] px-5 font-bold text-black hover:bg-white"
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
                        className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border border-white/35 bg-[#101010]/35 p-3.5 backdrop-blur-md"
                      >
                        <span className="grid size-11 place-items-center bg-[#ffe622] text-black">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white">{title}</h3>
                          <p className="mt-1 text-sm leading-5 text-white/72">{description}</p>
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
            className="m-5 inline-flex min-h-11 items-center border-b border-black text-sm font-semibold text-[#101010] transition hover:text-[#092bb4] lg:hidden"
          >
            {copy.auth.shell.backToStore}
          </Link>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
