'use client';

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, ChevronDown, ListFilter, Search, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocaleCopy } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { NewsletterBand } from './NewsletterBand';
import { BuyerNeedFinder } from './BuyerNeedFinder';
import { ProductCard } from './ProductCard';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { useProducts, useStorefrontHome } from '../hooks/useStorefront';
import type { ProductListParams, StorefrontCategory } from '../types/storefront.types';

const productGridClass = 'grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4 2xl:grid-cols-5';

function numberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function useProductParams(): ProductListParams {
  const searchParams = useSearchParams();

  return useMemo(
    () => ({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      minPrice: numberParam(searchParams.get('minPrice')),
      maxPrice: numberParam(searchParams.get('maxPrice')),
      sort: (searchParams.get('sort') as ProductListParams['sort']) ?? 'featured',
      page: numberParam(searchParams.get('page')) ?? 1,
      limit: 12,
    }),
    [searchParams],
  );
}

function FilterSidebar({
  categories,
  activeCategory,
  activeSearch,
  onSetParam,
  onSetPriceRange,
  className,
  id,
  onClose,
}: {
  categories: StorefrontCategory[];
  activeCategory?: string;
  activeSearch?: string;
  onSetParam: (name: string, value?: string, options?: { scrollToCatalog?: boolean }) => void;
  onSetPriceRange: (min: string, max: string) => void;
  className?: string;
  id?: string;
  onClose?: () => void;
}): React.ReactElement {
  const copy = useLocaleCopy();
  const [searchValue, setSearchValue] = useState(activeSearch ?? '');
  const [expandedSlugs, setExpandedSlugs] = useState<string[]>([]);
  const totalProductCount = categories.reduce((sum, category) => sum + category.productCount, 0);
  const priceRanges = [
    { label: '0 - 100 ₾', min: '0', max: '100' },
    { label: '100 - 300 ₾', min: '100', max: '300' },
    { label: '300 - 3000 ₾', min: '300', max: '3000' },
  ];

  const submitSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSetParam('search', searchValue.trim() || undefined);
  };

  const clearSearch = (): void => {
    setSearchValue('');
    onSetParam('search');
  };

  return (
    <aside
      id={id}
      className={cn('tn-commerce-card p-4 lg:sticky lg:top-[150px] lg:self-start', className)}
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#E3E8EF] pb-3 lg:hidden">
        <span className="text-sm font-semibold text-[#101010]">{copy.products.filters}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-none"
          onClick={onClose}
          aria-label={copy.products.closeFiltersAria}
        >
          <X className="size-4" />
        </Button>
      </div>
      <form onSubmit={submitSearch} className="mb-5 border-b border-[#E3E8EF] pb-4">
        <label htmlFor="catalog-filter-search" className="mb-2 block text-sm font-semibold text-[#101010]">
          {copy.products.filterSearchLabel}
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#657080]" />
            <Input
              id="catalog-filter-search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={copy.products.filterSearchPlaceholder}
              autoComplete="off"
              className="h-10 rounded-none border-[#D9DDE7] bg-white pl-9 pr-8 text-sm"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-[#657080] hover:bg-[#EEF2F6] hover:text-[#101010]"
                aria-label={copy.products.clearSearchAria}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="icon-lg" className="tn-primary-action" aria-label={copy.products.searchCatalogAria}>
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </form>

      <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#101010]">
        <ListFilter className="size-5" aria-hidden="true" />
        {copy.products.categories}
      </div>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSetParam('category', undefined, { scrollToCatalog: true })}
          className={cn('flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#526071] hover:bg-[#F4F2ED]', !activeCategory && 'bg-[#FFE622] font-semibold text-[#101010]')}
        >
          <span className="min-w-0 truncate">{copy.common.allProducts}</span>
          <span>{totalProductCount}</span>
        </button>
        {categories.map((category) => {
          const hasChildren = category.children.length > 0;
          const isBranchActive =
            activeCategory === category.slug || category.children.some((child) => child.slug === activeCategory);
          const isExpanded = isBranchActive || expandedSlugs.includes(category.slug);

          return (
            <div key={category.slug}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSetParam('category', category.slug, { scrollToCatalog: true })}
                  className={cn('flex min-h-11 w-full min-w-0 items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#526071] hover:bg-[#F4F2ED]', activeCategory === category.slug && 'bg-[#FFE622] font-semibold text-[#101010]')}
                >
                  <span className="min-w-0 truncate">{category.name}</span>
                  <span>{category.productCount}</span>
                </button>
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSlugs((prev) =>
                        prev.includes(category.slug)
                          ? prev.filter((slug) => slug !== category.slug)
                          : [...prev, category.slug],
                      )}
                    aria-expanded={isExpanded}
                    aria-label={copy.products.toggleSubcategoriesAria(category.name)}
                    className="grid size-11 shrink-0 place-items-center text-[#657080] hover:bg-[#F4F2ED] hover:text-[#101010]"
                  >
                    <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} aria-hidden="true" />
                  </button>
                )}
              </div>
              {hasChildren && isExpanded && (
                <div className="space-y-1 pl-4">
                  {category.children.map((child) => (
                    <button
                      key={child.slug}
                      type="button"
                      onClick={() => onSetParam('category', child.slug, { scrollToCatalog: true })}
                      className={cn('flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#526071] hover:bg-[#F4F2ED]', activeCategory === child.slug && 'bg-[#FFE622] font-semibold text-[#101010]')}
                    >
                      <span className="min-w-0 truncate">{child.name}</span>
                      <span>{child.productCount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[#E3E8EF] pt-4">
        <h3 className="mb-3 text-sm font-semibold text-[#101010]">{copy.products.price}</h3>
        <div className="grid gap-2">
          {priceRanges.map((range) => (
            <Button
              key={range.label}
              type="button"
              variant="outline"
              className="tn-secondary-action h-11 justify-start px-3 text-[#526071]"
              onClick={() => onSetPriceRange(range.min, range.max)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function ProductsStorefront(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = useLocaleCopy();
  const catalogProductsRef = useRef<HTMLDivElement>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const params = useProductParams();
  const { data: home } = useStorefrontHome();
  const { data, isLoading, error } = useProducts(params);
  const totalPages = data?.pagination.totalPages ?? 0;
  const currentPage = data?.pagination.page ?? params.page ?? 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  useEffect(() => {
    if (!data || totalPages < 1 || (params.page ?? 1) <= totalPages) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', String(totalPages));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [data, params.page, pathname, router, searchParams, totalPages]);

  const scrollToCatalogProducts = (): void => {
    window.requestAnimationFrame(() => {
      catalogProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const pushParams = (next: URLSearchParams, options?: { scrollToCatalog?: boolean }): void => {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    if (options?.scrollToCatalog) {
      scrollToCatalogProducts();
    }
  };

  const setParam = (name: string, value?: string, options?: { scrollToCatalog?: boolean }): void => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    if (name !== 'page') {
      next.delete('page');
    }
    pushParams(next, options);
  };

  const setPriceRange = (min: string, max: string): void => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('minPrice', min);
    next.set('maxPrice', max);
    next.delete('page');
    pushParams(next, { scrollToCatalog: true });
  };

  return (
    <div className="tn-page min-h-dvh text-[#101010]">
      <StorefrontHeader />

      <main>
        <section className="bg-[#092BB4] text-white">
          <div className="storefront-container grid w-full min-w-0 max-w-full gap-8 overflow-x-hidden py-10 sm:py-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-center lg:gap-12 lg:py-16">
          <div className="relative z-10 min-w-0 max-w-4xl py-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FFE622]">{copy.products.breadcrumb}</p>
            <h1 className="mt-5 max-w-3xl text-[clamp(2.75rem,7vw,6.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.07em] text-white">
              {copy.products.title}
            </h1>
            <p className="mt-6 w-full max-w-2xl break-words text-sm leading-6 text-white/80 sm:text-base">{copy.products.intro}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.05em]">
              <span className="bg-[#FFE622] px-3 py-2 text-[#101010]">{copy.products.shownProducts(data?.pagination.totalItems ?? 0)}</span>
              <span className="border border-white/35 px-3 py-2 text-white">{copy.products.needFinder.title}</span>
            </div>
          </div>
          <div className="relative z-10 flex min-h-[260px] w-full min-w-0 max-w-full flex-col justify-between overflow-hidden bg-[#FFE622] p-6 text-[#101010] sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em]">TRENDING NOW</p>
              <h2 className="mt-4 max-w-sm text-3xl font-bold uppercase leading-[0.92] tracking-[-0.05em] sm:text-4xl">{copy.products.recent}</h2>
              <p className="mt-4 w-full max-w-sm break-words [overflow-wrap:anywhere] text-sm font-medium leading-6">{copy.products.needFinder.intro}</p>
            </div>
            <a href="#catalog-products" className="mt-8 inline-flex w-fit items-center gap-2 border border-[#101010] px-4 py-2 text-sm font-bold uppercase transition-colors hover:bg-[#101010] hover:text-[#FFE622]">
              {copy.products.filterSearchLabel}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          </div>
        </section>

        <BuyerNeedFinder />

        <section className="storefront-container grid gap-6 lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            key={params.search ?? ''}
            id="catalog-filters"
            className={cn(!mobileFiltersOpen && 'hidden lg:block')}
            categories={home?.categories ?? []}
            activeCategory={params.category}
            activeSearch={params.search}
            onSetParam={setParam}
            onSetPriceRange={setPriceRange}
            onClose={() => setMobileFiltersOpen(false)}
          />

          <div ref={catalogProductsRef} id="catalog-products" className="min-w-0 scroll-mt-[112px] lg:scroll-mt-[150px]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-[#657080]">
                {copy.products.shownProducts(data?.pagination.totalItems ?? 0)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={params.sort ?? 'featured'} onValueChange={(value) => setParam('sort', value)}>
                  <SelectTrigger className="h-10 w-full rounded-none border-[#D9DDE7] bg-white sm:w-[240px]">
                    <SelectValue placeholder={copy.products.sortPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">{copy.products.sortFeatured}</SelectItem>
                    <SelectItem value="newest">{copy.products.sortNewest}</SelectItem>
                    <SelectItem value="price-asc">{copy.products.sortPriceAsc}</SelectItem>
                    <SelectItem value="price-desc">{copy.products.sortPriceDesc}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-none border-[#D9DDE7] px-3 lg:hidden"
                  onClick={() => setMobileFiltersOpen((value) => !value)}
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="catalog-filters"
                >
                  <SlidersHorizontal className="size-5" aria-hidden="true" />
                  {copy.products.filters}
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className={productGridClass}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="h-[328px] animate-pulse border border-[#D9DDE7] bg-white" />
                ))}
              </div>
            )}
            {error && (
              <div className="border border-[#092BB4]/25 bg-[#EEF2FF] px-4 py-3 text-sm text-[#061E81]">
                {copy.products.loadingError}
              </div>
            )}
            {data && data.items.length === 0 && (
              <div className="tn-commerce-card px-5 py-10 text-center text-[#526071]">
                {copy.products.empty}
              </div>
            )}
            {data && data.items.length > 0 && (
              <div className={productGridClass}>
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-2" aria-label={copy.products.paginationAria}>
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  type="button"
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon-sm"
                  className={cn('rounded-none', currentPage === page ? 'bg-[#092BB4] text-white hover:bg-[#061E81]' : 'border-[#D9DDE7]')}
                  onClick={() => setParam('page', String(page))}
                  aria-label={copy.products.pageAria(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Button>
              ))}
              </nav>
            )}
          </div>
        </section>

        <section className="storefront-container mt-8">
          <h2 className="tn-section-title mb-4">{copy.products.recent}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            {(home?.newProducts ?? []).slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>

        <NewsletterBand />
      </main>

      <StorefrontFooter />
    </div>
  );
}
