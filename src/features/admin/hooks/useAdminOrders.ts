'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { copy } from '@/i18n/copy';
import { getErrorMessage } from '@/lib/utils/error';
import { adminService } from '../services/admin.service';
import type { AdminOrderStatus, IGetAdminOrdersParams } from '../types/admin.types';
import { adminKeys } from './useAdminUsers';

export function useAdminOrders(params: IGetAdminOrdersParams = {}, enabled = true) {
  return useQuery({
    queryKey: adminKeys.orderList(params),
    queryFn: () => adminService.getOrders(params),
    enabled,
  });
}

export function useAdminOrderDetail(orderId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.orderDetail(orderId),
    queryFn: () => adminService.getOrderDetail(orderId),
    enabled: Boolean(orderId) && enabled,
  });
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: AdminOrderStatus }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.setQueryData(adminKeys.orderDetail(order.id), order);
      toast.success(copy.admin.editor.orderStatusUpdated);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
