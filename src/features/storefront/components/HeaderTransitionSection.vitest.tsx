import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeaderTransitionSection } from './HeaderTransitionSection';

describe('HeaderTransitionSection', () => {
  it('keeps its content mounted while smoothly switching between expanded and collapsed states', () => {
    const { rerender } = render(
      <HeaderTransitionSection expanded data-testid="header-section">
        <span>Header utility content</span>
      </HeaderTransitionSection>,
    );
    const section = screen.getByTestId('header-section');

    expect(section).toHaveClass('grid-rows-[1fr]', 'opacity-100');
    expect(section).not.toHaveAttribute('aria-hidden', 'true');

    rerender(
      <HeaderTransitionSection expanded={false} data-testid="header-section">
        <span>Header utility content</span>
      </HeaderTransitionSection>,
    );

    expect(screen.getByTestId('header-section')).toBe(section);
    expect(section).toHaveClass('grid-rows-[0fr]', 'opacity-0');
    expect(section).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Header utility content')).toBeInTheDocument();
  });
});
