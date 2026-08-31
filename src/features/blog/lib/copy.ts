import type { BlogLocale } from './locales';

interface BlogCopy {
  title: string;
  subtitle: string;
  latestHeading: string;
  topicsHeading: string;
  viewAllTags: string;
  noPostsForTag: string;
  prevPage: string;
  nextPage: string;
  readMore: string;
  backToBlog: string;
  relatedPosts: string;
  fallbackNotice: string;
  tocTitle: string;
  tagsTitle: string;
  articlesLabel: string;
  homeLabel: string;
  breadcrumbLabel: string;
  postNotFoundTitle: string;
  tagNotFoundTitle: string;
  tagDescription: (tag: string) => string;
  productCtaEyebrow: string;
  productCtaTitle: string;
  productCtaBody: string;
  productCtaButton: string;
  productCtaSecondary: string;
  seoTitle: string;
  seoDescription: string;
}

const ka: BlogCopy = {
  title: 'ბლოგი',
  subtitle: 'ტრენდული პროდუქტები, ყიდვის გზამკვლევები, შედარებები და პრაქტიკული რჩევები უკეთესი არჩევანისთვის.',
  latestHeading: 'ბოლო სტატიები',
  topicsHeading: 'თემები',
  viewAllTags: 'ყველა თემის ნახვა ->',
  noPostsForTag: 'ამ თემაზე სტატია ჯერ არ არის.',
  prevPage: 'წინა',
  nextPage: 'შემდეგი',
  readMore: 'წაიკითხეთ მეტი',
  backToBlog: 'ბლოგში დაბრუნება',
  relatedPosts: 'მსგავსი სტატიები',
  fallbackNotice: 'ეს სტატია ამ ენაზე ჯერ მზად არ არის, ამიტომ ნაჩვენებია ქართული ვერსია.',
  tocTitle: 'სარჩევი',
  tagsTitle: 'თემები',
  articlesLabel: 'სტატია',
  homeLabel: 'მთავარი',
  breadcrumbLabel: 'ნავიგაცია',
  postNotFoundTitle: 'სტატია ვერ მოიძებნა',
  tagNotFoundTitle: 'თემა ვერ მოიძებნა',
  tagDescription: (tag: string) => `"${tag}" თემის სტატიები`,
  productCtaEyebrow: 'TrendingNow კატალოგი',
  productCtaTitle: 'იპოვეთ ამ თემასთან დაკავშირებული პროდუქტი',
  productCtaBody: 'გახსენით კატალოგი შესაბამისი ძიებით და შეადარეთ სტატიაში ნახსენები კატეგორიის პროდუქტები.',
  productCtaButton: 'პროდუქტების ძიება',
  productCtaSecondary: 'ყველა პროდუქტი',
  seoTitle: 'ბლოგი | TrendingNow.ge',
  seoDescription: 'TrendingNow.ge-ის ბლოგი ტრენდული პროდუქტების, შედარების, შერჩევისა და ონლაინ ყიდვის შესახებ.',
};

const en: BlogCopy = {
  title: 'Blog',
  subtitle: 'Trending products, buying guides, comparisons, and practical tips for making a better choice.',
  latestHeading: 'Latest articles',
  topicsHeading: 'Topics',
  viewAllTags: 'View all topics ->',
  noPostsForTag: 'There are no articles on this topic yet.',
  prevPage: 'Previous',
  nextPage: 'Next',
  readMore: 'Read more',
  backToBlog: 'Back to blog',
  relatedPosts: 'Related articles',
  fallbackNotice: 'This article is not ready in this language yet, so the Georgian version is shown.',
  tocTitle: 'Contents',
  tagsTitle: 'Topics',
  articlesLabel: 'articles',
  homeLabel: 'Home',
  breadcrumbLabel: 'Breadcrumb',
  postNotFoundTitle: 'Article not found',
  tagNotFoundTitle: 'Topic not found',
  tagDescription: (tag: string) => `Articles about "${tag}"`,
  productCtaEyebrow: 'TrendingNow catalog',
  productCtaTitle: 'Find a product related to this topic',
  productCtaBody: 'Open the catalog with a relevant search and compare products from the category mentioned in the article.',
  productCtaButton: 'Search products',
  productCtaSecondary: 'All products',
  seoTitle: 'Blog | TrendingNow.ge',
  seoDescription: 'The TrendingNow.ge blog about discovering, comparing, choosing, and buying trending products online.',
};

const ru: BlogCopy = {
  title: 'Блог',
  subtitle: 'Трендовые товары, гиды по покупке, сравнения и практичные советы для уверенного выбора.',
  latestHeading: 'Последние статьи',
  topicsHeading: 'Темы',
  viewAllTags: 'Все темы ->',
  noPostsForTag: 'По этой теме пока нет статей.',
  prevPage: 'Назад',
  nextPage: 'Далее',
  readMore: 'Читать дальше',
  backToBlog: 'Вернуться в блог',
  relatedPosts: 'Похожие статьи',
  fallbackNotice: 'Эта статья пока не готова на этом языке, поэтому показана грузинская версия.',
  tocTitle: 'Содержание',
  tagsTitle: 'Темы',
  articlesLabel: 'статей',
  homeLabel: 'Главная',
  breadcrumbLabel: 'Навигация',
  postNotFoundTitle: 'Статья не найдена',
  tagNotFoundTitle: 'Тема не найдена',
  tagDescription: (tag: string) => `Статьи по теме "${tag}"`,
  productCtaEyebrow: 'Каталог TrendingNow',
  productCtaTitle: 'Найдите товар по этой теме',
  productCtaBody: 'Откройте каталог с подходящим поиском и сравните товары категории, упомянутой в статье.',
  productCtaButton: 'Искать товары',
  productCtaSecondary: 'Все товары',
  seoTitle: 'Блог | TrendingNow.ge',
  seoDescription: 'Блог TrendingNow.ge о трендовых товарах, сравнении, выборе и онлайн-покупках.',
};

export const BLOG_COPY: Record<BlogLocale, BlogCopy> = {
  ka,
  en,
  ru,
};

export function getBlogCopy(locale: BlogLocale): BlogCopy {
  return BLOG_COPY[locale];
}
