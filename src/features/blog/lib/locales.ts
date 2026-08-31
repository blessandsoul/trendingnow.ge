import {
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isActiveLocale,
  isSupportedLocale,
  localeNativeName,
  localizedPath as appLocalizedPath,
  type ActiveLocale,
  type Locale,
} from '@/i18n/locales';

export const DEFAULT_BLOG_LOCALE = DEFAULT_LOCALE;

export const BLOG_LOCALES = SUPPORTED_LOCALES;
export const ACTIVE_BLOG_LOCALES = ACTIVE_LOCALES;

export type BlogLocale = Locale;
export type ActiveBlogLocale = ActiveLocale;

export const PREFIXED_BLOG_LOCALES = ACTIVE_BLOG_LOCALES.filter(
  (locale) => locale !== DEFAULT_BLOG_LOCALE,
) as Exclude<BlogLocale, typeof DEFAULT_BLOG_LOCALE>[];

export function isBlogLocale(locale: string): locale is BlogLocale {
  return isSupportedLocale(locale);
}

export function isActiveBlogLocale(locale: string): locale is ActiveBlogLocale {
  return isActiveLocale(locale);
}

export function normalizeBlogLocale(locale: string | undefined): BlogLocale {
  return locale && isBlogLocale(locale) ? locale : DEFAULT_BLOG_LOCALE;
}

export function localizedPath(locale: BlogLocale, path: string): string {
  return appLocalizedPath(locale, path);
}

export function localeName(locale: BlogLocale): string {
  return localeNativeName(locale);
}
