import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CuratedCollectionPost } from '@/features/blog/components/CuratedCollectionPost';
import { addCuratedHeadingIds, curatedProductFromDiscoveryId, type CuratedCollectionContent } from '@/features/blog/lib/curated-content';
import { getEditorialDrafts, renderEditorialMarkdown } from '@/features/blog/lib/editorial-drafts';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'Редакционный черновик | TrendingNow.ge',robots:{index:false,follow:false}};

export default async function EditorialDraftPage({params}:{params:Promise<{slug:string}>}) {
  if(process.env.NODE_ENV !== 'development') notFound();
  const {slug}=await params;
  const draft=getEditorialDrafts().find(d=>d.slug===slug);
  if(!draft) notFound();
  // Adapter only: draft content becomes the shared visual content model, while
  // review status/reasons stay in this preview surface and never enter the
  // public accepted loader.
  const products = draft.productIDs.flatMap((id) => {
    const product = curatedProductFromDiscoveryId(id);
    return product ? [product] : [];
  });
  const collection: CuratedCollectionContent = {
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    category: draft.category,
    tags: draft.tags,
    sourceURLs: draft.sourceURLs,
    sourceDate: products[0]?.checkedAt.slice(0, 10) ?? null,
    disclosure: 'ლოკალური preview — ეს მასალა არ არის მიღებული ან გამოქვეყნებული.',
    locale: 'ka',
    isFallback: false,
    renderedBody: addCuratedHeadingIds(renderEditorialMarkdown(draft.bodyMarkdown)),
    products,
  };
  return <main className="min-h-dvh bg-[#F4F2ED] pb-14 text-[#101010]">
    <header className="bg-[#092BB4] px-5 py-6 text-white sm:px-10"><div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><Link href="/editorial-preview" className="inline-flex min-h-11 items-center underline underline-offset-4">← Все материалы</Link><div><p className="text-xs font-bold tracking-[0.14em] text-[#FFE622]">LOCAL DRAFT PREVIEW · {draft.reviewStatus}</p><p className="mt-1 text-sm leading-6 text-white/85">Только для редакционной проверки. Не принято и не опубликовано.</p></div></div></header>
    <CuratedCollectionPost collection={collection} locale="ka" />
    <section className="storefront-container max-w-6xl pb-8" aria-labelledby="preview-review">
      <div className="border border-black bg-[#FAF9F6] p-5 sm:p-7">
        <h2 id="preview-review" className="text-xl font-bold">До публикации</h2>
        <p className="mt-2 text-sm leading-7 text-[#526071]">Статус: <strong className="text-[#101010]">{draft.reviewStatus}</strong>. Эти заметки относятся к проверке и не являются признаком READY.</p>
        {draft.holdReasons.length > 0 ? <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7">{draft.holdReasons.map(reason => <li key={reason} className="break-words">{reason}</li>)}</ul> : <p className="mt-5 text-sm leading-7 text-[#526071]">Дополнительных замечаний пока нет.</p>}
        {draft.commercialBrief && <section className="mt-7 border-t border-black/20 pt-6 text-sm leading-7"><h3 className="font-bold">Покупательский выбор</h3><p className="mt-3">{draft.commercialBrief.buyerDecision}</p><p className="mt-3">{draft.commercialBrief.choiceReason}</p><p className="mt-3 text-[#526071]">Пересечение тем: {draft.commercialBrief.intentOverlapRisk}</p></section>}
        <p className="mt-7 border-t border-black/20 pt-5 text-sm leading-7 text-[#526071]">Связанные product ID: {draft.productIDs.join(', ')}</p>
      </div>
    </section>
  </main>;
}
