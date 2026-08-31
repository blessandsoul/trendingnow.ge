import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type {
  IAdminUser,
  IAdminUserDetail,
  IAdminSession,
  IAdminOrder,
  IDashboardStats,
  IAdminHomepageConfig,
  IAdminHomeHero,
  IAdminHomeHeroSlide,
  IAdminHomeNewsletter,
  IAdminHomeProductRow,
  IAdminHomePromoBanner,
  IAdminHomeServiceItem,
  IAdminStorefrontCategory,
  IAdminStorefrontProduct,
  IAdminStorefrontSummary,
  ICreateHomeHeroSlideRequest,
  ICreateHomeProductRowRequest,
  ICreateHomePromoBannerRequest,
  ICreateHomeServiceItemRequest,
  ICreateStorefrontCategoryRequest,
  ICreateStorefrontProductRequest,
  IGetUsersParams,
  IGetSessionsParams,
  IGetAdminOrdersParams,
  IGetStorefrontProductsParams,
  IOrderItemsRequest,
  IUpdateHomeHeroRequest,
  IUpdateHomeHeroSlideRequest,
  IUpdateHomeNewsletterRequest,
  IUpdateHomeProductRowItemsRequest,
  IUpdateHomeProductRowRequest,
  IUpdateHomePromoBannerRequest,
  IUpdateHomeServiceItemRequest,
  IUpdateUserStatusRequest,
  IUpdateUserRoleRequest,
  IUpdateStorefrontCategoryRequest,
  IUpdateStorefrontProductRequest,
  IUploadStorefrontAssetRequest,
  IUploadStorefrontAssetResponse,
} from '../types/admin.types';

interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class AdminService {
  // ─── Dashboard Stats ────────────────────────────────────────────────

  async getDashboardStats(): Promise<IDashboardStats> {
    const response = await apiClient.get<ApiResponse<IDashboardStats>>(
      API_ENDPOINTS.ADMIN.STATS,
    );
    return response.data.data;
  }

  // ─── User Management ───────────────────────────────────────────────

  async getUsers(params?: IGetUsersParams): Promise<PaginatedData<IAdminUser>> {
    const response = await apiClient.get<PaginatedApiResponse<IAdminUser>>(
      API_ENDPOINTS.ADMIN.USERS,
      { params },
    );
    return response.data.data;
  }

  async getUserDetail(userId: string): Promise<IAdminUserDetail> {
    const response = await apiClient.get<ApiResponse<IAdminUserDetail>>(
      API_ENDPOINTS.ADMIN.USER_DETAIL(userId),
    );
    return response.data.data;
  }

  async updateUserStatus(
    userId: string,
    data: IUpdateUserStatusRequest,
  ): Promise<IAdminUser> {
    const response = await apiClient.patch<ApiResponse<IAdminUser>>(
      API_ENDPOINTS.ADMIN.USER_STATUS(userId),
      data,
    );
    return response.data.data;
  }

  async updateUserRole(
    userId: string,
    data: IUpdateUserRoleRequest,
  ): Promise<IAdminUser> {
    const response = await apiClient.patch<ApiResponse<IAdminUser>>(
      API_ENDPOINTS.ADMIN.USER_ROLE(userId),
      data,
    );
    return response.data.data;
  }

  // ─── Session Management ────────────────────────────────────────────

  async getSessions(
    params?: IGetSessionsParams,
  ): Promise<PaginatedData<IAdminSession>> {
    const response = await apiClient.get<PaginatedApiResponse<IAdminSession>>(
      API_ENDPOINTS.ADMIN.SESSIONS,
      { params },
    );
    return response.data.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.SESSION_DELETE(sessionId));
  }

  async getOrders(params?: IGetAdminOrdersParams): Promise<PaginatedData<IAdminOrder>> {
    const response = await apiClient.get<PaginatedApiResponse<IAdminOrder>>(
      API_ENDPOINTS.ADMIN.ORDERS,
      { params },
    );
    return response.data.data;
  }

  async getOrderDetail(orderId: string): Promise<IAdminOrder> {
    const response = await apiClient.get<ApiResponse<IAdminOrder>>(
      API_ENDPOINTS.ADMIN.ORDER_DETAIL(orderId),
    );
    return response.data.data;
  }

  async updateOrderStatus(orderId: string, status: IAdminOrder['status']): Promise<IAdminOrder> {
    const response = await apiClient.patch<ApiResponse<IAdminOrder>>(
      API_ENDPOINTS.ADMIN.ORDER_STATUS(orderId),
      { status },
    );
    return response.data.data;
  }

  async getStorefrontSummary(): Promise<IAdminStorefrontSummary> {
    const response = await apiClient.get<ApiResponse<IAdminStorefrontSummary>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_SUMMARY,
    );
    return response.data.data;
  }

  async getStorefrontCategories(): Promise<IAdminStorefrontCategory[]> {
    const response = await apiClient.get<ApiResponse<IAdminStorefrontCategory[]>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_CATEGORIES,
    );
    return response.data.data;
  }

  async createStorefrontCategory(data: ICreateStorefrontCategoryRequest): Promise<IAdminStorefrontCategory> {
    const response = await apiClient.post<ApiResponse<IAdminStorefrontCategory>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_CATEGORIES,
      data,
    );
    return response.data.data;
  }

  async updateStorefrontCategory(
    categoryId: string,
    data: IUpdateStorefrontCategoryRequest,
  ): Promise<IAdminStorefrontCategory> {
    const response = await apiClient.patch<ApiResponse<IAdminStorefrontCategory>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_CATEGORY(categoryId),
      data,
    );
    return response.data.data;
  }

  async updateStorefrontCategoryOrder(data: IOrderItemsRequest): Promise<IAdminStorefrontCategory[]> {
    const response = await apiClient.patch<ApiResponse<IAdminStorefrontCategory[]>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_CATEGORY_ORDER,
      data,
    );
    return response.data.data;
  }

  async deleteStorefrontCategory(categoryId: string): Promise<IAdminStorefrontCategory> {
    const response = await apiClient.delete<ApiResponse<IAdminStorefrontCategory>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_CATEGORY(categoryId),
    );
    return response.data.data;
  }

  async uploadStorefrontAsset({ file, kind, label }: IUploadStorefrontAssetRequest): Promise<IUploadStorefrontAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<IUploadStorefrontAssetResponse>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_ASSETS,
      formData,
      {
        params: { kind, label },
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data.data;
  }

  async getHomepageConfig(): Promise<IAdminHomepageConfig> {
    const response = await apiClient.get<ApiResponse<IAdminHomepageConfig>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME,
    );
    return response.data.data;
  }

  async updateHomeHero(data: IUpdateHomeHeroRequest): Promise<IAdminHomeHero> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeHero>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_HERO,
      data,
    );
    return response.data.data;
  }

  async createHomeHeroSlide(data: ICreateHomeHeroSlideRequest): Promise<IAdminHomeHeroSlide> {
    const response = await apiClient.post<ApiResponse<IAdminHomeHeroSlide>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_HERO_SLIDES,
      data,
    );
    return response.data.data;
  }

  async updateHomeHeroSlide(slideId: string, data: IUpdateHomeHeroSlideRequest): Promise<IAdminHomeHeroSlide> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeHeroSlide>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_HERO_SLIDE(slideId),
      data,
    );
    return response.data.data;
  }

  async updateHomeHeroSlideOrder(data: IOrderItemsRequest): Promise<IAdminHomeHeroSlide[]> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeHeroSlide[]>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_HERO_SLIDE_ORDER,
      data,
    );
    return response.data.data;
  }

  async deleteHomeHeroSlide(slideId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.STOREFRONT_HOME_HERO_SLIDE(slideId));
  }

  async createHomeProductRow(data: ICreateHomeProductRowRequest): Promise<IAdminHomeProductRow> {
    const response = await apiClient.post<ApiResponse<IAdminHomeProductRow>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PRODUCT_ROWS,
      data,
    );
    return response.data.data;
  }

  async updateHomeProductRow(rowId: string, data: IUpdateHomeProductRowRequest): Promise<IAdminHomeProductRow> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeProductRow>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PRODUCT_ROW(rowId),
      data,
    );
    return response.data.data;
  }

  async updateHomeProductRowOrder(data: IOrderItemsRequest): Promise<IAdminHomeProductRow[]> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeProductRow[]>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PRODUCT_ROW_ORDER,
      data,
    );
    return response.data.data;
  }

  async updateHomeProductRowItems(rowId: string, data: IUpdateHomeProductRowItemsRequest): Promise<IAdminHomeProductRow> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeProductRow>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PRODUCT_ROW_ITEMS(rowId),
      data,
    );
    return response.data.data;
  }

  async deleteHomeProductRow(rowId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PRODUCT_ROW(rowId));
  }

  async createHomePromoBanner(data: ICreateHomePromoBannerRequest): Promise<IAdminHomePromoBanner> {
    const response = await apiClient.post<ApiResponse<IAdminHomePromoBanner>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PROMO_BANNERS,
      data,
    );
    return response.data.data;
  }

  async updateHomePromoBanner(bannerId: string, data: IUpdateHomePromoBannerRequest): Promise<IAdminHomePromoBanner> {
    const response = await apiClient.patch<ApiResponse<IAdminHomePromoBanner>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PROMO_BANNER(bannerId),
      data,
    );
    return response.data.data;
  }

  async updateHomePromoBannerOrder(data: IOrderItemsRequest): Promise<IAdminHomePromoBanner[]> {
    const response = await apiClient.patch<ApiResponse<IAdminHomePromoBanner[]>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PROMO_BANNER_ORDER,
      data,
    );
    return response.data.data;
  }

  async deleteHomePromoBanner(bannerId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.STOREFRONT_HOME_PROMO_BANNER(bannerId));
  }

  async createHomeServiceItem(data: ICreateHomeServiceItemRequest): Promise<IAdminHomeServiceItem> {
    const response = await apiClient.post<ApiResponse<IAdminHomeServiceItem>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_SERVICE_ITEMS,
      data,
    );
    return response.data.data;
  }

  async updateHomeServiceItem(itemId: string, data: IUpdateHomeServiceItemRequest): Promise<IAdminHomeServiceItem> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeServiceItem>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_SERVICE_ITEM(itemId),
      data,
    );
    return response.data.data;
  }

  async updateHomeServiceItemOrder(data: IOrderItemsRequest): Promise<IAdminHomeServiceItem[]> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeServiceItem[]>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_SERVICE_ITEM_ORDER,
      data,
    );
    return response.data.data;
  }

  async deleteHomeServiceItem(itemId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN.STOREFRONT_HOME_SERVICE_ITEM(itemId));
  }

  async updateHomeNewsletter(data: IUpdateHomeNewsletterRequest): Promise<IAdminHomeNewsletter> {
    const response = await apiClient.patch<ApiResponse<IAdminHomeNewsletter>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_HOME_NEWSLETTER,
      data,
    );
    return response.data.data;
  }

  async getStorefrontProducts(params?: IGetStorefrontProductsParams): Promise<PaginatedData<IAdminStorefrontProduct>> {
    const response = await apiClient.get<PaginatedApiResponse<IAdminStorefrontProduct>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_PRODUCTS,
      { params },
    );
    return response.data.data;
  }

  async createStorefrontProduct(data: ICreateStorefrontProductRequest): Promise<IAdminStorefrontProduct> {
    const response = await apiClient.post<ApiResponse<IAdminStorefrontProduct>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_PRODUCTS,
      data,
    );
    return response.data.data;
  }

  async updateStorefrontProduct(
    productId: string,
    data: IUpdateStorefrontProductRequest,
  ): Promise<IAdminStorefrontProduct> {
    const response = await apiClient.patch<ApiResponse<IAdminStorefrontProduct>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_PRODUCT(productId),
      data,
    );
    return response.data.data;
  }

  async deactivateStorefrontProduct(productId: string): Promise<IAdminStorefrontProduct> {
    const response = await apiClient.delete<ApiResponse<IAdminStorefrontProduct>>(
      API_ENDPOINTS.ADMIN.STOREFRONT_PRODUCT(productId),
    );
    return response.data.data;
  }
}

export const adminService = new AdminService();
