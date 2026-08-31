import { describe, expect, it } from 'vitest';

import { GALLERY_SWIPE_MIN_DISTANCE, resolveGallerySwipe, wrapGalleryIndex } from './gallery-swipe';

describe('mobile product gallery swipe', () => {
  it('moves to the next image on a decisive left swipe', () => {
    expect(resolveGallerySwipe({ x: 280, y: 200 }, { x: 180, y: 205 })).toBe('next');
  });

  it('moves to the previous image on a decisive right swipe', () => {
    expect(resolveGallerySwipe({ x: 90, y: 200 }, { x: 190, y: 195 })).toBe('previous');
  });

  it('keeps vertical page scrolling and small taps out of gallery navigation', () => {
    expect(resolveGallerySwipe({ x: 120, y: 100 }, { x: 135, y: 210 })).toBeNull();
    expect(resolveGallerySwipe({ x: 120, y: 100 }, { x: 120 + GALLERY_SWIPE_MIN_DISTANCE - 1, y: 102 })).toBeNull();
  });

  it('wraps gallery navigation at both ends', () => {
    expect(wrapGalleryIndex(-1, 6)).toBe(5);
    expect(wrapGalleryIndex(6, 6)).toBe(0);
  });
});
