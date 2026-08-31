import { describe, expect, it } from 'vitest';

import { INITIAL_SCROLL_HEADER_STATE, nextScrollHeaderState } from './scroll-header';

describe('nextScrollHeaderState', () => {
  it('keeps the full header while the user is still near the top', () => {
    const state = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 40);

    expect(state.isVisible).toBe(true);
    expect(state.isCompact).toBe(false);
  });

  it('hides the header after a meaningful downward scroll beyond the full-header area', () => {
    const state = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);

    expect(state.isVisible).toBe(false);
    expect(state.isCompact).toBe(false);
  });

  it('ignores tiny upward movements so the header does not flicker', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);
    const state = nextScrollHeaderState(hidden, 134);

    expect(state.isVisible).toBe(false);
    expect(state.isCompact).toBe(false);
  });

  it('reveals a compact header after the user scrolls up a little', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);
    const startingUpwardScroll = nextScrollHeaderState(hidden, 134);
    const state = nextScrollHeaderState(startingUpwardScroll, 122);

    expect(state.isVisible).toBe(true);
    expect(state.isCompact).toBe(true);
  });

  it('restores the full header near the top of the page', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);
    const state = nextScrollHeaderState(hidden, 20);

    expect(state.isVisible).toBe(true);
    expect(state.isCompact).toBe(false);
  });
});
