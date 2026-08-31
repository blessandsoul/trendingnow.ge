export const PRODUCT_IMAGE_STANDARD_VERSION = 'tn-product-images.v1';

export const PRODUCT_IMAGE_SLOTS = [
  {
    key: 'hero',
    filename: '01.webp',
    label: 'მთავარი ფოტო',
    purpose: 'სრული პროდუქტი, მკაფიო სილუეტი და ყველაზე ძლიერი სავაჭრო კადრი',
  },
  {
    key: 'catalog',
    filename: '02.webp',
    label: 'კატალოგის ხედი',
    purpose: 'სუფთა მეორე კუთხე, სადაც ფორმა და ფერი მარტივად იკითხება',
  },
  {
    key: 'detail',
    filename: '03.webp',
    label: 'დეტალები',
    purpose: 'მასალა, შეკერვა, ტექსტურა, მართვის ელემენტი ან პროდუქტის მთავარი ნაწილი',
  },
  {
    key: 'context',
    filename: '04.webp',
    label: 'გამოყენებაში',
    purpose: 'რეალისტური გამოყენების სცენა, რომელიც აჩვენებს პროდუქტს ბუნებრივ კონტექსტში',
  },
  {
    key: 'benefit',
    filename: '05.webp',
    label: 'უპირატესობა და მასშტაბი',
    purpose: 'ერთი პრაქტიკული უპირატესობა ან ზომის გასაგები კონტექსტი, დაუდასტურებელი ტექსტის გარეშე',
  },
  {
    key: 'complete',
    filename: '06.webp',
    label: 'სრული ხედი',
    purpose: 'წინა და უკანა ხედი, კომპლექტაცია ან ყველაფერი, რაც შეკვეთაში შედის',
  },
] as const;

export type ProductImageSlot = (typeof PRODUCT_IMAGE_SLOTS)[number];

export type ProductVisual = ProductImageSlot & {
  url: string;
};

export function getProductVisualEntries(productId: string): ProductVisual[] {
  return PRODUCT_IMAGE_SLOTS.map((slot) => ({
    ...slot,
    url: `/storefront/products-ai/${productId}/${slot.filename}`,
  }));
}

export function getProductVisuals(productId: string): string[] {
  return getProductVisualEntries(productId).map((entry) => entry.url);
}
