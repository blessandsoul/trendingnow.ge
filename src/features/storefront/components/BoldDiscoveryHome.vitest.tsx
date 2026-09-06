import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoldDiscoveryHome } from './BoldDiscoveryHome';

vi.mock('@/i18n/context', () => ({ useLocalizedPath: () => (path: string) => path }));
vi.mock('next/image', () => ({ default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
  void priority;
  return React.createElement('img', props);
} }));
afterEach(cleanup);

describe('Bold Discovery homepage', () => {
  it('renders editable hero text and all four real image assets', () => {
    render(<BoldDiscoveryHome />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('ზედმეტის გარეშე.');
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('link', { name: /ნახე შერჩეული ნივთები/ })).toHaveAttribute('href', '/products?search=lamp');
  });

  it('opens menu, provides a catalog search and closes on Escape with focus restored', async () => {
    render(<BoldDiscoveryHome />);
    const button = screen.getByRole('button', { name: 'მენიუს გახსნა' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(screen.getByRole('search')).toHaveAttribute('action', '/products');
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'headphones' } });
    expect(search).toHaveValue('headphones');
    fireEvent.keyDown(search, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('searchbox')).not.toBeInTheDocument());
    await waitFor(() => expect(button).toHaveFocus());
  });

  it('routes every discovery and category to an existing destination', () => {
    render(<BoldDiscoveryHome />);
    for (const link of screen.getAllByRole('link')) {
      const href = link.getAttribute('href');
      expect(href).toMatch(/^(\/($|products\?search=|blog$|dashboard\/favorites$|about-us$|contact$)|#discovery-main$)/);
    }
  });
});
