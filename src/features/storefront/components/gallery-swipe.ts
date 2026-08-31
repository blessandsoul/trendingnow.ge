export interface GalleryPoint {
  x: number;
  y: number;
}

export type GallerySwipeDirection = 'previous' | 'next';

export const GALLERY_SWIPE_MIN_DISTANCE = 44;
const HORIZONTAL_DOMINANCE_RATIO = 1.15;

export function resolveGallerySwipe(
  start: GalleryPoint,
  end: GalleryPoint,
): GallerySwipeDirection | null {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);

  if (horizontalDistance < GALLERY_SWIPE_MIN_DISTANCE) return null;
  if (horizontalDistance <= verticalDistance * HORIZONTAL_DOMINANCE_RATIO) return null;

  return deltaX < 0 ? 'next' : 'previous';
}

export function wrapGalleryIndex(index: number, itemCount: number): number {
  if (itemCount <= 0) return 0;
  return ((index % itemCount) + itemCount) % itemCount;
}
