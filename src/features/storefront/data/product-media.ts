const PRODUCT_VISUAL_COUNT = 6;

export function getProductVisuals(productId: string): string[] {
  return Array.from(
    { length: PRODUCT_VISUAL_COUNT },
    (_, index) => `/storefront/products-ai/${productId}/${String(index + 1).padStart(2, '0')}.webp`,
  );
}
