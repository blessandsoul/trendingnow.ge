import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import {
  addLocalCartItem,
  clearLocalCart,
  getLocalCart,
  getLocalProduct,
  getLocalProducts,
  localStorefrontHome,
  removeLocalCartItem,
  updateLocalCartItem,
} from '../data/local-storefront';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type {
  ProductListParams,
  CreateStorefrontOrderRequest,
  FavoriteListParams,
  OrderListParams,
  StorefrontCart,
  StorefrontFavoriteIds,
  StorefrontFavoriteMutation,
  StorefrontFavoriteRemoval,
  StorefrontHome,
  StorefrontOrder,
  StorefrontOrderCreateResult,
  StorefrontProduct,
  StorefrontProductDetail,
} from '../types/storefront.types';

class StorefrontService {
  async getHome(): Promise<StorefrontHome> {
    try {
      const response = await apiClient.get<ApiResponse<StorefrontHome>>(API_ENDPOINTS.STOREFRONT.HOME);
      return response.data.data;
    } catch {
      return localStorefrontHome;
    }
  }

  async getProducts(params: ProductListParams = {}): Promise<PaginatedApiResponse<StorefrontProduct>['data']> {
    try {
      const response = await apiClient.get<PaginatedApiResponse<StorefrontProduct>>(
        API_ENDPOINTS.STOREFRONT.PRODUCTS,
        { params },
      );
      return response.data.data;
    } catch {
      return getLocalProducts(params);
    }
  }

  async getProduct(slug: string): Promise<StorefrontProductDetail> {
    try {
      const response = await apiClient.get<ApiResponse<StorefrontProductDetail>>(
        API_ENDPOINTS.STOREFRONT.PRODUCT_DETAIL(slug),
      );
      return response.data.data;
    } catch {
      const product = getLocalProduct(slug);
      if (!product) throw new Error('Product not found');
      return product;
    }
  }

  async getFavorites(params: FavoriteListParams = {}): Promise<PaginatedApiResponse<StorefrontProduct>['data']> {
    const response = await apiClient.get<PaginatedApiResponse<StorefrontProduct>>(
      API_ENDPOINTS.STOREFRONT.FAVORITES,
      { params },
    );
    return response.data.data;
  }

  async getFavoriteIds(): Promise<StorefrontFavoriteIds> {
    const response = await apiClient.get<ApiResponse<StorefrontFavoriteIds>>(
      API_ENDPOINTS.STOREFRONT.FAVORITE_IDS,
    );
    return response.data.data;
  }

  async addFavorite(productSlug: string): Promise<StorefrontFavoriteMutation> {
    const response = await apiClient.post<ApiResponse<StorefrontFavoriteMutation>>(
      API_ENDPOINTS.STOREFRONT.FAVORITES,
      { productSlug },
    );
    return response.data.data;
  }

  async removeFavorite(productSlug: string): Promise<StorefrontFavoriteRemoval> {
    const response = await apiClient.delete<ApiResponse<StorefrontFavoriteRemoval>>(
      API_ENDPOINTS.STOREFRONT.FAVORITE_PRODUCT(productSlug),
    );
    return response.data.data;
  }

  async getCart(): Promise<StorefrontCart> {
    return getLocalCart();
  }

  async addCartItem(productSlug: string, quantity = 1): Promise<StorefrontCart> {
    return addLocalCartItem(productSlug, quantity);
  }

  async updateCartItem(itemId: string, quantity: number): Promise<StorefrontCart> {
    return updateLocalCartItem(itemId, quantity);
  }

  async removeCartItem(itemId: string): Promise<StorefrontCart> {
    return removeLocalCartItem(itemId);
  }

  async clearCart(): Promise<StorefrontCart> {
    return clearLocalCart();
  }

  async applyPromo(code: string): Promise<StorefrontCart> {
    void code;
    return getLocalCart();
  }

  async removePromo(): Promise<StorefrontCart> {
    return getLocalCart();
  }

  async createOrder(data: CreateStorefrontOrderRequest): Promise<StorefrontOrderCreateResult> {
    const response = await apiClient.post<ApiResponse<StorefrontOrderCreateResult>>(
      API_ENDPOINTS.STOREFRONT.ORDERS,
      data,
    );
    clearLocalCart();
    return response.data.data;
  }

  async getOrders(params: OrderListParams = {}): Promise<PaginatedApiResponse<StorefrontOrder>['data']> {
    const response = await apiClient.get<PaginatedApiResponse<StorefrontOrder>>(
      API_ENDPOINTS.STOREFRONT.ORDERS,
      { params },
    );
    return response.data.data;
  }
}

export const storefrontService = new StorefrontService();
