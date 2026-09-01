import type { ActiveLocale } from '@/i18n/locales';

export function formatGel(value: number): string {
  return `${value.toLocaleString('ka-GE')} ₾`;
}

const storefrontMonths: Record<ActiveLocale, string[]> = {
  ka: ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
};

export function formatStorefrontDate(value: string, locale: ActiveLocale): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const day = parsed.getUTCDate();
  const month = storefrontMonths[locale][parsed.getUTCMonth()];
  const year = parsed.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function toStorefrontUppercase(value: string): string {
  return value.replace(/[a-z]+/gi, (part) => part.toUpperCase());
}

/** Strips tags + decodes common entities without any DOM dependency (SSR-safe). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
