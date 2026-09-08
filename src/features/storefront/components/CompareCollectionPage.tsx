'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, GitCompareArrows, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocale, useLocalizedPath } from '@/i18n/context';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { DiscoveryProductImage } from './DiscoveryProductImage';
import { useCompareSelection } from '../hooks/useRetention';
import { discoveryItems, getDiscoveryOffer } from '../lib/discovery-pilot';
import { formatGel, formatStorefrontDate } from '../lib/format';
import { getDiscoveryCategoryLabel, resolveDiscoveryRetentionProducts, type RetentionProduct } from '../lib/retention-products';

const compareCopy = {
  ka: { title: 'შეადარე არჩევანი', intro: 'შედარება აერთიანებს მაქსიმუმ სამ ზუსტ ნივთს ერთი კატეგორიიდან და ერთი ტიპიდან. უცნობი ფასი, მარაგი ან მახასიათებელი უცნობად რჩება.', count: (n: number) => `${n} ნივთი შედარებაში`, loading: 'შედარება იტვირთება…', device: 'ეს სია მხოლოდ ამ მოწყობილობაზე ინახება და ანგარიშთან არ სინქრონიზდება.', catalog: 'კატალოგი', clear: 'გასუფთავება', emptyTitle: 'შედარებისთვის ნივთები აირჩიე', emptyText: 'დაამატე ორი ან სამი ზუსტი, ერთი ტიპის ნივთი. ფასს მხოლოდ შემოწმების თარიღთან ერთად ვაჩვენებთ.', viewCatalog: 'კატალოგის ნახვა', missing: 'არჩეული ნივთი კატალოგში ვეღარ მოიძებნა. სხვა ნივთებთან შედარებამდე წაშალე ეს ჩანაწერი.', invalidTitle: 'ეს ნივთები ერთ ცხრილში ვერ შედარდება.', invalidText: 'აირჩიე ერთი კატეგორიისა და ერთი ტიპის ზუსტი პროდუქტები; განსხვავებულ ნივთებს საერთო მახასიათებლებს არ მოვუგონებთ.', scrollHint: 'ცხრილი ჰორიზონტალურად გადაადგილდება — გამოიყენე ისრები ან გადაუსვი მარცხნივ/მარჯვნივ.', scrollPrevious: 'ცხრილის მარცხნივ გადახვევა', scrollNext: 'ცხრილის მარჯვნივ გადახვევა', field: 'ველი', seller: 'გამყიდველი', sku: 'ზუსტი SKU', category: 'კატეგორია', price: 'ფასი', checked: 'ფასის შემოწმება', stock: 'მარაგი', store: 'მაღაზიის გვერდი', stale: 'ბმული ხელახლა მოწმდება', unknownPrice: 'უცნობია — გადაამოწმე მაღაზიაში', unknown: 'უცნობია', inStock: 'შემოწმებისას იყო მარაგში', outOfStock: 'შემოწმებისას არ იყო მარაგში', remove: 'წაშლა', aria: 'პროდუქტების შედარება' },
  en: { title: 'Compare products', intro: 'Compare up to three exact products from one category and one known type. Unknown price, stock, or attributes stay unknown.', count: (n: number) => `${n} product${n === 1 ? '' : 's'} in compare`, loading: 'Loading comparison…', device: 'This list stays on this device and does not sync to an account.', catalog: 'Catalog', clear: 'Clear', emptyTitle: 'Choose products to compare', emptyText: 'Add two or three exact products of the same known type. Prices are shown only with their check date.', viewCatalog: 'View catalog', missing: 'A selected product is no longer in the catalog. Remove it before comparing the rest.', invalidTitle: 'These products cannot be compared in one table.', invalidText: 'Choose exact products with the same category and known type; unrelated products do not get invented shared attributes.', scrollHint: 'This table scrolls horizontally — use the arrows or swipe left and right.', scrollPrevious: 'Scroll table left', scrollNext: 'Scroll table right', field: 'Field', seller: 'Seller', sku: 'Exact SKU', category: 'Category', price: 'Price', checked: 'Price checked', stock: 'Stock', store: 'Store page', stale: 'Link needs another review', unknownPrice: 'Unknown — check the store', unknown: 'Unknown', inStock: 'In stock when checked', outOfStock: 'Out of stock when checked', remove: 'Remove', aria: 'Product comparison' },
  ru: { title: 'Сравнение товаров', intro: 'Сравнивайте до трёх точных товаров одной категории и одного известного типа. Неизвестные цена, наличие и характеристики так и остаются неизвестными.', count: (n: number) => `${n} товар${n === 1 ? '' : 'а'} в сравнении`, loading: 'Загрузка сравнения…', device: 'Список хранится только на этом устройстве и не синхронизируется с аккаунтом.', catalog: 'Каталог', clear: 'Очистить', emptyTitle: 'Выберите товары для сравнения', emptyText: 'Добавьте два или три точных товара одного известного типа. Цена показывается только вместе с датой проверки.', viewCatalog: 'Открыть каталог', missing: 'Выбранного товара больше нет в каталоге. Удалите его перед сравнением остальных.', invalidTitle: 'Эти товары нельзя сравнить в одной таблице.', invalidText: 'Выберите точные товары одной категории и известного типа; общие характеристики для разных товаров не придумываются.', scrollHint: 'Таблицу можно прокручивать по горизонтали — используйте стрелки или проведите влево/вправо.', scrollPrevious: 'Прокрутить таблицу влево', scrollNext: 'Прокрутить таблицу вправо', field: 'Поле', seller: 'Продавец', sku: 'Точный SKU', category: 'Категория', price: 'Цена', checked: 'Проверка цены', stock: 'Наличие', store: 'Страница магазина', stale: 'Ссылка требует повторной проверки', unknownPrice: 'Неизвестно — проверьте в магазине', unknown: 'Неизвестно', inStock: 'Был в наличии при проверке', outOfStock: 'Не было в наличии при проверке', remove: 'Удалить', aria: 'Сравнение товаров' },
} as const;

const compareEyebrows = { ka: 'ჩემი არჩევანი', en: 'My picks', ru: 'Мой выбор' } as const;
const compareStorageWarnings = { ka: 'ბრაუზერის მეხსიერება მიუწვდომელია — შედარება მხოლოდ ჩანართის დახურვამდე ან გადატვირთვამდე დარჩება.', en: 'Browser storage is unavailable — comparison will last only until this tab is closed or reloaded.', ru: 'Память браузера недоступна — сравнение останется только до закрытия или перезагрузки вкладки.' } as const;

type CompareCopy = (typeof compareCopy)[keyof typeof compareCopy];

function valueFor(row: string, product: RetentionProduct, copy: CompareCopy, locale: 'ka' | 'en' | 'ru'): string {
  if (row === 'seller') return product.merchantName;
  if (row === 'sku') return product.merchantSku;
  if (row === 'category') return getDiscoveryCategoryLabel(product.categoryKey, locale);
  if (row === 'price') return product.price === null ? copy.unknownPrice : formatGel(product.price);
  if (row === 'checked') return formatStorefrontDate(product.checkedAt, locale);
  if (product.availability === 'in_stock') return copy.inStock;
  if (product.availability === 'out_of_stock') return copy.outOfStock;
  return copy.unknown;
}

export function CompareCollectionPage(): React.ReactElement {
  const locale = useLocale();
  const copy = compareCopy[locale];
  const localizeHref = useLocalizedPath();
  const { entries, hydrated, storageMode, removeCompare, clearCompare } = useCompareSelection();
  const [now] = useState(() => Date.now());
  const comparisonScrollerRef = useRef<HTMLDivElement>(null);
  const [comparisonScroll, setComparisonScroll] = useState({ canScrollLeft: false, canScrollRight: false });
  const products = useMemo(() => resolveDiscoveryRetentionProducts(entries.map((entry) => entry.id), now), [entries, now]);
  const missingIds = entries.map((entry) => entry.id).filter((id) => !discoveryItems.some((item) => item.id === id));
  const first = products[0];
  const comparable = products.length >= 2 && entries.length === products.length && Boolean(first?.comparisonKey) && products.every((product) => product.categoryKey === first.categoryKey && product.comparisonKey === first.comparisonKey);
  const rows = [{ key: 'seller', label: copy.seller }, { key: 'sku', label: copy.sku }, { key: 'category', label: copy.category }, { key: 'price', label: copy.price }, { key: 'checked', label: copy.checked }, { key: 'stock', label: copy.stock }];
  const updateComparisonScroll = useCallback(() => {
    const element = comparisonScrollerRef.current;
    if (!element) return;
    const next = { canScrollLeft: element.scrollLeft > 1, canScrollRight: element.scrollLeft + element.clientWidth < element.scrollWidth - 1 };
    setComparisonScroll((current) => current.canScrollLeft === next.canScrollLeft && current.canScrollRight === next.canScrollRight ? current : next);
  }, []);

  useEffect(() => {
    const element = comparisonScrollerRef.current;
    if (!element || !comparable) return;
    updateComparisonScroll();
    element.addEventListener('scroll', updateComparisonScroll, { passive: true });
    window.addEventListener('resize', updateComparisonScroll);
    return () => {
      element.removeEventListener('scroll', updateComparisonScroll);
      window.removeEventListener('resize', updateComparisonScroll);
    };
  }, [comparable, updateComparisonScroll]);

  const nudgeComparison = (direction: -1 | 1): void => {
    const element = comparisonScrollerRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.max(240, element.clientWidth * 0.72), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="tn-page min-h-dvh text-[#101010]
      "><StorefrontHeader /><main>
      <section className="bg-[#101010] px-5 py-12 text-white sm:px-10 sm:py-16"><div className="mx-auto max-w-[1440px]"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FFE622]">{compareEyebrows[locale]}</p><h1 className="mt-5 max-w-4xl break-words text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">{copy.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/80">{copy.intro}</p></div></section>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-10 sm:py-12"><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#092BB4]" aria-live="polite">{hydrated ? copy.count(entries.length) : copy.loading}</p><p className="mt-2 text-sm leading-6 text-[#657080]">{copy.device}</p></div><div className="flex flex-wrap gap-2"><Link href={localizeHref('/products')} className="inline-flex min-h-11 items-center gap-2 border border-black px-4 py-2 text-sm font-bold hover:bg-[#FFE622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]"><ArrowLeft className="size-4" aria-hidden="true" />{copy.catalog}</Link>{hydrated && entries.length > 0 ? <button type="button" onClick={clearCompare} className="inline-flex min-h-11 items-center gap-2 border border-black px-4 py-2 text-sm font-bold hover:bg-[#FFE622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]">{copy.clear}</button> : null}</div></div>
        {hydrated && storageMode === 'session' ? <div role="status" className="mb-6 border border-black bg-[#FFF8C2] p-4 text-sm leading-6">{compareStorageWarnings[locale]}</div> : null}
        {!hydrated ? <div className="border border-black bg-white p-8 text-sm" role="status">{copy.loading}</div> : null}
        {hydrated && entries.length === 0 ? <div className="border border-black bg-[#FAF9F6] p-8 sm:p-12"><GitCompareArrows className="size-10 text-[#092BB4]" aria-hidden="true" /><h2 className="mt-5 text-2xl font-bold">{copy.emptyTitle}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#657080]">{copy.emptyText}</p><Link href={localizeHref('/products')} className="mt-6 inline-flex min-h-11 items-center bg-[#092BB4] px-5 py-3 text-sm font-bold text-white hover:bg-[#061E81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]">{copy.viewCatalog}</Link></div> : null}
        {missingIds.length > 0 ? <div className="mb-6 border border-black bg-[#FFF8C2] p-5 text-sm leading-6">{copy.missing}</div> : null}
        {hydrated && entries.length === 1 && products.length === 1 ? <div className="mb-6 border border-black bg-[#FFF8C2] p-5 text-sm leading-6"><h2 className="font-semibold">{products[0].name}</h2><p className="mt-2">{copy.emptyText}</p><button type="button" onClick={() => removeCompare(products[0].id)} className="mt-3 min-h-11 font-semibold underline" aria-label={`${copy.remove}: ${products[0].name}`}>{copy.remove}</button></div> : null}
        {hydrated && entries.length > 0 && !comparable && !(entries.length === 1 && products.length === 1) ? <div className="mb-6 border border-black bg-[#FFF8C2] p-5 text-sm leading-6"><strong>{copy.invalidTitle}</strong> {copy.invalidText}</div> : null}
      {comparable ? <section aria-labelledby="compare-table-title"><h2 id="compare-table-title" className="sr-only">{copy.aria}</h2><div className="mb-3 flex items-center justify-between gap-3"><p id="compare-scroll-hint" className="flex min-w-0 items-center gap-2 text-xs font-bold leading-5 text-[#657080]"><GitCompareArrows className="size-4 shrink-0 text-[#092BB4]" aria-hidden="true" />{copy.scrollHint}</p><div className="flex shrink-0 gap-2"><button type="button" onClick={() => nudgeComparison(-1)} disabled={!comparisonScroll.canScrollLeft} aria-label={copy.scrollPrevious} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-black bg-[#FAF9F6] hover:bg-[#FFE622] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]"><ChevronLeft className="size-5" aria-hidden="true" /></button><button type="button" onClick={() => nudgeComparison(1)} disabled={!comparisonScroll.canScrollRight} aria-label={copy.scrollNext} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-black bg-[#FAF9F6] hover:bg-[#FFE622] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]"><ChevronRight className="size-5" aria-hidden="true" /></button></div></div><div ref={comparisonScrollerRef} className="overflow-x-auto border border-black bg-[#FAF9F6]" role="region" aria-label={copy.aria} aria-describedby="compare-scroll-hint" tabIndex={0}><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b border-black bg-[#FFE622]"><th scope="col" className="sticky left-0 z-10 w-[155px] bg-[#FFE622] p-4">{copy.field}</th>{products.map((product) => <th key={product.id} scope="col" className="min-w-[205px] p-4 align-top"><div className="relative mb-3 aspect-square w-full max-w-[160px] overflow-hidden bg-[#092BB4]"><DiscoveryProductImage src={product.imageUrl} alt={product.name} sizes="160px" /></div><Link href={localizeHref(`/products/${product.slug}`)} className="font-bold leading-6 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]">{product.name}</Link><button type="button" onClick={() => removeCompare(product.id)} className="mt-3 flex min-h-10 items-center gap-1 text-xs font-bold text-[#092BB4] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]" aria-label={`${copy.remove}: ${product.name}`}><Trash2 className="size-4" aria-hidden="true" />{copy.remove}</button></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.key} className="border-b border-black/15 last:border-0"><th scope="row" className="sticky left-0 z-[1] bg-[#FAF9F6] p-4 align-top font-bold text-[#657080]">{row.label}</th>{products.map((product) => <td key={`${row.key}-${product.id}`} className="p-4 align-top leading-6">{valueFor(row.key, product, copy, locale)}</td>)}</tr>)}<tr><th scope="row" className="sticky left-0 z-[1] bg-[#FAF9F6] p-4 align-top font-bold text-[#657080]">{copy.store}</th>{products.map((product) => { const item = discoveryItems.find((candidate) => candidate.id === product.id); const offer = item ? getDiscoveryOffer(item, now) : null; return <td key={`store-${product.id}`} className="p-4 align-top">{offer ? <a href={`/go/${product.id}`} target="_blank" rel={offer.rel} className="inline-flex min-h-10 items-center gap-2 font-bold text-[#092BB4] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]"><span>{copy.store}</span><ExternalLink className="size-4" aria-hidden="true" /></a> : <span className="text-[#657080]">{copy.stale}</span>}</td>; })}</tr></tbody></table></div></section> : null}
      </section>
    </main><StorefrontFooter /></div>
  );
}
