import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NewsletterBand } from './NewsletterBand';

vi.mock('@/i18n/context', () => ({
  useLocaleCopy: () => ({
    newsletter: {
      title: 'Need help choosing?',
      description: 'Write with a SKU.',
      contactHint: 'Contact email: contact@ainow.ge',
      contactSubject: 'Help choosing',
      contactBody: 'Question:',
      button: 'Email us',
    },
  }),
}));

describe('NewsletterBand', () => {
  it('offers a truthful contact action instead of a fake subscription submit', () => {
    render(<NewsletterBand newsletter={{ id: 'ignored', title: 'ignored', text: 'ignored', placeholder: 'ignored', buttonLabel: 'ignored' }} />);

    const link = screen.getByRole('link', { name: 'Email us' });
    expect(link).toHaveAttribute('href', expect.stringContaining('mailto:contact@ainow.ge'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Need help choosing?')).toBeInTheDocument();
  });
});
