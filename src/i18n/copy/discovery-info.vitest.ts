import { describe, expect, it } from 'vitest';

import { ACTIVE_LOCALES, type ActiveLocale } from '../locales';
import { getCopy } from './index';
import { discoveryInfoPages, type InfoPageKey } from './discovery-info';

const pageKeys: InfoPageKey[] = ['aboutUs', 'delivery', 'warranty', 'paymentMethods', 'faq', 'contact', 'corporateOffer'];

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}

describe('discovery information copy contract', () => {
  it('provides seven complete pages for all active locales', () => {
    for (const locale of ACTIVE_LOCALES) {
      const pages = discoveryInfoPages[locale];
      expect(Object.keys(pages)).toEqual(pageKeys);
      for (const key of pageKeys) {
        const page = pages[key];
        expect(page.title, `${locale}.${key}.title`).toMatch(/\S/);
        expect(page.intro, `${locale}.${key}.intro`).toMatch(/\S/);
        expect(page.sections.length, `${locale}.${key}.sections`).toBeGreaterThan(0);
        for (const section of page.sections) {
          expect(section.title, `${locale}.${key}.section title`).toMatch(/\S/);
          const content = [...section.text ?? [], ...section.items ?? []];
          expect(content.length, `${locale}.${key}.${section.title} content`).toBeGreaterThan(0);
          expect(content.every((value) => typeof value === 'string' && /\S/.test(value)), `${locale}.${key}.${section.title} content`).toBe(true);
        }
        expect(allStrings(page), `${locale}.${key}`).not.toContain('undefined');
        expect(JSON.stringify(page), `${locale}.${key}`).not.toContain('undefined');
        expect(JSON.stringify(page), `${locale}.${key}`).not.toMatch(/\b(?:5|8)\s*(?:GEL|₾)\b/i);
      }
    }
  });

  it('keeps contact routes explicit and sourced from the same locale object', () => {
    for (const locale of ACTIVE_LOCALES as readonly ActiveLocale[]) {
      const page = discoveryInfoPages[locale].contact;
      const serialized = JSON.stringify(page);
      expect(serialized).toContain('contact@ainow.ge');
      expect(serialized).toContain('+995 574 88 28 87');
      expect(getCopy(locale).infoPages).toBe(discoveryInfoPages[locale]);
      expect(getCopy(locale).infoPages.delivery).toBe(discoveryInfoPages[locale].delivery);
    }
  });
});
