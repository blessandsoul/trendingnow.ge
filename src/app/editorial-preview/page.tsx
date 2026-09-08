import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditorialDraftIndex } from '@/features/blog/components/EditorialDraftIndex';
import { draftSummary, getEditorialDrafts } from '@/features/blog/lib/editorial-drafts';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'Редакционные материалы | TrendingNow.ge',robots:{index:false,follow:false}};

export default function EditorialPreviewPage() {
  if(process.env.NODE_ENV !== 'development') notFound();
  const drafts = getEditorialDrafts().map(draftSummary);
  const revised = drafts.filter(draft => draft.commercialBrief).length;
  return <main className="min-h-dvh bg-[#F4F2ED] pb-12 text-[#101010]">
    <header className="bg-[#092BB4] px-5 py-12 text-white sm:px-10"><p className="text-xs font-bold tracking-widest text-[#FFE622]">TRENDINGNOW / РЕДАКЦИЯ</p><h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">Материалы на проверке: {drafts.length}</h1><p className="mt-6 max-w-2xl leading-7">Локальный просмотр выбранной группы. Источники, редакционная проверка и публикация учитываются отдельно.</p><p className="mt-4 max-w-2xl leading-7 text-[#FFE622]">Покупательский бриф добавлен: {revised} / {drafts.length}. Исходные версии сохранены. Это счётчик переработки, не одобрения к публикации.</p></header>
    <section className="px-5 py-8 sm:px-10"><EditorialDraftIndex drafts={drafts} /></section>
  </main>;
}
