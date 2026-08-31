type CategoryImageSource = {
  slug: string;
  imageUrl: string | null;
};

const CATEGORY_ARTWORK: Record<string, string> = {
  'laser-epilator': '/storefront/categories/laser-epilator-category.png',
  projector: '/storefront/categories/projector-category.png',
  'smart-watch': '/storefront/categories/smart-watch-category.png',
  'wireless-earbuds': '/storefront/categories/wireless-earbuds-category.png',
  'smartphone-accessories': '/storefront/categories/smartphone-accessories-category.png',
};

export function resolveCategoryImageUrl(category: CategoryImageSource): string | undefined {
  return category.imageUrl || CATEGORY_ARTWORK[category.slug];
}
