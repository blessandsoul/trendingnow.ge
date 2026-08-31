import axios from 'axios';

import type { ApiError } from '@/lib/api/api.types';
import { copy as defaultCopy, type AppCopy } from '@/i18n/copy';

export const getErrorMessage = (error: unknown, copy: AppCopy = defaultCopy): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    if (apiError?.error?.message) {
      return apiError.error.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return copy.errors.network;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return copy.errors.unexpected;
};

export const getErrorCode = (error: unknown): string | undefined => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.error?.code;
  }
  return undefined;
};

export const isErrorCode = (error: unknown, code: string): boolean => {
  return getErrorCode(error) === code;
};

export const ERROR_CODES = {
  ACCOUNT_NOT_ACTIVE: 'ACCOUNT_NOT_ACTIVE',
} as const;
