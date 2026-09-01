'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Grid2X2, Heart, Home, Menu, Search, ShoppingCart, UserRound } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale, useLocaleCopy } from '@/i18n/context';
import { ACTIVE_LOCALES, LOCALE_NAMES, localizedPath, stripLocalePrefix, type ActiveLocale } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { CartDrawer } from './CartDrawer';
import { HeaderTransitionSection } from './HeaderTransitionSection';
import { INITIAL_SCROLL_HEADER_STATE, nextScrollHeaderState } from './scroll-header';
import { TrendingNowWordmark } from './TrendingNowWordmark';
import { useProductSearchSuggestions, useStorefrontHome } from '../hooks/useStorefront';
import { formatGel } from '../lib/format';
import type { StorefrontCategory } from '../types/storefront.types';

type CategoryNavItem = Pick<StorefrontCategory, 'name' | 'slug'>;

type FlagCode = 'ge' | 'gb' | 'ru';

type BottomNavItemKey = 'home' | 'products' | 'cart' | 'favorites';

function localeFlagCode(locale: ActiveLocale): FlagCode {
  return LOCALE_NAMES[locale].flagCode;
}

function LanguageFlag({ code }: { code: FlagCode }): React.ReactElement {
  const flagClassName =
    'block h-[11px] w-[16px] overflow-hidden rounded-[2px] shadow-[inset_0_0_0_1px_rgba(7,21,42,0.18)]';

  if (code === 'ge') {
    return (
      <span className={`relative ${flagClassName}`} aria-hidden="true">
        <span className="absolute inset-0 bg-white" />
        <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-[#E30A17]" />
        <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[#E30A17]" />
        <span className="absolute left-[3px] top-[2px] size-[2px] bg-[#E30A17]" />
        <span className="absolute right-[3px] top-[2px] size-[2px] bg-[#E30A17]" />
        <span className="absolute bottom-[2px] left-[3px] size-[2px] bg-[#E30A17]" />
        <span className="absolute bottom-[2px] right-[3px] size-[2px] bg-[#E30A17]" />
      </span>
    );
  }

  if (code === 'gb') {
    return (
      <span
        className={flagClassName}
        style={{
          backgroundColor: '#012169',
          backgroundImage:
            'linear-gradient(32deg, transparent 43%, #fff 43%, #fff 57%, transparent 57%), linear-gradient(-32deg, transparent 43%, #fff 43%, #fff 57%, transparent 57%), linear-gradient(32deg, transparent 48%, #C8102E 48%, #C8102E 52%, transparent 52%), linear-gradient(-32deg, transparent 48%, #C8102E 48%, #C8102E 52%, transparent 52%), linear-gradient(0deg, transparent 40%, #fff 40%, #fff 60%, transparent 60%), linear-gradient(90deg, transparent 40%, #fff 40%, #fff 60%, transparent 60%), linear-gradient(0deg, transparent 45%, #C8102E 45%, #C8102E 55%, transparent 55%), linear-gradient(90deg, transparent 45%, #C8102E 45%, #C8102E 55%, transparent 55%)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span className={`flex flex-col ${flagClassName}`} aria-hidden="true">
      <span className="h-1/3 bg-white" />
      <span className="h-1/3 bg-[#0039A6]" />
      <span className="h-1/3 bg-[#D52B1E]" />
    </span>
  );
}

export function StorefrontHeader(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname() || ROUTES.HOME;
  const searchParams = useSearchParams();
  const locale = useLocale();
  const copy = useLocaleCopy();
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [scrollHeaderState, setScrollHeaderState] = useState(INITIAL_SCROLL_HEADER_STATE);
  const trimmedSearch = search.trim();
  const { data: suggestions, isFetching: isSuggestionsFetching } = useProductSearchSuggestions(trimmedSearch);
  const suggestionItems = suggestions?.items ?? [];
  const { data: home } = useStorefrontHome();
  const fallbackNavItems: readonly CategoryNavItem[] = copy.header.fallbackNavItems;
  const utilityLinks = copy.header.utilityLinks;
  const navItems: CategoryNavItem[] = (home?.categories.length ? home.categories : fallbackNavItems).slice(0, 8);
  const localizeHref = (path: string): string => localizedPath(locale, path);
  const queryString = searchParams.toString();
  const currentPath = stripLocalePrefix(pathname).path;

  const isActivePath = (href: string): boolean => {
    if (href === ROUTES.HOME) return currentPath === ROUTES.HOME;
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const bottomNavItemClassName = (key: BottomNavItemKey, isActive: boolean): string =>
    cn(
      'relative flex h-16 min-w-0 flex-col items-center justify-center gap-1.5 rounded-[12px] border border-transparent px-1 text-[10px] font-black leading-[1.35] transition-colors min-[380px]:text-[11px]',
      isActive
        ? 'bg-[#11141B] text-white shadow-[0_10px_22px_rgba(17,20,27,0.16)]'
        : 'text-[#69717E] hover:bg-[#F1F3F6] hover:text-[#11141B]',
      key === 'cart' && 'bg-transparent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/60',
    );
  const bottomNavLabelClassName =
    'block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap pb-0.5 text-center leading-[1.35]';

  useEffect(() => {
    let frameId: number | null = null;

    const updateScrollState = (): void => {
      frameId = null;
      setScrollHeaderState((state) => nextScrollHeaderState(state, window.scrollY));
    };

    const handleScroll = (): void => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const languageHref = (targetLocale: ActiveLocale): string => {
    const { path } = stripLocalePrefix(pathname);
    const href = localizedPath(targetLocale, path);
    return queryString ? `${href}?${queryString}` : href;
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    }
    setIsSuggestionsOpen(false);
    router.push(localizeHref(`${ROUTES.PRODUCTS}${params.toString() ? `?${params}` : ''}`));
  };

  const openProduct = (slug: string, name: string): void => {
    setSearch(name);
    setIsSuggestionsOpen(false);
    router.push(localizeHref(ROUTES.PRODUCT_DETAIL(slug)));
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transform-gpu border-b border-[#DDE2E9] bg-white/94 shadow-[0_10px_30px_rgba(17,20,27,0.045)] backdrop-blur-xl',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          scrollHeaderState.isVisible ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <HeaderTransitionSection expanded={!scrollHeaderState.isCompact}>
          <div className="border-b border-[#E9EDF2] bg-[#F5F7FA] text-[11px] text-[#69717E]">
            <div className="storefront-container flex h-7 items-center justify-between gap-3">
              <nav className="no-scrollbar flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap font-semibold text-[#11141B]" aria-label={copy.header.storeInfoAria}>
                {utilityLinks.map((item) => (
                  <Link key={item.href} href={localizeHref(item.href)} className="shrink-0 transition-colors hover:text-[#B4233A]">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="hidden items-center gap-5 whitespace-nowrap font-semibold text-[#11141B] md:flex">
                <span className="inline-flex items-center gap-1">
                  <Link href={localizeHref(ROUTES.LOGIN)} className="transition-colors hover:text-[#B4233A]">
                    {copy.header.login}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <Link href={localizeHref(ROUTES.REGISTER)} className="transition-colors hover:text-[#B4233A]">
                    {copy.header.register}
                  </Link>
                </span>
                <Link href={localizeHref(ROUTES.DASHBOARD_ORDERS)} className="transition-colors hover:text-[#B4233A]">
                  {copy.header.myOrders}
                </Link>
                <div className="group relative">
                  <button
                    type="button"
                    aria-label={copy.language.activeLabel}
                    title={copy.language.activeName}
                    className="inline-flex h-6 items-center gap-1.5 rounded-[5px] px-1 text-[10px] font-black uppercase tracking-[0.04em] text-[#11141B] transition-colors hover:text-[#B4233A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92F49]/35"
                  >
                    <LanguageFlag code={localeFlagCode(locale)} />
                    <span>{copy.language.activeCode}</span>
                    <ChevronDown className="size-3" aria-hidden="true" />
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 mt-1 min-w-[118px] rounded-[7px] border border-[#E3E8EF] bg-white p-1 text-[11px] shadow-[0_12px_30px_rgba(7,21,42,0.12)] opacity-0 transition-[opacity,visibility] duration-150 ease-out group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {ACTIVE_LOCALES.map((option) => {
                      const isActive = option === locale;
                      const label = LOCALE_NAMES[option].switcherCode;
                      const className = 'flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left font-black uppercase tracking-[0.04em] text-[#11141B] hover:bg-[#F1F3F6]';
                      const content = (
                        <>
                          <LanguageFlag code={localeFlagCode(option)} />
                          <span>{label}</span>
                        </>
                      );

                      return isActive ? (
                        <span key={option} className={`${className} bg-[#F7F9FB]`} aria-current="true">
                          {content}
                        </span>
                      ) : (
                        <Link key={option} href={languageHref(option)} className={className}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeaderTransitionSection>

        <div
          className={cn(
            'storefront-container flex flex-wrap items-center gap-x-3 transition-[padding,row-gap] duration-300 ease-out md:flex-nowrap',
            scrollHeaderState.isCompact ? 'gap-y-0 py-2' : 'gap-y-3 py-3',
          )}
        >
        <Link
          href={localizeHref(ROUTES.HOME)}
          className="mr-auto shrink-0 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4057]/55 focus-visible:ring-offset-4 md:mr-0"
          aria-label={copy.header.homeAria}
        >
          <TrendingNowWordmark
            className={cn(
              'transition-[width,height] duration-200',
              scrollHeaderState.isCompact
                ? 'h-[30px] w-[150px] sm:h-8 sm:w-[160px]'
                : 'h-8 w-[160px] sm:h-9 sm:w-[180px] xl:h-10 xl:w-[200px]',
            )}
          />
        </Link>

        <Button
          asChild
          aria-hidden={scrollHeaderState.isCompact}
          className={cn(
            'hidden h-10 max-w-48 shrink-0 overflow-hidden whitespace-nowrap rounded-[9px] bg-[#11141B] font-bold text-white',
            'transition-[max-width,padding,opacity] duration-300 ease-out hover:bg-[#252A33] lg:inline-flex',
            scrollHeaderState.isCompact
              ? 'invisible max-w-0 border-0 px-0 opacity-0'
              : 'visible max-w-48 px-4 opacity-100',
          )}
        >
          <Link href={localizeHref(ROUTES.PRODUCTS)}>
            <Menu className="size-4" />
            {copy.header.categories}
          </Link>
        </Button>

        <form
          onSubmit={submitSearch}
          className={cn(
            'relative order-3 flex w-full min-w-0 overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
            'md:visible md:order-none md:mx-auto md:w-auto md:max-w-[520px] md:flex-1 md:overflow-visible md:opacity-100 lg:max-w-[620px] xl:max-w-[700px]',
            scrollHeaderState.isCompact
              ? 'invisible max-h-0 opacity-0'
              : 'visible max-h-24 opacity-100',
          )}
        >
          <div className="relative min-w-0 flex-1">
            <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setIsSuggestionsOpen(true);
            }}
            onFocus={() => setIsSuggestionsOpen(true)}
            onBlur={() => setIsSuggestionsOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsSuggestionsOpen(false);
              }
            }}
            placeholder={copy.header.searchPlaceholder}
            autoComplete="off"
            aria-expanded={isSuggestionsOpen && trimmedSearch.length >= 2}
            aria-controls="storefront-search-suggestions"
            className="h-11 rounded-l-[10px] rounded-r-none border-[#D4DAE3] bg-[#F7F8FA] text-sm focus-visible:border-[#FF4057] focus-visible:ring-[#FF4057]/15"
            />
            {isSuggestionsOpen && trimmedSearch.length >= 2 && (
              <div
                id="storefront-search-suggestions"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[8px] border border-[#DFE6EF] bg-white shadow-[0_18px_45px_rgba(7,21,42,0.14)]"
              >
                {isSuggestionsFetching && (
                  <div className="px-3 py-3 text-sm text-[#657080]">{copy.header.suggestionsLoading}</div>
                )}
                {!isSuggestionsFetching && suggestionItems.length === 0 && (
                  <div className="px-3 py-3 text-sm text-[#657080]">{copy.header.suggestionsEmpty}</div>
                )}
                {!isSuggestionsFetching &&
                  suggestionItems.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        openProduct(product.slug, product.name);
                      }}
                      className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#EEF2F6] px-3 py-2 text-left last:border-b-0 hover:bg-[#F7F9FB] focus-visible:bg-[#F7F9FB] focus-visible:outline-none"
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-[7px] bg-[#F5F7FA]">
                        <SafeImage src={publicMediaUrl(product.imageUrl)} alt="" fill sizes="44px" className="object-contain p-1" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#11141B]">{product.name}</span>
                        <span className="block truncate text-xs text-[#657080]">{product.category.name}</span>
                      </span>
                      <span className="whitespace-nowrap text-sm font-black text-[#11141B]">{formatGel(product.salePrice)}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-11 w-12 shrink-0 rounded-l-none rounded-r-[10px] bg-[#D92F49] text-white hover:bg-[#B4233A]"
            aria-label={copy.header.searchAria}
          >
            <Search className="size-5" />
          </Button>
        </form>

        <div
          aria-hidden={scrollHeaderState.isCompact}
          className={cn(
            'hidden max-w-28 shrink-0 items-center overflow-hidden transition-[max-width,gap,opacity] duration-300 ease-out lg:flex',
            scrollHeaderState.isCompact
              ? 'invisible max-w-0 gap-0 opacity-0'
              : 'visible max-w-28 gap-2 opacity-100',
          )}
        >
            <Button asChild variant="ghost" size="icon-lg" className="text-[#11141B] hover:bg-[#F1F3F6] hover:text-[#B4233A]">
              <Link href={localizeHref(ROUTES.DASHBOARD_FAVORITES)} aria-label={copy.header.favoritesAria}>
                <Heart className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-lg" className="text-[#11141B] hover:bg-[#F1F3F6] hover:text-[#B4233A]">
              <Link href={localizeHref(ROUTES.LOGIN)} aria-label={copy.header.accountAria}>
                <UserRound className="size-5" />
              </Link>
            </Button>
        </div>

        <CartDrawer />
        </div>

        <HeaderTransitionSection
          expanded={!scrollHeaderState.isCompact}
          className="hidden md:grid"
        >
          <nav className="border-t border-[#E9EDF2]">
            <div className="storefront-container no-scrollbar flex h-11 items-center gap-8 overflow-x-auto text-[13px] font-bold text-[#11141B]">
              {navItems.map((item) => (
                <Link key={item.slug} href={localizeHref(`${ROUTES.PRODUCTS}?category=${item.slug}`)} className="shrink-0 border-b-2 border-transparent py-3 hover:border-[#D92F49] hover:text-[#B4233A]">
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </HeaderTransitionSection>
      </header>

      <nav
        aria-label={copy.common.mobileNavigation}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 transform-gpu border-t border-[#DDE2E9] bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-14px_36px_rgba(17,20,27,0.12)] backdrop-blur md:hidden',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          scrollHeaderState.isVisible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-1 min-[380px]:gap-2">
          <Link
            href={localizeHref(ROUTES.HOME)}
            aria-current={isActivePath(ROUTES.HOME) ? 'page' : undefined}
            className={bottomNavItemClassName('home', isActivePath(ROUTES.HOME))}
          >
            <Home className="size-5" aria-hidden="true" />
            <span className={bottomNavLabelClassName}>{copy.common.home}</span>
          </Link>
          <Link
            href={localizeHref(ROUTES.PRODUCTS)}
            aria-current={isActivePath(ROUTES.PRODUCTS) ? 'page' : undefined}
            className={bottomNavItemClassName('products', isActivePath(ROUTES.PRODUCTS))}
          >
            <Grid2X2 className="size-5" aria-hidden="true" />
            <span className={bottomNavLabelClassName}>{copy.common.products}</span>
          </Link>
          <CartDrawer
            renderTrigger={({ itemCount }) => {
              const isActive = isActivePath(ROUTES.CART);

              return (
                <button
                  type="button"
                  aria-label={copy.cart.title}
                  aria-current={isActive ? 'page' : undefined}
                  className={bottomNavItemClassName('cart', isActive)}
                >
                  <span className="relative">
                    <ShoppingCart className="size-5" aria-hidden="true" />
                    {itemCount > 0 && (
                      <span className="absolute -right-2.5 -top-2.5 grid size-5 place-items-center rounded-full bg-[#D92F49] text-[10px] font-black text-white ring-2 ring-white">
                        {itemCount}
                      </span>
                    )}
                  </span>
                  <span className={bottomNavLabelClassName}>{copy.cart.title}</span>
                </button>
              );
            }}
          />
          <Link
            href={localizeHref(ROUTES.DASHBOARD_FAVORITES)}
            aria-current={isActivePath(ROUTES.DASHBOARD_FAVORITES) ? 'page' : undefined}
            className={bottomNavItemClassName('favorites', isActivePath(ROUTES.DASHBOARD_FAVORITES))}
          >
            <Heart className="size-5" aria-hidden="true" />
            <span className={bottomNavLabelClassName}>{copy.dashboard.favorites.title}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
