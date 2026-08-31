'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/lib/utils/error';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { stripLocalePrefix } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';
import { storefrontService } from '../services/storefront.service';
import type {
  CreateStorefrontOrderRequest,
  FavoriteListParams,
  OrderListParams,
  ProductListParams,
  StorefrontFavoriteIds,
  StorefrontProductDetail,
} from '../types/storefront.types';

export const storefrontKeys = {
  all: ['storefront'] as const,
  home: () => [...storefrontKeys.all, 'home'] as const,
  products: (params: ProductListParams) => [...storefrontKeys.all, 'products', params] as const,
  productSuggestions: (search: string) => [...storefrontKeys.all, 'product-suggestions', search] as const,
  product: (slug: string) => [...storefrontKeys.all, 'product', slug] as const,
  favoritesRoot: () => [...storefrontKeys.all, 'favorites'] as const,
  favorites: (params: FavoriteListParams) => [...storefrontKeys.favoritesRoot(), params] as const,
  favoriteIds: () => [...storefrontKeys.all, 'favorite-ids'] as const,
  cart: () => [...storefrontKeys.all, 'cart'] as const,
  ordersRoot: () => [...storefrontKeys.all, 'orders'] as const,
  orders: (params: OrderListParams) => [...storefrontKeys.ordersRoot(), params] as const,
};

interface ToggleFavoriteVariables {
  productId: string;
  productSlug: string;
  isFavorite: boolean;
}

function currentAppPath(pathname: string | null, searchParams: { toString: () => string }): string {
  const routePath = stripLocalePrefix(pathname || ROUTES.HOME).path;
  const queryString = searchParams.toString();
  return queryString ? `${routePath}?${queryString}` : routePath;
}

export function useStorefrontHome() {
  return useQuery({
    queryKey: storefrontKeys.home(),
    queryFn: () => storefrontService.getHome(),
  });
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: storefrontKeys.products(params),
    queryFn: () => storefrontService.getProducts(params),
  });
}

export function useProductSearchSuggestions(search: string) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: storefrontKeys.productSuggestions(normalizedSearch),
    queryFn: () =>
      storefrontService.getProducts({
        search: normalizedSearch,
        limit: 5,
        page: 1,
        sort: 'featured',
      }),
    enabled: normalizedSearch.length >= 2,
    staleTime: 30_000,
  });
}

export function useProduct(slug: string, initialData?: StorefrontProductDetail) {
  return useQuery({
    queryKey: storefrontKeys.product(slug),
    queryFn: () => storefrontService.getProduct(slug),
    enabled: Boolean(slug),
    initialData,
  });
}

export function useFavorites(params: FavoriteListParams = {}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: storefrontKeys.favorites(params),
    queryFn: () => storefrontService.getFavorites(params),
    enabled: isAuthenticated,
  });
}

export function useFavoriteIds() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: storefrontKeys.favoriteIds(),
    queryFn: () => storefrontService.getFavoriteIds(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const copy = useLocaleCopy();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localizeHref = useLocalizedPath();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const mutation = useMutation<unknown, unknown, ToggleFavoriteVariables, { previousIds?: StorefrontFavoriteIds }>({
    mutationFn: ({ productSlug, isFavorite }: ToggleFavoriteVariables) =>
      isFavorite ? storefrontService.removeFavorite(productSlug) : storefrontService.addFavorite(productSlug),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: storefrontKeys.favoriteIds() });
      const previousIds = queryClient.getQueryData<StorefrontFavoriteIds>(storefrontKeys.favoriteIds());

      queryClient.setQueryData<StorefrontFavoriteIds>(storefrontKeys.favoriteIds(), (current) => {
        const productIds = current?.productIds ?? [];
        return {
          productIds: variables.isFavorite
            ? productIds.filter((productId) => productId !== variables.productId)
            : Array.from(new Set([...productIds, variables.productId])),
        };
      });

      return { previousIds };
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.isFavorite ? copy.dashboard.favorites.removedToast : copy.dashboard.favorites.addedToast);
    },
    onError: (error, _variables, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(storefrontKeys.favoriteIds(), context.previousIds);
      }
      toast.error(getErrorMessage(error, copy));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: storefrontKeys.favoriteIds() });
      queryClient.invalidateQueries({ queryKey: storefrontKeys.favoritesRoot() });
    },
  });

  return {
    ...mutation,
    toggleFavorite: (variables: ToggleFavoriteVariables) => {
      if (!isAuthenticated) {
        const loginHref = `${localizeHref(ROUTES.LOGIN)}?from=${encodeURIComponent(currentAppPath(pathname, searchParams))}`;
        router.push(loginHref);
        return;
      }

      mutation.mutate(variables);
    },
  };
}

export function useCart() {
  return useQuery({
    queryKey: storefrontKeys.cart(),
    queryFn: () => storefrontService.getCart(),
  });
}

export function useOrders(params: OrderListParams = {}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: storefrontKeys.orders(params),
    queryFn: () => storefrontService.getOrders(params),
    enabled: isAuthenticated,
  });
}

function useCartMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  successMessage?: string,
) {
  const queryClient = useQueryClient();
  const copy = useLocaleCopy();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontKeys.cart() });
      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, copy));
    },
  });
}

export function useAddCartItem() {
  const copy = useLocaleCopy();

  return useCartMutation(
    ({ productSlug, quantity }: { productSlug: string; quantity?: number }) =>
      storefrontService.addCartItem(productSlug, quantity ?? 1),
    copy.cart.itemAddedToast,
  );
}

export function useUpdateCartItem() {
  return useCartMutation(({ itemId, quantity }: { itemId: string; quantity: number }) =>
    storefrontService.updateCartItem(itemId, quantity),
  );
}

export function useRemoveCartItem() {
  return useCartMutation((itemId: string) => storefrontService.removeCartItem(itemId));
}

export function useClearCart() {
  const copy = useLocaleCopy();
  return useCartMutation(() => storefrontService.clearCart(), copy.cart.cartClearedToast);
}

export function useApplyPromo() {
  const copy = useLocaleCopy();
  return useCartMutation((code: string) => storefrontService.applyPromo(code), copy.cart.promoAppliedToast);
}

export function useRemovePromo() {
  return useCartMutation(() => storefrontService.removePromo());
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const copy = useLocaleCopy();

  return useMutation({
    mutationFn: (data: CreateStorefrontOrderRequest) => storefrontService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontKeys.cart() });
      queryClient.invalidateQueries({ queryKey: storefrontKeys.ordersRoot() });
      toast.success(copy.checkout.successToast);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, copy));
    },
  });
}
