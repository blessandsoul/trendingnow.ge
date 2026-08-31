import 'server-only';

import { headers } from 'next/headers';

import { getCopy, type AppCopy } from './copy';
import { DEFAULT_LOCALE, isActiveLocale, type ActiveLocale } from './locales';

export async function getRequestLocale(): Promise<ActiveLocale> {
  const locale = (await headers()).get('x-locale');
  return locale && isActiveLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function getRequestCopy(): Promise<AppCopy> {
  return getCopy(await getRequestLocale());
}
