'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { copy } from '@/i18n/copy';
import { getErrorMessage } from '@/lib/utils/error';
import { storefrontKeys } from '@/features/storefront/hooks/useStorefront';
import { adminService } from '../services/admin.service';
import { adminKeys } from './useAdminUsers';
import type {
  IAdminHomeCategorySection,
  IAdminHomeProductRow,
  ICreateHomeHeroSlideRequest,
  ICreateHomeProductRowRequest,
  ICreateHomePromoBannerRequest,
  ICreateHomeServiceItemRequest,
  ICreateStorefrontCategoryRequest,
  ICreateStorefrontProductRequest,
  IGetStorefrontProductsParams,
  IOrderItemsRequest,
  IUpdateHomeHeroRequest,
  IUpdateHomeHeroSlideRequest,
  IUpdateHomeCategorySectionRequest,
  IUpdateHomeNewsletterRequest,
  IUpdateHomeProductRowItemsRequest,
  IUpdateHomeProductRowRequest,
  IUpdateHomePromoBannerRequest,
  IUpdateHomeServiceItemRequest,
  IUpdateStorefrontCategoryRequest,
  IUpdateStorefrontProductRequest,
  IUploadStorefrontAssetRequest,
} from '../types/admin.types';

export function useAdminStorefrontSummary(enabled = true) {
  return useQuery({
    queryKey: adminKeys.storefrontSummary(),
    queryFn: () => adminService.getStorefrontSummary(),
    enabled,
  });
}

export function useAdminStorefrontCategories(enabled = true) {
  return useQuery({
    queryKey: adminKeys.storefrontCategories(),
    queryFn: () => adminService.getStorefrontCategories(),
    enabled,
  });
}

export function useAdminHomepageConfig(enabled = true) {
  return useQuery({
    queryKey: adminKeys.storefrontHome(),
    queryFn: () => adminService.getHomepageConfig(),
    enabled,
  });
}

function isCategoryProductRow(
  row: IAdminHomeProductRow,
): row is IAdminHomeProductRow & {
  category: NonNullable<IAdminHomeProductRow['category']>;
  categoryId: string;
} {
  return row.source === 'CATEGORY' && Boolean(row.category && row.categoryId);
}

function toHomeCategorySection(row: IAdminHomeProductRow & {
  category: NonNullable<IAdminHomeProductRow['category']>;
  categoryId: string;
}): IAdminHomeCategorySection {
  return {
    id: row.id,
    slot: row.sortOrder,
    title: row.title,
    productLimit: row.productLimit,
    displayOrder: row.sortOrder,
    isActive: row.isActive,
    categoryId: row.categoryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.category,
  };
}

export function useAdminHomeCategorySections(enabled = true) {
  return useQuery({
    queryKey: adminKeys.storefrontHomeSections(),
    queryFn: async () => {
      const config = await adminService.getHomepageConfig();
      return config.productRows.filter(isCategoryProductRow).map(toHomeCategorySection);
    },
    enabled,
  });
}

export function useAdminStorefrontProducts(params: IGetStorefrontProductsParams = {}, enabled = true) {
  return useQuery({
    queryKey: adminKeys.storefrontProducts(params),
    queryFn: () => adminService.getStorefrontProducts(params),
    enabled,
  });
}

function useInvalidateStorefront() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.storefront() });
    queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    queryClient.invalidateQueries({ queryKey: storefrontKeys.all });
  };
}

export function useCreateStorefrontCategory() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: ICreateStorefrontCategoryRequest) => adminService.createStorefrontCategory(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.categoryCreated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateStorefrontCategory() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: IUpdateStorefrontCategoryRequest }) =>
      adminService.updateStorefrontCategory(categoryId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.categoryUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateStorefrontCategoryOrder() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IOrderItemsRequest) => adminService.updateStorefrontCategoryOrder(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.categoryOrderUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteStorefrontCategory() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (categoryId: string) => adminService.deleteStorefrontCategory(categoryId),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.categoryDeleted);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadStorefrontAsset() {
  return useMutation({
    mutationFn: (data: IUploadStorefrontAssetRequest) => adminService.uploadStorefrontAsset(data),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeHero() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IUpdateHomeHeroRequest) => adminService.updateHomeHero(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.heroUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateHomeHeroSlide() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: ICreateHomeHeroSlideRequest) => adminService.createHomeHeroSlide(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.heroSlideAdded);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeHeroSlide() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: IUpdateHomeHeroSlideRequest }) =>
      adminService.updateHomeHeroSlide(slideId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.heroSlideUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeHeroSlideOrder() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IOrderItemsRequest) => adminService.updateHomeHeroSlideOrder(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.heroSlideOrderUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteHomeHeroSlide() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (slideId: string) => adminService.deleteHomeHeroSlide(slideId),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.heroSlideDeleted);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateHomeProductRow() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: ICreateHomeProductRowRequest) => adminService.createHomeProductRow(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productRowCreated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeProductRow() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ rowId, data }: { rowId: string; data: IUpdateHomeProductRowRequest }) =>
      adminService.updateHomeProductRow(rowId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productRowUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeCategorySection() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: IUpdateHomeCategorySectionRequest }) =>
      adminService.updateHomeProductRow(sectionId, {
        title: data.title,
        categoryId: data.categoryId,
        productLimit: data.productLimit,
        sortOrder: data.displayOrder,
        isActive: data.isActive,
        source: 'CATEGORY',
      }),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.homeSectionUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeProductRowOrder() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IOrderItemsRequest) => adminService.updateHomeProductRowOrder(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productRowOrderUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeProductRowItems() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ rowId, data }: { rowId: string; data: IUpdateHomeProductRowItemsRequest }) =>
      adminService.updateHomeProductRowItems(rowId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.manualRowProductsUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteHomeProductRow() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (rowId: string) => adminService.deleteHomeProductRow(rowId),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productRowDeleted);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateHomePromoBanner() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: ICreateHomePromoBannerRequest) => adminService.createHomePromoBanner(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.promoBannerCreated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomePromoBanner() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ bannerId, data }: { bannerId: string; data: IUpdateHomePromoBannerRequest }) =>
      adminService.updateHomePromoBanner(bannerId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.promoBannerUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomePromoBannerOrder() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IOrderItemsRequest) => adminService.updateHomePromoBannerOrder(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.promoBannerOrderUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteHomePromoBanner() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (bannerId: string) => adminService.deleteHomePromoBanner(bannerId),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.promoBannerDeleted);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateHomeServiceItem() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: ICreateHomeServiceItemRequest) => adminService.createHomeServiceItem(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.serviceItemCreated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeServiceItem() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: IUpdateHomeServiceItemRequest }) =>
      adminService.updateHomeServiceItem(itemId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.serviceItemUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeServiceItemOrder() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IOrderItemsRequest) => adminService.updateHomeServiceItemOrder(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.serviceItemOrderUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteHomeServiceItem() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (itemId: string) => adminService.deleteHomeServiceItem(itemId),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.serviceItemDeleted);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateHomeNewsletter() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: IUpdateHomeNewsletterRequest) => adminService.updateHomeNewsletter(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.newsletterUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateStorefrontProduct() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (data: ICreateStorefrontProductRequest) => adminService.createStorefrontProduct(data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productCreated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateStorefrontProduct() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: IUpdateStorefrontProductRequest }) =>
      adminService.updateStorefrontProduct(productId, data),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productUpdated);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeactivateStorefrontProduct() {
  const invalidate = useInvalidateStorefront();

  return useMutation({
    mutationFn: (productId: string) => adminService.deactivateStorefrontProduct(productId),
    onSuccess: () => {
      invalidate();
      toast.success(copy.admin.toasts.productHidden);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
