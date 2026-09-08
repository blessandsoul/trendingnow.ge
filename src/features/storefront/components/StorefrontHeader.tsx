'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Gift,
  Grid2X2,
  Headphones,
  Heart,
  House,
  Menu,
  Search,
  Columns2,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useLocale, useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

import { discoveryShellCopy } from '../lib/discovery-shell-copy';
import styles from './BoldDiscoveryHome.module.css';
import {
  INITIAL_SCROLL_HEADER_STATE,
  nextScrollHeaderState,
  settleScrollHeaderGesture,
} from './scroll-header';

import { discoveryCatalogHref } from '../lib/catalog-navigation';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#092bb4]';
const HEADER_GESTURE_SETTLE_MS = 220;

export function StorefrontHeader(): React.ReactElement {
  const copy = useLocaleCopy();
  const locale = useLocale();
  const words = discoveryShellCopy[locale];
  const localizeHref = useLocalizedPath();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const urlSearch = searchParams.get('search') ?? '';
  const [searchDraft, setSearchDraft] = useState({ source: urlSearch, value: urlSearch });
  const search = searchDraft.source === urlSearch ? searchDraft.value : urlSearch;
  const [scrollHeaderState, setScrollHeaderState] = useState(INITIAL_SCROLL_HEADER_STATE);

  const catalog = (query: string): string => localizeHref(discoveryCatalogHref(query));
  const currentPath = pathname.replace(/^\/(ka|en|ru)(?=\/|$)/, '') || '/';
  const navigation = [
    { title: words.discover, icon: Sparkles, href: localizeHref(ROUTES.HOME), current: currentPath === ROUTES.HOME },
    { title: words.catalog, icon: Grid2X2, href: localizeHref(ROUTES.PRODUCTS), current: currentPath === ROUTES.PRODUCTS && !searchParams.toString() },
    { title: words.home, icon: House, href: catalog('home'), current: searchParams.get('category') === 'home' },
    { title: words.tech, icon: Headphones, href: catalog('tech'), current: ['tech', 'technology'].includes(searchParams.get('category') ?? '') },
    { title: words.gifts, icon: Gift, href: catalog('gift'), current: searchParams.get('maxPrice') === '60' },
    { title: words.guides, icon: BookOpen, href: localizeHref(ROUTES.BLOG), current: currentPath.startsWith(ROUTES.BLOG) },
    { title: words.saved, icon: Heart, href: localizeHref('/saved'), current: currentPath === '/saved' },
    { title: words.compare, icon: Columns2, href: localizeHref('/compare'), current: currentPath === '/compare' },
  ];

  useEffect(() => {
    let frameId: number | null = null;
    let settleTimerId: number | null = null;

    const update = (): void => {
      frameId = null;
      setScrollHeaderState((state) => nextScrollHeaderState(state, window.scrollY));
    };
    const onScroll = (): void => {
      if (settleTimerId !== null) window.clearTimeout(settleTimerId);
      settleTimerId = window.setTimeout(() => {
        settleTimerId = null;
        setScrollHeaderState(settleScrollHeaderGesture);
      }, HEADER_GESTURE_SETTLE_MS);
      if (frameId === null) frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (settleTimerId !== null) window.clearTimeout(settleTimerId);
    };
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const query = search.trim();
    router.push(localizeHref(`${ROUTES.PRODUCTS}${query ? `?search=${encodeURIComponent(query)}` : ''}`));
    setMenuOpen(false);
  };

  const searchForm = (compact = false, slot = 'desktop'): React.ReactElement => (
    <form onSubmit={submitSearch} role="search" className={cn('flex min-w-0', compact ? 'w-full' : 'w-full max-w-[430px] xl:max-w-[520px]')}>
      <label className="sr-only" htmlFor={`discovery-search-${compact ? 'compact' : slot}`}>{copy.header.searchAria}</label>
      <Input
        id={`discovery-search-${compact ? 'compact' : slot}`}
        maxLength={120}
        value={search}
        onChange={(event) => setSearchDraft({ source: urlSearch, value: event.target.value })}
        name="search"
        type="search"
        placeholder={copy.header.searchPlaceholder}
        className="h-11 min-w-0 rounded-none border-black/30 bg-white px-3 text-sm text-black placeholder:text-neutral-500 focus-visible:border-[#092bb4] focus-visible:ring-[#092bb4]/20"
      />
      <Button type="submit" size="icon" className="h-11 w-12 shrink-0 rounded-none bg-[#092bb4] text-white hover:bg-[#061e81]" aria-label={copy.header.searchAria}>
        <Search className="size-5" aria-hidden="true" />
      </Button>
    </form>
  );

  return (
    <>
      <a href="#main-content" className="fixed -top-24 left-4 z-[100] border border-black bg-[#ffe622] p-3 text-black focus:top-4" onClick={(event) => {
        const main = document.querySelector('main');
        if (main) { event.preventDefault(); main.tabIndex = -1; main.focus(); main.scrollIntoView({ block: 'start' }); }
      }}>{words.skip}</a>
      <header
        data-header-mode={scrollHeaderState.mode}
        className={cn(
          styles.fonts,
          'fixed inset-x-0 top-0 z-50 border-b border-black/25 bg-[#faf9f6]/95 text-black backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none',
          scrollHeaderState.isVisible ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        {scrollHeaderState.isCompact ? (
          <div className="mx-auto flex h-[61px] max-w-[760px] items-center px-3 sm:px-5">{searchForm(true)}</div>
        ) : (
          <div className="flex min-h-20 w-full items-center gap-4 px-5 py-3 md:px-8 xl:px-12">
            <Link href={localizeHref(ROUTES.HOME)} className={cn(styles.wordmark, focus, 'shrink-0 text-[29px] leading-none tracking-[-1px] sm:text-[35px]')} aria-label={`TrendingNow.ge: ${copy.common.home}`}>
              TrendingNow.ge
            </Link>

            <nav aria-label={words.navigation} className="ml-auto hidden items-center gap-4 2xl:flex 2xl:gap-7">
              {navigation.slice(0, 4).map(({ icon: Icon, ...item }) => (
                <Link key={item.title} href={item.href} aria-current={item.current ? 'page' : undefined} className={cn(focus, 'flex min-h-11 items-center gap-2 border-b-2 py-2 text-sm font-semibold transition-colors', item.current ? 'border-[#092bb4]' : 'border-transparent hover:border-[#092bb4]')}>
                  <Icon size={17} strokeWidth={1.7} aria-hidden="true" />{item.title}
                </Link>
              ))}
            </nav>

            <div className="hidden min-w-0 flex-1 justify-center lg:flex">{searchForm()}</div>

            <div className="ml-auto hidden items-center gap-1 lg:flex xl:ml-0">
              <Button asChild variant="ghost" size="icon" className="size-11 rounded-none hover:bg-[#ffe622]" aria-label={copy.header.accountAria}>
                <Link href={localizeHref(ROUTES.LOGIN)}><UserRound className="size-5" aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="size-11 rounded-none hover:bg-[#ffe622]"><Link href={localizeHref('/saved')} aria-label={words.saved}><Heart className="size-5" aria-hidden="true" /></Link></Button>
              <Button asChild variant="ghost" size="icon" className="size-11 rounded-none hover:bg-[#ffe622]"><Link href={localizeHref('/compare')} aria-label={words.compare}><Columns2 className="size-5" aria-hidden="true" /></Link></Button>
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto size-12 rounded-none hover:bg-[#ffe622] lg:ml-2 xl:ml-3" aria-label={copy.common.openMenu}>
                  <Menu className="size-7" strokeWidth={1.5} aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent closeLabel={copy.common.closeMenu} className={cn(styles.fonts, 'overflow-y-auto border-l border-black bg-[#faf9f6] p-6 text-black motion-reduce:animate-none motion-reduce:transition-none')} lang={locale}>
                <SheetHeader className="pt-8">
                  <SheetTitle className="text-2xl font-bold text-black">{words.menuTitle}</SheetTitle>
                  <SheetDescription className="text-neutral-600">{words.menuDescription}</SheetDescription>
                </SheetHeader>
                <div className="my-5">{searchForm(false, 'menu')}</div>
                <nav aria-label={words.menu} className="grid">
                  {navigation.map(({ icon: Icon, ...item }) => (
                    <SheetClose asChild key={item.title}>
                      <Link href={item.href} className={cn(focus, 'group flex min-h-14 items-center gap-3 border-b border-black/15 py-3 font-semibold')}>
                        <Icon size={20} aria-hidden="true" />{item.title}<ArrowUpRight className="ml-auto size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-6 grid gap-2 border-t border-black/15 pt-5">
                  <SheetClose asChild><Link href={localizeHref(ROUTES.LOGIN)} className={cn(focus, 'flex min-h-12 items-center justify-between border border-black px-4 font-semibold hover:bg-[#ffe622]')}>{copy.header.login}<ArrowRight className="size-4" /></Link></SheetClose>
                  <SheetClose asChild><Link href={localizeHref(ROUTES.CONTACT)} className={cn(focus, 'flex min-h-12 items-center justify-between border border-black px-4 font-semibold hover:bg-[#ffe622]')}>{words.contact}<ArrowRight className="size-4" /></Link></SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </header>

      <div className="h-20" aria-hidden="true" />

      <nav aria-label={copy.common.mobileNavigation} className={cn(styles.fonts, 'fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-black/25 bg-[#101010] pb-[env(safe-area-inset-bottom)] text-white md:hidden', 'transition-transform duration-300 ease-out motion-reduce:transition-none', scrollHeaderState.isVisible ? 'translate-y-0' : 'translate-y-full')}>
        <Link href={localizeHref(ROUTES.HOME)} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 border-r border-white/20 text-[10px] font-semibold', currentPath === ROUTES.HOME && 'bg-[#ffe622] text-black')}><House className="size-5" aria-hidden="true" />{copy.common.home}</Link>
        <Link href={localizeHref(ROUTES.PRODUCTS)} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 border-r border-white/20 text-[10px] font-semibold', currentPath === ROUTES.PRODUCTS && 'bg-[#ffe622] text-black')}><Grid2X2 className="size-5" aria-hidden="true" />{copy.common.products}</Link>
        <Link href={localizeHref('/compare')} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 border-r border-white/20 text-[10px] font-semibold', currentPath === '/compare' && 'bg-[#ffe622] text-black')}><Columns2 className="size-5" aria-hidden="true" />{words.compare}</Link>
        <Link href={localizeHref('/saved')} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 text-[10px] font-semibold', currentPath === '/saved' && 'bg-[#ffe622] text-black')}><Heart className="size-5" aria-hidden="true" />{words.saved}</Link>
      </nav>
    </>
  );
}
