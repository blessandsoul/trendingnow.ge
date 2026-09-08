import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoldDiscoveryHome } from './BoldDiscoveryHome';
import { StorefrontHeader } from './StorefrontHeader';
import { LocaleProvider } from '@/i18n/context';

const route = vi.hoisted(() => ({ pathname: '/', query: '', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.query),
  useRouter: () => ({ push: route.push }),
}));
vi.mock('next/image', () => ({ default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
  void priority;
  return React.createElement('img', props);
} }));
afterEach(() => { cleanup(); route.pathname = '/'; route.query = ''; route.push.mockReset(); });

describe('Bold Discovery shared shell', () => {
  it('preserves editable hero text and all four illustrated assets', () => {
    render(<BoldDiscoveryHome />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('ზედმეტის გარეშე.');
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('link', { name: /ნახე შერჩეული ნივთები/ })).toHaveAttribute('href', '/products');
    expect(document.querySelectorAll('header')).toHaveLength(1);
    expect(document.querySelectorAll('footer')).toHaveLength(1);
  });

  it('opens the shared search menu and restores focus on Escape', async () => {
    render(<BoldDiscoveryHome />);
    const button = screen.getByRole('button', { name: 'მენიუს გახსნა' });
    fireEvent.click(button);
    const dialog = screen.getByRole('dialog');
    const search = within(dialog).getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'Logitech' } });
    expect(search).toHaveValue('Logitech');
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
    expect(ids.length).toBe(new Set(ids).size);
    fireEvent.keyDown(search, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('submits the real catalog query and closes the menu', async () => {
    render(<StorefrontHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'მენიუს გახსნა' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: '  მაუსი  ' } });
    fireEvent.submit(within(dialog).getByRole('search'));
    expect(route.push).toHaveBeenCalledWith('/products?search=' + encodeURIComponent('მაუსი'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('tracks query changes after navigation without keeping an old draft', () => {
    route.query = 'search=Logitech';
    const view = render(<StorefrontHeader />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'draft' } });
    route.query = 'search=Anker';
    view.rerender(<StorefrontHeader />);
    expect(screen.getByRole('searchbox')).toHaveValue('Anker');
  });

  it('uses active discovery categories and guest saved, not empty teaser links', () => {
    render(<BoldDiscoveryHome />);
    expect(document.querySelector('a[href="/products?category=kitchen"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/products?category=workspace"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/saved"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="/cart"], a[href="/dashboard/favorites"]')).not.toBeInTheDocument();
    expect(screen.queryByText(/მალე — არჩევანი მზადდება/)).not.toBeInTheDocument();
  });

  it.each([['en', 'GOOD'], ['ru', 'ХОРОШИЕ']] as const)('uses the %s shell and homepage language', (locale, heading) => {
    route.pathname = '/' + locale;
    render(<LocaleProvider locale={locale}><BoldDiscoveryHome /></LocaleProvider>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
    expect(document.querySelector('a[href="/' + locale + '/saved"]')).toBeInTheDocument();
    expect(document.querySelector('a[href="mailto:contact@ainow.ge"]')).toBeInTheDocument();
  });
});
