'use client';

import type React from 'react';
import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/lib/constants/routes';
import { isErrorCode, ERROR_CODES } from '@/lib/utils/error';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { stripLocalePrefix } from '@/i18n/locales';
import {
  getAuthenticatedRedirectPath,
  isAuthRoutePath,
  isDashboardRoutePath,
  toAppRedirectHref,
} from '../lib/redirects';
import { useCurrentUser } from '../hooks/useCurrentUser';

const PROTECTED_PATHS: string[] = [ROUTES.DASHBOARD, ROUTES.PROFILE, '/admin'];

// Auth pages where getMe() should never fire — there is no session to hydrate
// on login/register/reset-password, and calling getMe() here would trigger the
// 401 → refresh → fail → redirect chain for no reason.
interface AuthInitializerProps {
  children: React.ReactNode;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

interface HttpLikeError {
  response?: { status?: number };
}

export const AuthInitializer = ({ children }: AuthInitializerProps): React.ReactElement => {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoggingOut, user } = useAppSelector((state) => state.auth);
  const normalizedPathname = stripLocalePrefix(pathname).path;

  // Skip getMe() on auth pages and during logout.
  // React Query handles deduping, refetch-on-focus, and invalidation —
  // any mutation that touches the current user (profile update, role change,
  // avatar upload, email verification) should call:
  //   queryClient.invalidateQueries({ queryKey: authKeys.me() })
  // to refresh Redux state automatically.
  const enabled = !isAuthRoutePath(normalizedPathname) && !isLoggingOut;

  const { error } = useCurrentUser({ enabled });

  useEffect(() => {
    if (isLoggingOut || !isAuthenticated || !user) return;
    const isAdminOnDashboard = user.role === 'ADMIN' && isDashboardRoutePath(normalizedPathname);
    if (!isAuthRoutePath(normalizedPathname) && !isAdminOnDashboard) {
      return;
    }

    router.replace(toAppRedirectHref(getAuthenticatedRedirectPath(user.role), localizeHref));
  }, [isAuthenticated, isLoggingOut, localizeHref, normalizedPathname, router, user]);

  useEffect(() => {
    if (!error) return;
    if (!isProtectedPath(normalizedPathname)) return;

    const status = (error as HttpLikeError)?.response?.status;
    if (status === 401 || status === 403) {
      if (isErrorCode(error, ERROR_CODES.ACCOUNT_NOT_ACTIVE)) {
        toast.error(copy.auth.toasts.accountNotActive);
      }
      router.push(localizeHref(ROUTES.LOGIN));
    }
  }, [copy, error, localizeHref, normalizedPathname, router]);

  return <>{children}</>;
};
