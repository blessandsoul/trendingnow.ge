'use client';

import type React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useLocale, useLocalizedPath } from '@/i18n/context';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { RetentionProductCard } from './RetentionProductCard';
import { useSavedSelection } from '../hooks/useRetention';
import { resolveDiscoveryRetentionProducts } from '../lib/retention-products';
import { discoveryItems } from '../lib/discovery-pilot';

const savedCopy = {
  ka: { eyebrow: 'ჩემი არჩევანი', title: 'შენახული ნივთები', intro: 'აქ ინახება ზუსტად ის ნივთები, რომლებიც ამ მოწყობილობაზე მონიშნე. ანგარიში და ღრუბლოვანი სინქრონიზაცია არ გამოიყენება.', storageWarning: 'ბრაუზერის მეხსიერება მიუწვდომელია — შენახული ნივთები მხოლოდ ჩანართის დახურვამდე ან გადატვირთვამდე დარჩება.', count: (n: number) => `${n} შენახული ნივთი`, loading: 'შენახულები იტვირთება…', notice: 'ფასი და მარაგი შეიძლება შეიცვალოს. გადახდამდე გადაამოწმე ინფორმაცია გამყიდველის გვერდზე.', discover: 'აღმოაჩინე მეტი', removed: 'ნივთი შენახულიდან წაიშალა.', undo: 'დაბრუნება', emptyTitle: 'ჯერ არაფერი შეგინახავს', emptyText: 'დაათვალიერე კატალოგი და მონიშნე გულის ღილაკი, რომ ზუსტი ნივთი ამ მოწყობილობაზე შეინახო.', catalog: 'კატალოგის ნახვა', missing: (n: number) => `${n} შენახული ნივთი ამჟამად აღარ არის კატალოგში.`, delete: 'წაშლა' },
  en: { eyebrow: 'My picks', title: 'Saved products', intro: 'These are the exact items saved on this device. There is no account or cloud sync.', storageWarning: 'Browser storage is unavailable — saved products will last only until this tab is closed or reloaded.', count: (n: number) => `${n} saved product${n === 1 ? '' : 's'}`, loading: 'Loading saved products…', notice: 'Prices and availability can change. Confirm details with the seller before payment.', discover: 'Discover more', removed: 'Product removed from saved.', undo: 'Undo', emptyTitle: 'Nothing saved yet', emptyText: 'Browse the catalog and use the heart button to save an exact product on this device.', catalog: 'View catalog', missing: (n: number) => `${n} saved product${n === 1 ? ' is' : 's are'} no longer in the catalog.`, delete: 'Remove' },
  ru: { eyebrow: 'Мой выбор', title: 'Сохранённые товары', intro: 'Здесь находятся точные товары, сохранённые на этом устройстве. Аккаунт и облачная синхронизация не используются.', storageWarning: 'Память браузера недоступна — сохранённые товары останутся только до закрытия или перезагрузки вкладки.', count: (n: number) => `${n} сохранённ${n === 1 ? 'ый товар' : 'ых товара'}`, loading: 'Загрузка сохранённых…', notice: 'Цена и наличие могут измениться. До оплаты проверьте детали у продавца.', discover: 'Найти ещё', removed: 'Товар удалён из сохранённых.', undo: 'Вернуть', emptyTitle: 'Пока ничего нет', emptyText: 'Откройте каталог и нажмите на сердце, чтобы сохранить точный товар на этом устройстве.', catalog: 'Открыть каталог', missing: (n: number) => `${n} сохранённ${n === 1 ? 'ый товар больше' : 'ых товара больше'} нет в каталоге.`, delete: 'Удалить' },
} as const;

export function SavedCollectionPage(): React.ReactElement {
  const { ids, hydrated, storageMode, removeSaved, restoreSaved } = useSavedSelection();
  const locale = useLocale();
  const copy = savedCopy[locale];
  const localizeHref = useLocalizedPath();
  const [now] = useState(() => Date.now());
  const [removedId, setRemovedId] = useState<string | null>(null);

  const products = useMemo(() => now === null ? [] : resolveDiscoveryRetentionProducts(ids, now), [ids, now]);
  const missingIds = ids.filter((id) => !discoveryItems.some((item) => item.id === id));

  const onRemove = (id: string): void => {
    removeSaved(id);
    setRemovedId(id);
  };

  return (
    <div className="tn-page min-h-dvh text-[#101010]">
      <StorefrontHeader />
      <main>
        <section className="bg-[#092BB4] px-5 py-12 text-white sm:px-10 sm:py-16">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FFE622]">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl break-words text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90">{copy.intro}</p>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-10 sm:py-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#092BB4]" aria-live="polite">{hydrated ? copy.count(ids.length) : copy.loading}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657080]">{copy.notice}</p>
            </div>
            <Link href={localizeHref('/products')} className="inline-flex min-h-11 items-center gap-2 border border-black px-4 py-2 text-sm font-bold transition-colors hover:bg-[#FFE622] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]"><ArrowLeft className="size-4" aria-hidden="true" />{copy.discover}</Link>
          </div>
          {hydrated && storageMode === 'session' ? <div role="status" className="mb-6 border border-black bg-[#FFF8C2] p-4 text-sm leading-6">{copy.storageWarning}</div> : null}

          {removedId ? (
            <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-black bg-[#FFE622] p-4 text-sm font-semibold">
              <span>{copy.removed}</span>
              <button type="button" onClick={() => { restoreSaved(removedId); setRemovedId(null); }} className="inline-flex min-h-10 items-center gap-2 border border-black px-3 py-2 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]"><RotateCcw className="size-4" aria-hidden="true" />{copy.undo}</button>
            </div>
          ) : null}

          {!hydrated || now === null ? <div className="border border-black bg-white p-8 text-sm" role="status">{copy.loading}</div> : null}
          {hydrated && now !== null && products.length === 0 && missingIds.length === 0 ? (
            <div className="border border-black bg-[#FAF9F6] p-8 sm:p-12">
              <Bookmark className="size-10 text-[#092BB4]" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold">{copy.emptyTitle}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#657080]">{copy.emptyText}</p>
              <Link href={localizeHref('/products')} className="mt-6 inline-flex min-h-11 items-center bg-[#092BB4] px-5 py-3 text-sm font-bold text-white hover:bg-[#061E81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4]">{copy.catalog}</Link>
            </div>
          ) : null}
          {missingIds.length > 0 ? <div className="mb-6 border border-black bg-[#FFF8C2] p-5 text-sm leading-6">{copy.missing(missingIds.length)} <button type="button" className="ml-2 font-bold underline" onClick={() => missingIds.forEach(removeSaved)}>{copy.delete}</button></div> : null}
          {products.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <RetentionProductCard key={product.id} product={product} onRemove={() => onRemove(product.id)} />)}</div> : null}
        </section>
      </main>
      <StorefrontFooter />
    </div>
  );
}
