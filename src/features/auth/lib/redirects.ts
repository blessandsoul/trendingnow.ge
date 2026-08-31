import { ROUTES } from '@/lib/constants/routes';
import { stripLocalePrefix } from '@/i18n/locales';

export const AUTH_ROUTE_PATHS: readonly string[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_ACCOUNT,
];

export function isAuthRoutePath(pathname: string): boolean {
  return AUTH_ROUTE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isAdminRoutePath(pathname: string): boolean {
  return pathname === ROUTES.ADMIN.DASHBOARD || pathname.startsWith(`${ROUTES.ADMIN.DASHBOARD}/`);
}

export function isDashboardRoutePath(pathname: string): boolean {
  return pathname === ROUTES.DASHBOARD || pathname.startsWith(`${ROUTES.DASHBOARD}/`);
}

function routePathOnly(path: string): string {
  return path.split(/[?#]/, 1)[0] || ROUTES.HOME;
}

export function normalizeAppRedirectPath(path: string | null | undefined): string | undefined {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return undefined;
  }

  try {
    const parsed = new URL(path, 'http://continuum.local');
    const normalizedPath = stripLocalePrefix(parsed.pathname).path;
    return `${normalizedPath}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}

export function getAuthenticatedRedirectPath(role?: string | null): string {
  return role === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD_FAVORITES;
}

export function getPostAuthRedirectPath(role: string | null | undefined, requestedPath?: string): string {
  if (role === 'ADMIN') {
    return ROUTES.ADMIN.DASHBOARD;
  }

  const normalizedRequestedPath = normalizeAppRedirectPath(requestedPath);
  const routePath = normalizedRequestedPath ? routePathOnly(normalizedRequestedPath) : undefined;

  if (
    normalizedRequestedPath &&
    routePath &&
    !isAuthRoutePath(routePath) &&
    !isAdminRoutePath(routePath)
  ) {
    return normalizedRequestedPath;
  }

  return ROUTES.DASHBOARD_FAVORITES;
}

export function toAppRedirectHref(path: string, localizeHref: (path: string) => string): string {
  return isAdminRoutePath(path) ? path : localizeHref(path);
}
