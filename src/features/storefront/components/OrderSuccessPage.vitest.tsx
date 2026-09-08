import type React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrderSuccessPage } from './OrderSuccessPage';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
}));
vi.mock('@/i18n/copy', () => ({
  getCopy: () => ({
    orderSuccess: {
      checking: 'Checking',
      notFoundTitle: 'Order confirmation not found',
      notFoundText: 'No receipt from this session.',
      continueShopping: 'Browse',
      title: (code: string) => `Order ${code}`,
      text: 'Confirmed',
      viewOrders: 'My orders',
      supportTitle: 'Help',
      supportText: 'Email us.',
      supportCta: 'Contact',
      supportSubject: (code: string) => code,
      supportBody: () => [],
    },
  }),
}));
vi.mock('../lib/order-receipt', () => ({ hasOrderReceipt: vi.fn() }));
vi.mock('./StorefrontHeader', () => ({ StorefrontHeader: () => <header /> }));
vi.mock('./StorefrontFooter', () => ({ StorefrontFooter: () => <footer /> }));
vi.mock('@/store/hooks', () => ({ useAppSelector: () => ({ isAuthenticated: false }) }));

describe('OrderSuccessPage', () => {
  it('does not show success for an arbitrary URL code', async () => {
    const { hasOrderReceipt } = await import('../lib/order-receipt');
    vi.mocked(hasOrderReceipt).mockReturnValue(false);

    render(<OrderSuccessPage orderCode="missing-qa" />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Order confirmation not found' })).toBeInTheDocument());
    expect(screen.queryByText('Order missing-qa')).not.toBeInTheDocument();
  });

  it('shows success only when the current session has the matching receipt', async () => {
    const { hasOrderReceipt } = await import('../lib/order-receipt');
    vi.mocked(hasOrderReceipt).mockReturnValue(true);

    render(<OrderSuccessPage orderCode="TN-real" />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Order TN-real' })).toBeInTheDocument());
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });
});
