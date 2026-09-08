import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type React from 'react';
import { CompareCollectionPage } from './CompareCollectionPage';

let locale: 'ka' | 'en' | 'ru' = 'ka';

vi.mock('@/i18n/context', () => ({
  useLocale: () => locale,
  useLocalizedPath: () => (path: string) => path,
}));

vi.mock('../hooks/useRetention', () => ({
  useCompareSelection: () => ({
    entries: [
      { id: 'pcshop-1', categoryKey: 'workspace', comparisonKey: 'mouse' },
      { id: 'pcshop-2', categoryKey: 'workspace', comparisonKey: 'mouse' },
      { id: 'elite-2', categoryKey: 'workspace', comparisonKey: 'mouse' },
    ],
    hydrated: true,
    storageMode: 'persistent',
    removeCompare: vi.fn(),
    clearCompare: vi.fn(),
  }),
}));

vi.mock('./StorefrontHeader', () => ({ StorefrontHeader: () => <header /> }));
vi.mock('./StorefrontFooter', () => ({ StorefrontFooter: () => <footer /> }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

describe('compare collection horizontal controls', () => {
  afterEach(() => cleanup());

  it.each([
    ['ka', 'ცხრილი ჰორიზონტალურად გადაადგილდება', 'ცხრილის მარცხნივ გადახვევა', 'ცხრილის მარჯვნივ გადახვევა'],
    ['en', 'This table scrolls horizontally', 'Scroll table left', 'Scroll table right'],
    ['ru', 'Таблицу можно прокручивать по горизонтали', 'Прокрутить таблицу влево', 'Прокрутить таблицу вправо'],
  ] as const)('renders localized scroll guidance for %s', (nextLocale, hint, previous, next) => {
    locale = nextLocale;
    render(<CompareCollectionPage />);

    expect(screen.getByText(new RegExp(hint))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: previous })).toHaveClass('min-h-11', 'min-w-11');
    expect(screen.getByRole('button', { name: next })).toHaveClass('min-h-11', 'min-w-11');
    expect(screen.getByRole('columnheader', { name: locale === 'ka' ? 'ველი' : locale === 'en' ? 'Field' : 'Поле' })).toHaveClass('sticky', 'left-0');
    expect(screen.getByRole('rowheader', { name: locale === 'ka' ? 'გამყიდველი' : locale === 'en' ? 'Seller' : 'Продавец' })).toHaveClass('sticky', 'left-0');
  });
});
