'use client';

import { useCallback, useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getErrorMessage, isErrorCode, ERROR_CODES } from '@/lib/utils/error';
import { ROUTES } from '@/lib/constants/routes';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import {
  getAuthenticatedRedirectPath,
  getPostAuthRedirectPath,
  toAppRedirectHref,
} from '../lib/redirects';
import { authService } from '../services/auth.service';
import { setUser, setLoggingOut, logout as logoutAction } from '../store/authSlice';

import type { ILoginRequest, IRegisterRequest, IUser } from '../types/auth.types';

interface UseAuthReturn {
  user: IUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (data: ILoginRequest, redirectTo?: string) => void;
  register: (data: IRegisterRequest) => void;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isInitializing, isLoggingOut } = useAppSelector((state) => state.auth);
  const pendingRedirectRef = useRef<string | undefined>(undefined);

  const loginMutation = useMutation({
    mutationFn: (data: ILoginRequest) => authService.login(data),
    onSuccess: (data) => {
      queryClient.clear();
      dispatch(setUser(data.user));
      toast.success(copy.auth.toasts.loginSuccess);
      router.push(
        toAppRedirectHref(
          getPostAuthRedirectPath(data.user.role, pendingRedirectRef.current),
          localizeHref,
        ),
      );
      pendingRedirectRef.current = undefined;
    },
    onError: (error) => {
      if (isErrorCode(error, ERROR_CODES.ACCOUNT_NOT_ACTIVE)) {
        toast.error(copy.auth.toasts.accountNotActive);
        return;
      }
      toast.error(getErrorMessage(error, copy));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: IRegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      if (!data.user.isActive) {
        toast.success(copy.auth.toasts.verifyEmail);
        router.push(localizeHref(ROUTES.VERIFY_ACCOUNT));
        return;
      }
      queryClient.clear();
      dispatch(setUser(data.user));
      toast.success(copy.auth.toasts.registerSuccess);
      router.push(toAppRedirectHref(getAuthenticatedRedirectPath(data.user.role), localizeHref));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, copy));
    },
  });

  const logout = useCallback(async (): Promise<void> => {
    dispatch(setLoggingOut(true));
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      queryClient.clear();
      dispatch(logoutAction());
      router.push(localizeHref(ROUTES.LOGIN));
    }
  }, [dispatch, router, queryClient, localizeHref]);

  return {
    user,
    isAuthenticated,
    isInitializing,
    login: (data: ILoginRequest, redirectTo?: string) => {
      pendingRedirectRef.current = redirectTo;
      loginMutation.mutate(data);
    },
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut,
  };
};
