'use client';

import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Grid3X3, ListFilter, Search, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocaleCopy } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { NewsletterBand } from './NewsletterBand';
import { ProductCard } from './ProductCard';
import { PromoCard, promoBanners } from './PromoBanners';
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
}: {
  categories: StorefrontCategory[];
  activeCategory?: string;
  activeSearch?: string;
  onSetParam: (name: string, value?: string, options?: { scrollToCatalog?: boolean }) => void;
  onSetPriceRange: (min: string, max: string) => void;
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
    <aside className="rounded-[8px] border border-[#DFE6EF] bg-white p-4 lg:sticky lg:top-[150px] lg:self-start">
      <form onSubmit={submitSearch} className="mb-5 border-b border-[#E3E8EF] pb-4">
        <label htmlFor="catalog-filter-search" className="mb-2 block text-sm font-bold text-[#11141B]">
          {copy.products.filterSearchLabel}
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8B96A5]" />
            <Input
              id="catalog-filter-search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={copy.products.filterSearchPlaceholder}
              autoComplete="off"
              className="h-10 rounded-[7px] border-[#DFE6EF] bg-white pl-9 pr-8 text-sm"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8B96A5] hover:bg-[#EEF2F6] hover:text-[#11141B]"
                aria-label={copy.products.clearSearchAria}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="icon-lg" className="rounded-[9px] bg-[#11141B] text-white hover:bg-[#252A33]" aria-label={copy.products.searchCatalogAria}>
            <Search className="size-4" />
          </Button>
        </div>
      </form>

      <div className="mb-4 flex items-center gap-2 text-base font-extrabold text-[#11141B]">
        <ListFilter className="size-5" />
        {copy.products.categories}
      </div>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSetParam('category', undefined, { scrollToCatalog: true })}
          className={cn('flex w-full justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted', !activeCategory && 'font-bold text-warning')}
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
                  className={cn('flex w-full min-w-0 justify-between gap-3 rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted', activeCategory === category.slug && 'font-bold text-warning')}
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
                    className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ChevronDown className={cn('size-4 transition-transform', isExpanded && 'rotate-180')} />
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
                      className={cn('flex w-full justify-between gap-3 rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted', activeCategory === child.slug && 'font-bold text-warning')}
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
        <h3 className="mb-3 text-sm font-bold text-[#11141B]">{copy.products.price}</h3>
        <div className="grid gap-2">
          {priceRanges.map((range) => (
            <Button
              key={range.label}
              type="button"
              variant="outline"
              className="h-9 justify-start rounded-[7px] border-[#DFE6EF] text-[#526071]"
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
  const params = useProductParams();
  const { data: home } = useStorefrontHome();
  const { data, isLoading, error } = useProducts(params);
  const productsHeroPromo = copy.promoBanners[2] ?? copy.promoBanners[0] ?? promoBanners[0];

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
    <div className="min-h-dvh bg-[#F5F7FA] text-[#11141B]">
      <StorefrontHeader />

      <main>
        <section className="storefront-container grid gap-5 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.84fr)]">
          <div>
            <p className="text-sm text-[#6B7685]">{copy.products.breadcrumb}</p>
            <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] text-[#11141B] text-balance sm:text-4xl">{copy.products.title}</h1>
            <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#6B7685]">
              {copy.products.intro}
            </p>
          </div>
          <PromoCard banner={productsHeroPromo} className="hidden min-h-[144px] lg:block" priority />
        </section>

        <section className="storefront-container grid gap-6 lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            key={params.search ?? ''}
            categories={home?.categories ?? []}
            activeCategory={params.category}
            activeSearch={params.search}
            onSetParam={setParam}
            onSetPriceRange={setPriceRange}
          />

          <div ref={catalogProductsRef} id="catalog-products" className="min-w-0 scroll-mt-[112px] lg:scroll-mt-[150px]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-[#6B7685]">
                {copy.products.shownProducts(data?.pagination.totalItems ?? 0)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={params.sort ?? 'featured'} onValueChange={(value) => setParam('sort', value)}>
                  <SelectTrigger className="h-10 w-full rounded-[7px] border-[#DFE6EF] bg-white sm:w-[240px]">
                    <SelectValue placeholder={copy.products.sortPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">{copy.products.sortFeatured}</SelectItem>
                    <SelectItem value="newest">{copy.products.sortNewest}</SelectItem>
                    <SelectItem value="price-asc">{copy.products.sortPriceAsc}</SelectItem>
                    <SelectItem value="price-desc">{copy.products.sortPriceDesc}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="icon-lg" variant="outline" className="rounded-[7px] border-[#DFE6EF]">
                  <Grid3X3 className="size-5" />
                </Button>
                <Button type="button" size="icon-lg" variant="outline" className="rounded-[7px] border-[#DFE6EF] lg:hidden">
                  <SlidersHorizontal className="size-5" />
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className={productGridClass}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="h-[328px] animate-pulse rounded-[8px] border border-[#E3E8EF] bg-white" />
                ))}
              </div>
            )}
            {error && (
              <div className="rounded-[8px] border border-[#F2D0D0] bg-[#FFF5F5] px-4 py-3 text-sm text-[#A23A3A]">
                {copy.products.loadingError}
              </div>
            )}
            {data && data.items.length === 0 && (
              <div className="rounded-[8px] border border-[#DFE6EF] bg-[#F7F9FB] px-5 py-10 text-center text-[#526071]">
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

            <div className="mt-6 flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map((page) => (
                <Button
                  key={page}
                  type="button"
                  variant={params.page === page ? 'default' : 'outline'}
                  size="icon-sm"
                  className={cn('rounded-[8px]', params.page === page ? 'bg-[#11141B] text-white hover:bg-[#252A33]' : 'border-[#DDE2E9]')}
                  onClick={() => setParam('page', String(page))}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="storefront-container mt-8">
          <h2 className="mb-4 text-xl font-extrabold">{copy.products.recent}</h2>
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
