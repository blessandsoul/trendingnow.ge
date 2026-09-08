'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiscoveryProductImage } from '@/features/storefront/components/DiscoveryProductImage';
import { getCuratedCategoryLabel, getCuratedCollectionCopy } from '../lib/curated-copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import type { CuratedCollectionContent } from '../lib/curated-content';

function CollectionCard({ collection, locale }: { collection: CuratedCollectionContent; locale: BlogLocale }): React.ReactElement {
  const copy = getCuratedCollectionCopy(locale);
  const leadProduct = collection.products[0];

  return (
    <Link
      href={localizedPath(locale, `/blog/${collection.slug}`)}
      className={cn(
        'group flex min-w-0 flex-col overflow-hidden border border-black/30 bg-[#FAF9F6]',
        'transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#092BB4] hover:shadow-[0_16px_34px_rgba(9,43,180,0.14)] motion-reduce:transform-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4] focus-visible:ring-offset-2',
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-[#092BB4]">
        {leadProduct ? (
          <DiscoveryProductImage src={leadProduct.imageUrl} alt={leadProduct.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 bg-[#092BB4]" aria-hidden="true" />
        )}
        <div className="absolute left-3 top-3 border border-black/20 bg-[#FFE622] px-2.5 py-1 text-xs font-bold text-[#101010]">
          {getCuratedCategoryLabel(collection.category, locale)}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#092BB4]">
          {copy.exactProducts}: {collection.products.length}
        </p>
        <h3 className="mt-3 break-words text-xl font-bold leading-[1.2] text-[#101010] transition-colors group-hover:text-[#061E81]">
          {collection.title}
        </h3>
        <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#303844]">{collection.excerpt}</p>
        <span className="mt-5 inline-flex min-h-11 items-center gap-2 border-t border-black/20 pt-3 text-sm font-bold text-[#061E81]">
          {copy.read}
          <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

interface CuratedCollectionGridProps {
  collections: CuratedCollectionContent[];
  locale: BlogLocale;
}

export function CuratedCollectionGrid({ collections, locale }: CuratedCollectionGridProps): React.ReactElement {
  const copy = getCuratedCollectionCopy(locale);
  const [category, setCategory] = useState('');
  const categories = useMemo(() => [...new Set(collections.map((collection) => collection.category))], [collections]);
  const visible = category ? collections.filter((collection) => collection.category === category) : collections;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2" aria-label={copy.allCategories}>
        <button
          type="button"
          onClick={() => setCategory('')}
          aria-pressed={!category}
          className={cn(
            'min-h-11 border border-black/40 px-3 py-2 text-sm font-semibold transition-colors',
            !category ? 'bg-[#FFE622] text-[#101010]' : 'bg-white hover:border-[#092BB4] hover:text-[#061E81]',
          )}
        >
          {copy.allCategories}
        </button>
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
            className={cn(
              'min-h-11 max-w-full break-words border border-black/40 px-3 py-2 text-sm font-semibold transition-colors',
              category === item ? 'bg-[#FFE622] text-[#101010]' : 'bg-white hover:border-[#092BB4] hover:text-[#061E81]',
            )}
          >
            {getCuratedCategoryLabel(item, locale)}
          </button>
        ))}
      </div>
      <p className="mb-5 text-sm font-semibold text-[#526071]" aria-live="polite">{copy.collectionCount(visible.length)}</p>
      {visible.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((collection) => <CollectionCard key={collection.slug} collection={collection} locale={locale} />)}
        </div>
      ) : (
        <p className="border border-black/30 bg-white p-6 text-sm leading-7 text-[#526071]">{copy.collectionCount(0)}</p>
      )}
    </div>
  );
}

export function CuratedCollectionSection({ collections, locale }: CuratedCollectionGridProps): React.ReactElement | null {
  if (!collections.length) return null;
  const copy = getCuratedCollectionCopy(locale);
  return (
    <section aria-labelledby="curated-collections" className="mb-16 border-y border-black/20 bg-[#F4F2ED] py-10 md:py-14">
      <div className="storefront-container">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="tn-kicker text-[#092BB4]">{copy.eyebrow}</p>
            <h2 id="curated-collections" className="tn-section-title mt-3">{copy.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#526071]">{copy.intro}</p>
          </div>
        </div>
        <CuratedCollectionGrid collections={collections} locale={locale} />
      </div>
    </section>
  );
}
