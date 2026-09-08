import type { ProductListParams } from '../types/storefront.types';

const categoryAliases: Record<string, string> = {
  home: 'home', house: 'home',
  tech: 'tech', technology: 'tech', electronics: 'tech', technique: 'tech',
  workspace: 'workspace', office: 'workspace', work: 'workspace',
  kitchen: 'kitchen', cooking: 'kitchen',
  care: 'care', beauty: 'care',
  fashion: 'fashion', style: 'fashion', outdoor: 'sport', sport: 'sport',
};

// Retain old bookmarked discovery links while using the real filter contract.
export function normalizeCatalogParams(params: ProductListParams): ProductListParams {
  const category = params.category?.trim().toLowerCase();
  const normalizedCategory = category ? categoryAliases[category] ?? category : undefined;
  const query = params.search?.trim().toLowerCase();
  if (!query) return normalizedCategory && normalizedCategory !== params.category ? { ...params, category: normalizedCategory } : params;
  const searchCategory = categoryAliases[query];
  if (searchCategory && !params.category) return { ...params, search: undefined, category: searchCategory };
  if (query === 'bag') return { ...params, search: 'ზურგჩანთა' };
  if (query === 'gift') return { ...params, search: undefined, maxPrice: params.maxPrice ?? 60 };
  return params;
}

export function discoveryCatalogHref(query: string): string {
  const params = normalizeCatalogParams({ search: query });
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.search) search.set('search', params.search);
  if (params.maxPrice !== undefined) search.set('maxPrice', String(params.maxPrice));
  return `/products?${search}`;
}
