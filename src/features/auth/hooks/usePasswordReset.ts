'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ROUTES } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/utils/error';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { authService } from '../services/auth.service';

interface UseForgotPasswordReturn {
  forgotPassword: (email: string) => void;
  isPending: boolean;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const copy = useLocaleCopy();
  const mutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success(copy.auth.toasts.resetLinkSent);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, copy));
    },
  });

  return {
    forgotPassword: mutation.mutate,
    isPending: mutation.isPending,
  };
};

interface UseResetPasswordReturn {
  resetPassword: (data: { token: string; newPassword: string }) => void;
  isPending: boolean;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword(data.token, data.newPassword),
    onSuccess: () => {
      toast.success(copy.auth.toasts.passwordChanged);
      router.push(localizeHref(ROUTES.LOGIN));
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, copy));
    },
  });

  return {
    resetPassword: mutation.mutate,
    isPending: mutation.isPending,
  };
};
