import { describe, expect, it } from 'vitest';

import {
  INITIAL_SCROLL_HEADER_STATE,
  nextScrollHeaderState,
  settleScrollHeaderGesture,
} from './scroll-header';

describe('nextScrollHeaderState', () => {
  it('keeps the full header while the user is still near the top', () => {
    const state = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 40);

    expect(state.isVisible).toBe(true);
    expect(state.isCompact).toBe(false);
    expect(state.mode).toBe('full');
  });

  it('hides the header after a meaningful downward scroll beyond the full-header area', () => {
    const state = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);

    expect(state.isVisible).toBe(false);
    expect(state.isCompact).toBe(false);
    expect(state.mode).toBe('hidden');
  });

  it('ignores tiny upward movements so the header does not flicker', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);
    const state = nextScrollHeaderState(hidden, 134);

    expect(state.isVisible).toBe(false);
    expect(state.isCompact).toBe(false);
    expect(state.mode).toBe('hidden');
  });

  it('reveals a compact header after the user scrolls up a little', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);
    const startingUpwardScroll = nextScrollHeaderState(hidden, 134);
    const state = nextScrollHeaderState(startingUpwardScroll, 122);

    expect(state.isVisible).toBe(true);
    expect(state.isCompact).toBe(true);
    expect(state.mode).toBe('search');
  });

  it('keeps the search-only header for the rest of the first upward gesture', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 220);
    const startingUpwardScroll = nextScrollHeaderState(hidden, 210);
    const searchOnly = nextScrollHeaderState(startingUpwardScroll, 196);
    const longSameGesture = nextScrollHeaderState(searchOnly, 80);

    expect(longSameGesture.mode).toBe('search');
  });

  it('reveals the full header on the second distinct upward gesture', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 220);
    const startingFirstGesture = nextScrollHeaderState(hidden, 210);
    const searchOnly = nextScrollHeaderState(startingFirstGesture, 196);
    const settled = settleScrollHeaderGesture(searchOnly);
    const startingSecondGesture = nextScrollHeaderState(settled, 188);
    const full = nextScrollHeaderState(startingSecondGesture, 174);

    expect(full.isVisible).toBe(true);
    expect(full.isCompact).toBe(false);
    expect(full.mode).toBe('full');
  });

  it('restores the full header near the top of the page', () => {
    const hidden = nextScrollHeaderState(INITIAL_SCROLL_HEADER_STATE, 140);
    const state = nextScrollHeaderState(hidden, 20);

    expect(state.isVisible).toBe(true);
    expect(state.isCompact).toBe(false);
    expect(state.mode).toBe('full');
  });
});
