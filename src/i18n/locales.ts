export const DEFAULT_LOCALE = 'ka';

export const SUPPORTED_LOCALES = ['ka', 'en', 'ru'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const ACTIVE_LOCALES = ['ka', 'en', 'ru'] as const;
export type ActiveLocale = (typeof ACTIVE_LOCALES)[number];
export type InactiveLocale = Exclude<Locale, ActiveLocale>;

export const INACTIVE_LOCALES = SUPPORTED_LOCALES.filter(
  (locale): locale is InactiveLocale => !ACTIVE_LOCALES.includes(locale as ActiveLocale),
);

export const LOCALE_ROUTE_PREFIXES = {
  ka: '',
  en: '/en',
  ru: '/ru',
} as const satisfies Record<Locale, string>;

export const LOCALE_NAMES = {
  ka: {
    native: 'ქართული',
    english: 'Georgian',
    switcherCode: 'geo',
    flagCode: 'ge',
  },
  en: {
    native: 'English',
    english: 'English',
    switcherCode: 'eng',
    flagCode: 'gb',
  },
  ru: {
    native: 'Русский',
    english: 'Russian',
    switcherCode: 'rus',
    flagCode: 'ru',
  },
} as const satisfies Record<
  Locale,
  {
    native: string;
    english: string;
    switcherCode: string;
    flagCode: string;
  }
>;

export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function isActiveLocale(locale: string): locale is ActiveLocale {
  return (ACTIVE_LOCALES as readonly string[]).includes(locale);
}

export function localizedPath(locale: Locale, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalizedPath;
  return `${LOCALE_ROUTE_PREFIXES[locale]}${normalizedPath}`;
}

export function localeNativeName(locale: Locale): string {
  return LOCALE_NAMES[locale].native;
}

export function stripLocalePrefix(pathname: string): { locale: Locale; path: string } {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segment = normalizedPath.split('/')[1];

  if (segment && isSupportedLocale(segment)) {
    const stripped = normalizedPath.slice(segment.length + 1) || '/';
    return { locale: segment, path: stripped.startsWith('/') ? stripped : `/${stripped}` };
  }

  return { locale: DEFAULT_LOCALE, path: normalizedPath };
}
