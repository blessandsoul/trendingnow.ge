import type { StorefrontProduct } from '../types/storefront.types';

export function selectComparableProducts(
  currentProduct: StorefrontProduct,
  alternatives: readonly StorefrontProduct[],
  limit = 2,
): StorefrontProduct[] {
  return alternatives
    .filter((product, index, products) => (
      product.id !== currentProduct.id
      && product.category.slug === currentProduct.category.slug
      && products.findIndex((candidate) => candidate.id === product.id) === index
    ))
    .slice(0, Math.max(0, limit));
}
