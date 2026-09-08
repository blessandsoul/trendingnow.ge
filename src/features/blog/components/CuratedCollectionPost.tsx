import type React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ChevronRightIcon, HomeIcon } from 'lucide-react';

import { DiscoveryProductImage } from '@/features/storefront/components/DiscoveryProductImage';
import { getCuratedCategoryLabel, getCuratedCollectionCopy, getDiscoveryCategoryLabel } from '../lib/curated-copy';
import { localizedPath, type BlogLocale } from '../lib/locales';
import { TableOfContents } from './TableOfContents';
import type { CuratedCollectionContent } from '../lib/curated-content';

function formatDate(date: string, locale: BlogLocale): string {
  const dateLocale = locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US';
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export interface CuratedCollectionReviewMetadata {
  /** Kept outside the UI content model so preview metadata cannot imply admission. */
  reviewedAt?: string;
}

function ProductCard({ collection, product, locale }: { collection: CuratedCollectionContent; product: CuratedCollectionContent['products'][number]; locale: BlogLocale }): React.ReactElement {
  const copy = getCuratedCollectionCopy(locale);
  return (
    <article className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-start border border-black/30 bg-[#FAF9F6] sm:flex sm:flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-[#092BB4]">
        <DiscoveryProductImage src={product.imageUrl} alt={product.name} sizes="(max-width: 640px) 96px, (max-width: 1024px) 50vw, 33vw" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-[#092BB4]">{product.merchantName} · {getDiscoveryCategoryLabel(product.category, locale)}</p>
        <h3 className="mt-2 break-words text-base font-semibold leading-7 text-[#101010] sm:text-lg">{product.name}</h3>
        <dl className="mt-4 space-y-2 text-xs leading-5 text-[#526071]">
          <div className="flex min-w-0 gap-2"><dt className="shrink-0 font-semibold text-[#101010]">{copy.sku}</dt><dd className="break-all">{product.merchantSku}</dd></div>
          <div className="flex min-w-0 flex-wrap gap-x-2"><dt className="font-semibold text-[#101010]">{copy.checked}</dt><dd><time dateTime={product.checkedAt}>{formatDate(product.checkedAt.slice(0, 10), locale)}</time></dd></div>
          <div className="flex min-w-0 flex-wrap gap-x-2"><dt className="font-semibold text-[#101010]">{copy.observedPrice}</dt><dd>{product.price === null ? copy.priceUnavailable : `${product.price.toLocaleString(locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US')} ₾`}</dd></div>
        </dl>
        <Link
          href={localizedPath(locale, `/products/${product.slug}`)}
          className="mt-5 inline-flex min-h-11 items-center justify-between gap-2 border-t border-black/20 pt-3 text-sm font-bold text-[#061E81] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#092BB4]"
        >
          {copy.exactProduct}
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-10 items-center text-xs font-semibold text-[#526071] underline underline-offset-4 hover:text-[#061E81] focus-visible:outline-2 focus-visible:outline-[#092BB4]"
        >
          {copy.source}: {product.merchantName}
        </a>
      </div>
      <span className="sr-only">{collection.slug}</span>
    </article>
  );
}

export function CuratedCollectionPost({ collection, locale, reviewMetadata }: { collection: CuratedCollectionContent; locale: BlogLocale; reviewMetadata?: CuratedCollectionReviewMetadata }): React.ReactElement {
  const copy = getCuratedCollectionCopy(locale);

  return (
    <article className="storefront-container max-w-6xl py-8 md:py-14">
      <nav aria-label={copy.back} className="mb-7 flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-[#526071]">
        <Link href={localizedPath(locale, '/')} className="inline-flex min-h-10 items-center gap-1 hover:text-[#101010] focus-visible:outline-2 focus-visible:outline-[#092BB4]">
          <HomeIcon className="size-3.5" aria-hidden="true" /><span className="sr-only">{copy.back}</span>
        </Link>
        <ChevronRightIcon className="size-3.5 text-[#8B96A5]" aria-hidden="true" />
        <Link href={localizedPath(locale, '/blog')} className="inline-flex min-h-10 items-center hover:text-[#101010] focus-visible:outline-2 focus-visible:outline-[#092BB4]">{copy.eyebrow}</Link>
      </nav>

      {collection.isFallback && <p className="mb-6 border border-[#092BB4]/30 bg-[#EEF2FF] p-4 text-sm font-semibold leading-6 text-[#061E81]">{copy.fallback}</p>}

      <header className="border-b border-black/20 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#092BB4]">
          <span className="bg-[#FFE622] px-2.5 py-1 text-[#101010]">{getCuratedCategoryLabel(collection.category, locale)}</span>
          <span>{collection.products.length} {copy.relatedProducts.toLocaleLowerCase(locale)}</span>
        </div>
        <h1 className="tn-page-title mt-5 max-w-5xl">{collection.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[#303844]">{collection.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[#526071]">
          <span>{copy.sourceDate}: {collection.sourceDate ? <time dateTime={collection.sourceDate}>{formatDate(collection.sourceDate, locale)}</time> : copy.sourceDateUnavailable}</span>
          {reviewMetadata?.reviewedAt && <><span aria-hidden="true">/</span><span>{copy.checked}: <time dateTime={reviewMetadata.reviewedAt}>{formatDate(reviewMetadata.reviewedAt.slice(0, 10), locale)}</time></span></>}
        </div>
      </header>

      <section className="mt-8 border-b border-black/20 pb-10" aria-labelledby="collection-products">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="tn-kicker text-[#092BB4]">{copy.eyebrow}</p>
            <h2 id="collection-products" className="tn-section-title mt-2">{copy.relatedProducts}</h2>
          </div>
          <p className="text-sm text-[#526071]">{copy.exactProducts}</p>
        </div>
        {collection.products.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {collection.products.map((product) => <ProductCard key={product.id} collection={collection} product={product} locale={locale} />)}
        </div> : <p className="border border-dashed border-black/30 bg-[#FAF9F6] p-5 text-sm leading-7 text-[#526071]">{copy.noProducts}</p>}
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-24 lg:block"><TableOfContents content={collection.renderedBody} locale={locale} /></aside>
        <div className="min-w-0">
          <div className="mb-8 lg:hidden"><TableOfContents content={collection.renderedBody} locale={locale} /></div>
          <section
            lang={collection.isFallback ? 'ka' : collection.locale}
            className="prose prose-lg max-w-none min-w-0 break-words prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#101010] prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-2xl prose-h2:md:text-3xl prose-h3:mb-3 prose-h3:mt-7 prose-h3:text-xl prose-p:mb-5 prose-p:leading-8 prose-p:text-[#526071] prose-a:font-semibold prose-a:text-[#061E81] prose-a:no-underline hover:prose-a:underline prose-li:text-[#526071] prose-li:marker:text-[#092BB4] prose-strong:font-semibold prose-strong:text-[#101010] [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&>*:first-child]:!mt-0"
            dangerouslySetInnerHTML={{ __html: collection.renderedBody }}
          />
        </div>
      </div>

      <aside className="mt-10 grid gap-5 border-t border-black/20 pt-8 text-sm leading-7 text-[#526071] md:grid-cols-2">
        <section>
          <h2 className="font-bold text-[#101010]">{copy.source}</h2>
          <ul className="mt-3 space-y-2">
            {collection.sourceURLs.map((url) => <li key={url} className="min-w-0"><a href={url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-4 hover:text-[#061E81]">{url}</a></li>)}
          </ul>
        </section>
        <section className="border-l-4 border-[#FFE622] bg-[#FAF9F6] p-4 md:self-start">
          <h2 className="font-bold text-[#101010]">{copy.disclosure}</h2>
          <p className="mt-2">{collection.disclosure}</p>
        </section>
      </aside>

      <Link href={localizedPath(locale, '/blog')} className="mt-10 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#061E81] underline-offset-4 hover:gap-3 hover:underline focus-visible:outline-2 focus-visible:outline-[#092BB4]"><ArrowLeft className="size-4" aria-hidden="true" />{copy.back}</Link>
    </article>
  );
}
