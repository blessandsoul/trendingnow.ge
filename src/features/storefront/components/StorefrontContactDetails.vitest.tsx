/* eslint-disable @next/next/no-img-element */

import type React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { kaCopy } from '@/i18n/copy/ka';
import { LocaleProvider } from '@/i18n/context';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontInfoPage } from './StorefrontInfoPage';

vi.mock('next/image', () => ({
  default: ({
    alt = '',
    priority: _priority,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; unoptimized?: boolean }) => {
    void _priority;
    void _unoptimized;
    return <img alt={alt} {...props} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('./CartDrawer', () => ({ CartDrawer: () => null }));
vi.mock('./HeaderTransitionSection', () => ({ HeaderTransitionSection: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('../hooks/useStorefront', () => ({
  useProductSearchSuggestions: () => ({ data: { items: [] }, isFetching: false }),
  useStorefrontHome: () => ({ data: { categories: [] } }),
}));

function renderWithGeorgianCopy(children: React.ReactElement): void {
  render(<LocaleProvider locale="ka">{children}</LocaleProvider>);
}

describe('public support contact details', () => {
  it('shows only the current phone number and email on the contact page', () => {
    renderWithGeorgianCopy(<StorefrontInfoPage {...kaCopy.infoPages.contact} />);

    expect(screen.getAllByText('+995 574 88 28 87')).not.toHaveLength(0);
    expect(screen.getAllByText('shopcontinuum@gmail.com')).not.toHaveLength(0);
    expect(screen.queryByText(/ლიბანის 29/)).not.toBeInTheDocument();
  });

  it('shows the current support contacts without an address in the footer', () => {
    renderWithGeorgianCopy(<StorefrontFooter />);

    expect(screen.getByText('+995 574 88 28 87')).toBeInTheDocument();
    expect(screen.getByText('shopcontinuum@gmail.com')).toBeInTheDocument();
    expect(screen.queryByText(/თბილისი, საქართველო/)).not.toBeInTheDocument();
  });

  it('does not expose an About us link in the header navigation', () => {
    renderWithGeorgianCopy(<StorefrontHeader />);

    expect(screen.queryByRole('link', { name: 'ჩვენს შესახებ' })).not.toBeInTheDocument();
  });
});
