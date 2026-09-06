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
  ShoppingCart,
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
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

import { CartDrawer } from './CartDrawer';
import styles from './BoldDiscoveryHome.module.css';
import {
  INITIAL_SCROLL_HEADER_STATE,
  nextScrollHeaderState,
  settleScrollHeaderGesture,
} from './scroll-header';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ed6b3c]';
const HEADER_GESTURE_SETTLE_MS = 220;

export function StorefrontHeader(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [scrollHeaderState, setScrollHeaderState] = useState(INITIAL_SCROLL_HEADER_STATE);

  const catalog = (query: string): string => localizeHref(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`);
  const currentPath = pathname.replace(/^\/(ka|en|ru)(?=\/|$)/, '') || '/';
  const navigation = [
    { title: 'აღმოაჩინე', icon: Sparkles, href: localizeHref(ROUTES.HOME), current: currentPath === ROUTES.HOME },
    { title: 'საჩუქრები', icon: Gift, href: catalog('gift'), current: currentPath === ROUTES.PRODUCTS && searchParams.get('search') === 'gift' },
    { title: 'სახლი', icon: House, href: catalog('home'), current: currentPath === ROUTES.PRODUCTS && searchParams.get('search') === 'home' },
    { title: 'ტექნიკა', icon: Headphones, href: catalog('tech'), current: currentPath === ROUTES.PRODUCTS && searchParams.get('search') === 'tech' },
    { title: 'რჩევები', icon: BookOpen, href: localizeHref(ROUTES.BLOG), current: currentPath === ROUTES.BLOG },
    { title: 'შენახული', icon: Heart, href: localizeHref(ROUTES.DASHBOARD_FAVORITES), current: currentPath.startsWith(ROUTES.DASHBOARD_FAVORITES) },
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

  const searchForm = (compact = false): React.ReactElement => (
    <form onSubmit={submitSearch} role="search" className={cn('flex min-w-0', compact ? 'w-full' : 'w-full max-w-[430px] xl:max-w-[520px]')}>
      <label className="sr-only" htmlFor={compact ? 'discovery-search-compact' : 'discovery-search'}>{copy.header.searchAria}</label>
      <Input
        id={compact ? 'discovery-search-compact' : 'discovery-search'}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
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
            <Link href={localizeHref(ROUTES.HOME)} className={cn(styles.wordmark, focus, 'shrink-0 text-[29px] leading-none tracking-[-1px] sm:text-[35px]')} aria-label="TrendingNow.ge — მთავარი">
              TrendingNow.ge
            </Link>

            <nav aria-label="მთავარი ნავიგაცია" className="ml-auto hidden items-center gap-4 xl:flex 2xl:gap-7">
              {navigation.map(({ icon: Icon, ...item }) => (
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
              <CartDrawer renderTrigger={({ itemCount }) => (
                <button type="button" aria-label={copy.cart.title} className={cn(focus, 'relative grid size-11 place-items-center border border-black/30 bg-white transition-colors hover:bg-[#ffe622]')}>
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  {itemCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#092bb4] text-[10px] font-bold text-white">{itemCount}</span>}
                </button>
              )} />
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto size-12 rounded-none hover:bg-[#ffe622] lg:ml-2 xl:ml-3" aria-label={copy.common.openMenu}>
                  <Menu className="size-7" strokeWidth={1.5} aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent closeLabel={copy.common.closeMenu} className={cn(styles.fonts, 'overflow-y-auto border-l border-black bg-[#faf9f6] p-6 text-black motion-reduce:animate-none motion-reduce:transition-none')} lang="ka">
                <SheetHeader className="pt-8">
                  <SheetTitle className="text-2xl font-bold text-black">აღმოაჩინე შენი შემდეგი რჩეული</SheetTitle>
                  <SheetDescription className="text-neutral-600">ნივთები და იდეები ყოველდღიურობისთვის.</SheetDescription>
                </SheetHeader>
                <div className="my-5">{searchForm()}</div>
                <nav aria-label="საიტის მენიუ" className="grid">
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
                  <SheetClose asChild><Link href={localizeHref(ROUTES.CART)} className={cn(focus, 'flex min-h-12 items-center justify-between border border-black bg-[#092bb4] px-4 font-semibold text-white hover:bg-[#061e81]')}>{copy.cart.title}<ShoppingCart className="size-4" /></Link></SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </header>

      <div className="h-20" aria-hidden="true" />

      <nav aria-label={copy.common.mobileNavigation} className={cn(styles.fonts, 'fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-black/25 bg-[#101010] text-white md:hidden', 'transition-transform duration-300 ease-out motion-reduce:transition-none', scrollHeaderState.isVisible ? 'translate-y-0' : 'translate-y-full')}>
        <Link href={localizeHref(ROUTES.HOME)} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 border-r border-white/20 text-[10px] font-semibold', currentPath === ROUTES.HOME && 'bg-[#ffe622] text-black')}><House className="size-5" aria-hidden="true" />{copy.common.home}</Link>
        <Link href={localizeHref(ROUTES.PRODUCTS)} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 border-r border-white/20 text-[10px] font-semibold', currentPath === ROUTES.PRODUCTS && 'bg-[#ffe622] text-black')}><Grid2X2 className="size-5" aria-hidden="true" />{copy.common.products}</Link>
        <CartDrawer renderTrigger={({ itemCount }) => (
          <button type="button" aria-label={copy.cart.title} className={cn(focus, 'relative flex min-h-[66px] flex-col items-center justify-center gap-1 border-r border-white/20 text-[10px] font-semibold hover:bg-[#ffe622] hover:text-black')}><ShoppingCart className="size-5" aria-hidden="true" />{itemCount > 0 && <span className="absolute right-[calc(50%-20px)] top-2 grid size-4 place-items-center rounded-full bg-[#ffe622] text-[9px] font-bold text-black">{itemCount}</span>}{copy.cart.title}</button>
        )} />
        <Link href={localizeHref(ROUTES.DASHBOARD_FAVORITES)} className={cn(focus, 'flex min-h-[66px] flex-col items-center justify-center gap-1 text-[10px] font-semibold', currentPath.startsWith(ROUTES.DASHBOARD_FAVORITES) && 'bg-[#ffe622] text-black')}><Heart className="size-5" aria-hidden="true" />{copy.dashboard.favorites.title}</Link>
      </nav>
    </>
  );
}
