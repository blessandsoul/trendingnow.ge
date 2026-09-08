import { isAuthRoutePath } from './redirects';

/** Public discovery is usable without probing the legacy account API. */
export function shouldBootstrapSession(normalizedPathname: string, isLoggingOut: boolean, hasKnownSession = false): boolean {
  const isEditorialReview = normalizedPathname === '/editorial-preview' || normalizedPathname.startsWith('/editorial-preview/');
  const isAccountArea = ['/dashboard', '/admin', '/profile'].some(path => normalizedPathname === path || normalizedPathname.startsWith(`${path}/`));
  return !isEditorialReview && !isAuthRoutePath(normalizedPathname) && !isLoggingOut && (isAccountArea || hasKnownSession);
}
