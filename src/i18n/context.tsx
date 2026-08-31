'use client';

import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { getCopy, type AppCopy } from './copy';
import {
  DEFAULT_LOCALE,
  isActiveLocale,
  localizedPath,
  stripLocalePrefix,
  type ActiveLocale,
} from './locales';

interface LocaleContextValue {
  locale: ActiveLocale;
  copy: AppCopy;
}

const defaultLocaleContext: LocaleContextValue = {
  locale: DEFAULT_LOCALE,
  copy: getCopy(DEFAULT_LOCALE),
};

const LocaleContext = createContext<LocaleContextValue>(defaultLocaleContext);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: ActiveLocale;
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const pathLocale = pathname ? stripLocalePrefix(pathname).locale : locale;
  const activeLocale = isActiveLocale(pathLocale) ? pathLocale : locale;
  const value = useMemo<LocaleContextValue>(
    () => ({ locale: activeLocale, copy: getCopy(activeLocale) }),
    [activeLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): ActiveLocale {
  return useContext(LocaleContext).locale;
}

export function useLocaleCopy(): AppCopy {
  return useContext(LocaleContext).copy;
}

export function useLocalizedPath(): (path: string) => string {
  const locale = useLocale();

  return (path: string) => {
    if (!path.startsWith('/')) return path;
    return localizedPath(locale, stripLocalePrefix(path).path);
  };
}

export function useLanguageSwitchHref(targetLocale: ActiveLocale): string {
  const pathname = usePathname() || '/';
  const { path } = stripLocalePrefix(pathname);

  return localizedPath(targetLocale, path);
}
