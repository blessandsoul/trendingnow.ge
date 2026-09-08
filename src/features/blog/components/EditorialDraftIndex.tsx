'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DiscoveryProductImage } from '@/features/storefront/components/DiscoveryProductImage';
import { curatedProductFromDiscoveryId } from '../lib/curated-content';
import { getCuratedCategoryLabel } from '../lib/curated-copy';
import type { EditorialDraftSummary } from '../lib/editorial-drafts';

export function EditorialDraftIndex({ drafts }: { drafts: EditorialDraftSummary[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const categories = [...new Set(drafts.map(d => d.category))];
  const visible = drafts.filter(d => (!category || d.category === category) && `${d.title} ${d.excerpt} ${d.slug} ${d.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase().trim()));
  return <>
    <div className="relative max-w-2xl"><Search className="absolute left-4 top-4 size-5" aria-hidden="true" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по названию, теме или slug" aria-label="Поиск материалов" className="h-14 rounded-none border-black bg-white pl-12 text-base" /></div>
    <div className="my-5 flex flex-wrap gap-2">
      {['',...categories].map(value=><Button key={value} onClick={()=>setCategory(value)} aria-pressed={value===category} variant="outline" className={`h-auto min-h-11 max-w-full rounded-none border-black whitespace-normal ${value===category?'bg-[#FFE622]':''}`}>{value || 'Все темы'}</Button>)}
    </div>
    <p className="mb-6 text-sm" aria-live="polite">Показано: {visible.length} / {drafts.length}. Это черновики, не опубликованные статьи.</p>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visible.map(d=>{
        const leadProduct = curatedProductFromDiscoveryId(d.productIDs[0] ?? '');
        return <article key={d.slug} className="flex min-w-0 flex-col border border-black bg-[#FAF9F6] p-5 sm:p-6">
        <div className="relative -mx-5 -mt-5 mb-5 aspect-square overflow-hidden bg-[#092BB4] sm:-mx-6 sm:-mt-6">
          <DiscoveryProductImage src={leadProduct?.imageUrl ?? null} alt={leadProduct?.name ?? d.title} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
          <span className="absolute left-3 top-3 border border-black/20 bg-[#FFE622] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]">DRAFT · {d.reviewStatus}</span>
        </div>
        <p className="break-words text-xs font-semibold text-[#092BB4]">{getCuratedCategoryLabel(d.category, 'ka')}</p>
        <h2 lang="ka" className="mt-4 break-words text-xl font-semibold leading-8">{d.title}</h2>
        <p lang="ka" className="my-4 text-sm leading-7 text-neutral-700">{d.excerpt}</p>
        {d.commercialBrief && <div className="mb-5 border-l-4 border-[#092BB4] bg-[#FFE622]/30 p-3 text-sm leading-6"><p className="font-semibold">Какой выбор помогает сделать</p><p className="mt-1">{d.commercialBrief.buyerDecision}</p></div>}
        <p className="mt-auto text-xs leading-6 text-neutral-600">{d.wordCount} слов · {d.sourceURLs.length} источников · {d.productIDs.length} товаров</p>
        <Link href={`/editorial-preview/${d.slug}`} className="mt-4 inline-flex min-h-12 items-center justify-between gap-3 border-t border-black pt-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#092BB4]">Читать и проверить<ArrowUpRight className="size-5 shrink-0" aria-hidden="true" /></Link>
      </article>;
      })}
    </div>
    {!visible.length && <p className="border border-black p-8">Материалов пока нет или фильтр ничего не нашёл.</p>}
  </>;
}
