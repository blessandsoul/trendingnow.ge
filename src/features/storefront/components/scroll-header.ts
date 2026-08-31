export interface ScrollHeaderState {
  direction: 'down' | 'up' | null;
  directionStartY: number;
  isCompact: boolean;
  isVisible: boolean;
  lastScrollY: number;
}

export const INITIAL_SCROLL_HEADER_STATE: ScrollHeaderState = {
  direction: null,
  directionStartY: 0,
  isCompact: false,
  isVisible: true,
  lastScrollY: 0,
};

const FULL_HEADER_MAX_SCROLL_Y = 24;
const HIDE_AFTER_SCROLL_Y = 96;
const DIRECTION_DISTANCE_PX = 12;

export function nextScrollHeaderState(
  state: ScrollHeaderState,
  scrollY: number,
): ScrollHeaderState {
  const nextScrollY = Math.max(0, scrollY);

  if (nextScrollY <= FULL_HEADER_MAX_SCROLL_Y) {
    return {
      ...INITIAL_SCROLL_HEADER_STATE,
      directionStartY: nextScrollY,
      lastScrollY: nextScrollY,
    };
  }

  if (nextScrollY === state.lastScrollY) {
    return state;
  }

  const direction = nextScrollY > state.lastScrollY ? 'down' : 'up';
  const directionStartY = direction === state.direction ? state.directionStartY : state.lastScrollY;
  const directionDistance = Math.abs(nextScrollY - directionStartY);
  let isCompact = state.isCompact;
  let isVisible = state.isVisible;

  if (
    direction === 'down'
    && nextScrollY > HIDE_AFTER_SCROLL_Y
    && directionDistance >= DIRECTION_DISTANCE_PX
  ) {
    isVisible = false;
  }

  if (direction === 'up' && directionDistance >= DIRECTION_DISTANCE_PX) {
    isCompact = true;
    isVisible = true;
  }

  return {
    direction,
    directionStartY,
    isCompact,
    isVisible,
    lastScrollY: nextScrollY,
  };
}
