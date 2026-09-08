import { ACTIVE_LOCALES, DEFAULT_LOCALE, type ActiveLocale, type InactiveLocale } from '../locales';
import { enCopy } from './en';
import { kaCopy } from './ka';
import { ruCopy } from './ru';
import { discoveryInfoPages, type DiscoveryInfoPage, type InfoPageKey } from './discovery-info';

export type AppCopy = Omit<typeof kaCopy, 'infoPages'> & { infoPages: Record<InfoPageKey, DiscoveryInfoPage> };

export const localeCopy = {
  ka: { ...kaCopy, infoPages: discoveryInfoPages.ka },
  en: { ...enCopy, infoPages: discoveryInfoPages.en },
  ru: { ...ruCopy, infoPages: discoveryInfoPages.ru },
} satisfies Record<ActiveLocale, AppCopy>;

export const inactiveLocaleCopyPlaceholders = {} satisfies Record<
  InactiveLocale,
  { status: 'pending'; sourceLocale: typeof DEFAULT_LOCALE }
>;

export const activeLocaleCopy = ACTIVE_LOCALES.map((locale) => ({
  locale,
  copy: localeCopy[locale],
}));

export const pendingLocaleCopy: {
  locale: InactiveLocale;
  status: 'pending';
  sourceLocale: typeof DEFAULT_LOCALE;
}[] = [];

export function getCopy(locale: ActiveLocale = DEFAULT_LOCALE): AppCopy {
  return localeCopy[locale];
}

export const copy = getCopy();
