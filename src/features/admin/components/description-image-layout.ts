export const DESCRIPTION_IMAGE_PRESETS = {
  small: 320,
  standard: 520,
  large: 720,
  full: 960,
} as const;

export const DESCRIPTION_IMAGE_MIN_WIDTH = 160;
export const DESCRIPTION_IMAGE_MAX_WIDTH = 960;

export type DescriptionImageAlign = 'left' | 'center' | 'right';

export type DescriptionImage = {
  src: string;
  alt: string;
  width: number;
  align: DescriptionImageAlign;
};

export function clampDescriptionImageWidth(value: number): number {
  return Math.min(DESCRIPTION_IMAGE_MAX_WIDTH, Math.max(DESCRIPTION_IMAGE_MIN_WIDTH, Math.round(value)));
}

export function normalizeDescriptionImageAlign(value: unknown): DescriptionImageAlign {
  return value === 'left' || value === 'right' || value === 'center' ? value : 'center';
}

export function isProductDescriptionImageSrc(value: unknown): value is string {
  return typeof value === 'string'
    && /^\/uploads\/storefront\/product\/[\p{L}\p{N}][\p{L}\p{N}._-]*\.webp$/u.test(value);
}

export function serializeDescriptionImageAttributes({
  src,
  alt,
  width,
  align,
}: {
  src: string;
  alt: string;
  width: number;
  align: unknown;
}): { src: string; alt: string; width: number; 'data-align': DescriptionImageAlign } {
  return {
    src,
    alt,
    width: clampDescriptionImageWidth(width),
    'data-align': normalizeDescriptionImageAlign(align),
  };
}

export function createUploadedDescriptionImageAttributes({
  src,
  alt,
}: {
  src: string;
  alt: string;
}): { src: string; alt: string; width: number; 'data-align': DescriptionImageAlign } {
  return serializeDescriptionImageAttributes({
    src,
    alt,
    width: DESCRIPTION_IMAGE_PRESETS.standard,
    align: 'center',
  });
}

export function createUploadedDescriptionImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}): DescriptionImage {
  return {
    src,
    alt,
    width: DESCRIPTION_IMAGE_PRESETS.standard,
    align: 'center',
  };
}

export function normalizeDescriptionImages(value: unknown): DescriptionImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const image = item as Record<string, unknown>;
      if (!isProductDescriptionImageSrc(image.src)) return [];
      return [{
        src: image.src,
        alt: typeof image.alt === 'string' ? image.alt : '',
        width: clampDescriptionImageWidth(Number(image.width ?? DESCRIPTION_IMAGE_PRESETS.standard)),
        align: normalizeDescriptionImageAlign(image.align),
      }];
    })
    .slice(0, 2);
}
