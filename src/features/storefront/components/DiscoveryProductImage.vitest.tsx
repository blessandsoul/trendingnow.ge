import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ fill: _fill, unoptimized: _unoptimized, ...props }: Record<string, unknown>) => <img {...props} />,
}));

import { DiscoveryProductImage } from './DiscoveryProductImage';

describe('exact discovery photography', () => {
  it('contains the original image, handles failure, and tries a changed source', () => {
    const view = render(<DiscoveryProductImage src="https://pcshop.ge/first.jpg" alt="Exact mouse" />);
    expect(screen.getByRole('img')).toHaveClass('object-contain');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).toBeNull();
    view.rerender(<DiscoveryProductImage src="https://pcshop.ge/second.jpg" alt="Exact mouse" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://pcshop.ge/second.jpg');
  });

  it('does not invent a substitute photo for a missing source', () => {
    render(<DiscoveryProductImage src={null} alt="Exact mouse" />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});
