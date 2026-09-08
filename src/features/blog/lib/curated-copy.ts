import type { BlogLocale } from './locales';
import type { DiscoveryCategory } from '@/features/storefront/lib/discovery-pilot';

export interface CuratedCollectionCopy {
  eyebrow: string;
  title: string;
  intro: string;
  allCategories: string;
  collectionCount: (count: number) => string;
  read: string;
  exactProducts: string;
  source: string;
  sourceDate: string;
  sourceDateUnavailable: string;
  disclosure: string;
  relatedProducts: string;
  singleProduct: string;
  productReview: string;
  noProducts: string;
  exactProduct: string;
  seller: string;
  sku: string;
  checked: string;
  observedPrice: string;
  priceUnavailable: string;
  back: string;
  fallback: string;
}

const copy: Record<BlogLocale, CuratedCollectionCopy> = {
  ka: {
    eyebrow: 'შერჩეული კოლექციები',
    title: 'არჩევანი, რომელსაც მიზეზი აქვს',
    intro: 'მოკლე გზამკვლევები ზუსტ მოდელებთან, წყაროს თარიღთან და იმ შეზღუდვებთან ერთად, რომლებიც არჩევამდე უნდა იცოდე.',
    allCategories: 'ყველა კატეგორია',
    collectionCount: (count) => `${count} კოლექცია`,
    read: 'კოლექციის ნახვა',
    exactProducts: 'ზუსტი პროდუქტები ამ კოლექციაში',
    source: 'წყაროები',
    sourceDate: 'წყაროს თარიღი',
    sourceDateUnavailable: 'წყაროს თარიღი ჯერ არ არის მითითებული',
    disclosure: 'როგორ მოვამზადეთ',
    relatedProducts: 'ზუსტი პროდუქტები',
    singleProduct: 'ერთი ზუსტი პროდუქტი',
    productReview: 'პროდუქტის მოკლე შეფასება',
    noProducts: 'ზუსტი პროდუქტები ამ ჩანაწერში ჯერ არ არის დაკავშირებული.',
    exactProduct: 'პროდუქტის დეტალები',
    seller: 'გამყიდველი',
    sku: 'SKU',
    checked: 'შემოწმებულია',
    observedPrice: 'დაფიქსირებული ფასი',
    priceUnavailable: 'ფასი წყაროში არ არის მითითებული',
    back: 'ყველა კოლექცია',
    fallback: 'ეს მასალა ამ ენაზე ჯერ მზად არ არის; ნაჩვენებია ქართული ვერსია.',
  },
  en: {
    eyebrow: 'Curated collections',
    title: 'A choice with a reason',
    intro: 'Short buying guides with exact models, dated sources, and the limits to check before choosing.',
    allCategories: 'All categories',
    collectionCount: (count) => `${count} collection${count === 1 ? '' : 's'}`,
    read: 'View collection',
    exactProducts: 'Exact products in this collection',
    source: 'Sources',
    sourceDate: 'Source date',
    sourceDateUnavailable: 'Source date is not listed yet',
    disclosure: 'How this was prepared',
    relatedProducts: 'Exact products',
    singleProduct: 'One exact product',
    productReview: 'Product review',
    noProducts: 'No exact products are linked to this entry yet.',
    exactProduct: 'Product details',
    seller: 'Seller',
    sku: 'SKU',
    checked: 'Checked',
    observedPrice: 'Observed price',
    priceUnavailable: 'Price not listed in the source',
    back: 'All collections',
    fallback: 'This material is not ready in this language yet; the Georgian version is shown.',
  },
  ru: {
    eyebrow: 'Подборки редакции',
    title: 'Выбор с понятной причиной',
    intro: 'Короткие гиды с точными моделями, датой источников и ограничениями, которые стоит проверить до выбора.',
    allCategories: 'Все категории',
    collectionCount: (count) => {
      const plural = new Intl.PluralRules('ru-RU').select(count);
      return `${count} ${plural === 'one' ? 'подборка' : plural === 'few' ? 'подборки' : 'подборок'}`;
    },
    read: 'Открыть подборку',
    exactProducts: 'Точные товары в подборке',
    source: 'Источники',
    sourceDate: 'Дата источника',
    sourceDateUnavailable: 'Дата источника пока не указана',
    disclosure: 'Как подготовлено',
    relatedProducts: 'Точные товары',
    singleProduct: 'Один точный товар',
    productReview: 'Краткий обзор товара',
    noProducts: 'К этой записи пока не привязаны точные товары.',
    exactProduct: 'Детали товара',
    seller: 'Продавец',
    sku: 'SKU',
    checked: 'Проверено',
    observedPrice: 'Зафиксированная цена',
    priceUnavailable: 'Цена не указана в источнике',
    back: 'Все подборки',
    fallback: 'Материал пока не готов на этом языке; показана грузинская версия.',
  },
};

export function getCuratedCollectionCopy(locale: BlogLocale): CuratedCollectionCopy {
  return copy[locale];
}

const categoryLabels: Record<BlogLocale, Record<DiscoveryCategory, string>> = {
  ka: {
    workspace: 'სამუშაო სივრცე',
    tech: 'ტექნიკა',
    home: 'სახლი',
    kitchen: 'სამზარეულო',
    care: 'მოვლა',
  },
  en: {
    workspace: 'Workspace',
    tech: 'Tech',
    home: 'Home',
    kitchen: 'Kitchen',
    care: 'Care',
  },
  ru: {
    workspace: 'Рабочее место',
    tech: 'Техника',
    home: 'Дом',
    kitchen: 'Кухня',
    care: 'Уход',
  },
};

export function getDiscoveryCategoryLabel(category: DiscoveryCategory, locale: BlogLocale): string {
  return categoryLabels[locale][category];
}

/** Localize known discovery categories while preserving editorial labels verbatim. */
export function getCuratedCategoryLabel(category: string, locale: BlogLocale): string {
  if (Object.prototype.hasOwnProperty.call(categoryLabels[locale], category)) {
    return categoryLabels[locale][category as DiscoveryCategory];
  }
  return category;
}
