'use client';

import { useQuery } from '@tanstack/react-query';

import { adminService } from '../services/admin.service';
import { adminKeys } from './useAdminUsers';

import type { IDashboardStats } from '../types/admin.types';

interface UseAdminStatsReturn {
  stats: IDashboardStats | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useAdminStats = (enabled = true): UseAdminStatsReturn => {
  const { data, isLoading, error } = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getDashboardStats(),
    enabled,
  });

  return {
    stats: data,
    isLoading,
    error,
  };
};
