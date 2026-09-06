export interface ScrollHeaderState {
  direction: 'down' | 'up' | null;
  directionStartY: number;
  gestureStartMode: ScrollHeaderMode;
  isCompact: boolean;
  isVisible: boolean;
  lastScrollY: number;
  mode: ScrollHeaderMode;
}

export type ScrollHeaderMode = 'full' | 'search' | 'hidden';

function stateForMode(
  state: Omit<ScrollHeaderState, 'isCompact' | 'isVisible' | 'mode'>,
  mode: ScrollHeaderMode,
): ScrollHeaderState {
  return {
    ...state,
    mode,
    isCompact: mode === 'search',
    isVisible: mode !== 'hidden',
  };
}

export const INITIAL_SCROLL_HEADER_STATE: ScrollHeaderState = {
  direction: null,
  directionStartY: 0,
  gestureStartMode: 'full',
  isCompact: false,
  isVisible: true,
  lastScrollY: 0,
  mode: 'full',
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
  const isNewGesture = direction !== state.direction;
  const directionStartY = isNewGesture ? state.lastScrollY : state.directionStartY;
  const gestureStartMode = isNewGesture ? state.mode : state.gestureStartMode;
  const directionDistance = Math.abs(nextScrollY - directionStartY);
  let mode = state.mode;

  if (
    direction === 'down'
    && nextScrollY > HIDE_AFTER_SCROLL_Y
    && directionDistance >= DIRECTION_DISTANCE_PX
  ) {
    mode = 'hidden';
  }

  if (direction === 'up' && directionDistance >= DIRECTION_DISTANCE_PX) {
    mode = gestureStartMode === 'hidden' ? 'search' : 'full';
  }

  return stateForMode({
    direction,
    directionStartY,
    gestureStartMode,
    lastScrollY: nextScrollY,
  }, mode);
}

export function settleScrollHeaderGesture(state: ScrollHeaderState): ScrollHeaderState {
  if (state.direction === null) return state;

  return {
    ...state,
    direction: null,
    directionStartY: state.lastScrollY,
    gestureStartMode: state.mode,
  };
}
