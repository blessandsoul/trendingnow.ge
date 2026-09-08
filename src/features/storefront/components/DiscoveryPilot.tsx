'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Bluetooth, ExternalLink, Hand, Search, SlidersHorizontal, Usb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale, useLocalizedPath } from '@/i18n/context';
import { StorefrontFooter } from './StorefrontFooter';
import { StorefrontHeader } from './StorefrontHeader';
import { SavedToggle } from './SavedToggle';
import { CompareToggle } from './CompareToggle';
import { DiscoveryProductImage } from './DiscoveryProductImage';
import { getDiscoveryComparisonKey } from '../lib/retention-products';
import { getDiscoveryFacts } from '../lib/discovery-facts';
import { discoveryMerchants, getDiscoveryEvidenceState, getDiscoveryOffer, searchDiscovery, type DiscoveryCategory, type DiscoveryItem } from '../lib/discovery-pilot';

type DiscoveryFilters = { search?: string; category?: string; minPrice?: number; maxPrice?: number };

const labels = {
  ka: {
    eyebrow: 'ზუსტი გარე შეთავაზებები', title: 'იპოვე. შეადარე. აირჩიე.',
    intro: 'TrendingNow გეხმარება არჩევანში. ყიდვა, გადახდა და მიწოდება ხდება გამყიდველთან — არა TrendingNow-ზე.', search: 'მოძებნე მოდელი, ნივთი ან SKU', all: 'ყველა', workspace: 'სამუშაო სივრცე', tech: 'ტექნიკა', home: 'სახლი', kitchen: 'სამზარეულო', care: 'მოვლა', view: 'დეტალების ნახვა', buy: 'ნახე მაღაზიაში', seller: 'გამყიდველი', checked: 'შემოწმებულია', price: 'ფასი', unknownPrice: 'ფასი ხელახლა გადაამოწმე მაღაზიაში', stale: 'ფასი ძველია — გადაამოწმე მაღაზიაში', fresh: 'ფასი შემოწმებულია', notice: 'ფასი და მარაგი შეიძლება შეიცვალოს. მიწოდების ღირებულება, ვადა, გარანტია და დაბრუნების პირობები გადაამოწმე გამყიდველთან გადახდამდე.', photo: 'ზუსტი ფოტო იხილე გამყიდველის გვერდზე', back: 'ყველა ნივთი', empty: 'ამ ძიებით ზუსტი შეთავაზება ვერ მოიძებნა.', emptyHint: 'სცადე მოდელის სახელი, SKU ან მოკლე სიტყვა; ასევე შეგიძლია გაასუფთაო ფილტრები.', expired: 'ეს შეთავაზება ხელახლა მოწმდება. მაღაზიაში გადასვლა დროებით მიუწვდომელია.', disclosure: 'სარედაქციო ბმული. ეს არ არის ფასიანი განთავსება ან დადასტურებული პარტნიორობა.', external: 'გამყიდველის საიტი გაიხსნება ახალ ჩანართში', count: 'შეთავაზება', exact: 'ზუსტი მოდელი', source: 'წყარო', variant: 'მოდელი / ვარიანტი', differences: 'დადასტურებული განსხვავებები', unknown: 'ამ ჩანაწერში დამატებითი მახასიათებლები დადასტურებული არ არის.', freshState: 'დადასტურებული ფასი', staleState: 'ფასი საჭიროებს განახლებას', expiredState: 'ბმული საჭიროებს შემოწმებას', budget: 'ბიუჯეტი', anyBudget: 'ნებისმიერი ბიუჯეტი', under100: '100 ₾-მდე', under300: '300 ₾-მდე', reset: 'ფილტრების გასუფთავება',
  },
  en: {
    eyebrow: 'Exact external offers', title: 'Find. Compare. Choose.', intro: 'TrendingNow helps with the choice. Purchase, payment and delivery happen with the seller, not on TrendingNow.', search: 'Search model, item or SKU', all: 'All', workspace: 'Workspace', tech: 'Tech', home: 'Home', kitchen: 'Kitchen', care: 'Care', view: 'View details', buy: 'View at store', seller: 'Seller', checked: 'Checked', price: 'Price', unknownPrice: 'Check price again at store', stale: 'Price is dated — check at store', fresh: 'Price checked', notice: 'Prices and stock can change. Confirm delivery cost, timing, warranty and returns with the seller before payment.', photo: 'See exact photography on the seller page', back: 'All items', empty: 'No exact offer matched this search.', emptyHint: 'Try a model name, SKU or shorter term, or clear the filters.', expired: 'This offer needs another review. The store link is temporarily unavailable.', disclosure: 'Editorial link. Not a paid placement or confirmed partnership.', external: 'Seller website opens in a new tab', count: 'offers', exact: 'Exact model', source: 'Source', variant: 'Model / variant', differences: 'Confirmed differences', unknown: 'Additional specifications are not confirmed in this record.', freshState: 'Confirmed price', staleState: 'Price needs an update', expiredState: 'Link needs review', budget: 'Budget', anyBudget: 'Any budget', under100: 'Up to 100 ₾', under300: 'Up to 300 ₾', reset: 'Clear filters',
  },
  ru: {
    eyebrow: 'Точные внешние предложения', title: 'Найди. Сравни. Выбери.', intro: 'TrendingNow помогает выбрать. Покупка, оплата и доставка происходят у продавца, не на TrendingNow.', search: 'Модель, товар или SKU', all: 'Все', workspace: 'Рабочее место', tech: 'Техника', home: 'Дом', kitchen: 'Кухня', care: 'Уход', view: 'Подробнее', buy: 'Посмотреть в магазине', seller: 'Продавец', checked: 'Проверено', price: 'Цена', unknownPrice: 'Уточните цену в магазине', stale: 'Цена устарела — проверьте в магазине', fresh: 'Цена проверена', notice: 'Цена и наличие могут измениться. До оплаты проверьте у продавца стоимость и сроки доставки, гарантию и условия возврата.', photo: 'Точные фото — на странице продавца', back: 'Все товары', empty: 'Точное предложение не найдено.', emptyHint: 'Попробуйте модель, SKU или более короткий запрос; также можно очистить фильтры.', expired: 'Предложение требует повторной проверки. Переход в магазин временно недоступен.', disclosure: 'Редакционная ссылка. Не платное размещение и не подтверждённое партнёрство.', external: 'Сайт продавца откроется в новой вкладке', count: 'предложений', exact: 'Точная модель', source: 'Источник', variant: 'Модель / вариант', differences: 'Подтверждённые различия', unknown: 'Дополнительные характеристики в этой записи не подтверждены.', freshState: 'Цена подтверждена', staleState: 'Цену нужно обновить', expiredState: 'Ссылку нужно проверить', budget: 'Бюджет', anyBudget: 'Любой бюджет', under100: 'До 100 ₾', under300: 'До 300 ₾', reset: 'Очистить фильтры',
  },
} as const;


const categories: DiscoveryCategory[] = ['workspace', 'tech', 'home', 'kitchen', 'care'];
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#092BB4]';
type DiscoveryCopy = (typeof labels)[keyof typeof labels];
function formatPrice(price: number | null | undefined, fallback: string): string { return price == null ? fallback : `${price.toFixed(2)} ₾`; }

const decisionCopy = {
  ka: {
    heading: 'რა გადაამოწმო არჩევამდე', research: 'წყაროს მიხედვით — პირადად არ გამოგვიცდია',
    stock: 'მარაგი და საბოლოო თანხა მაღაზიაში გადაამოწმე.',
    shipping: 'ბიუჯეტი ეხება ნივთს; მიწოდება არ არის ჩათვლილი.',
    report: 'შეცდომის შეტყობინება', mailHint: 'გაიხსნება ელფოსტის აპი. წერილი თავად უნდა გაგზავნო.',
    controls: 'შეინახე ან შეადარე', sourceTitle: 'წყარო და ინფორმაციის თარიღი',
    checks: {
      workspace: ['თავსებადია შენს მოწყობილობასთან და სამუშაო პროგრამებთან?', 'რომელი პორტი, პროგრამა ან დამატებითი აქსესუარი სჭირდება?', 'ზომა და კომპლექტი შეესაბამება შენს სამუშაო ადგილს?'],
      tech: ['ემთხვევა მოწყობილობის პორტი და საჭირო სიმძლავრე?', 'შედის საჭირო კაბელი ან ადაპტერი კომპლექტში?', 'შეესაბამება ზომა და დანიშნულება შენს ყოველდღიურობას?'],
      home: ['ეტევა შერჩეულ ადგილზე და როგორ მაგრდება?', 'სჭირდება ცალკე ბაზა, ჰაბი ან სხვა მოწყობილობა?', 'სად იშოვება საჭირო ნაწილები და სახარჯი მასალა?'],
      kitchen: ['მოცულობა და ზომა შენს საჭიროებას შეესაბამება?', 'როგორ ირეცხება და რომელი ნაწილები იხსნება?', 'რა შედის კომპლექტში და სად არის მომსახურება?'],
      care: ['რომელი რეჟიმები და აქსესუარები მოჰყვება?', 'წონა, ზომა და მოვლის წესი შენთვის მოსახერხებელია?', 'რა პირობები ვრცელდება ამ ნივთის დაბრუნებაზე?'],
    },
  },
  en: {
    heading: 'Check before choosing', research: 'Source-based record — not a hands-on test',
    stock: 'Confirm stock and the final total at the store.', shipping: 'Budget covers the item only; delivery is not included.',
    report: 'Report an error', mailHint: 'Your email app opens. You still need to send the message.',
    controls: 'Save or compare', sourceTitle: 'Source and observation date',
    checks: {
      workspace: ['Will it work with your device and the software you need?', 'Which port, software or extra accessory does it need?', 'Do the dimensions and package suit your workspace?'],
      tech: ['Do the connector and power requirements match your device?', 'Is the cable or adapter you need included?', 'Do the dimensions and intended use suit your routine?'],
      home: ['Will it fit the space, and how is it installed?', 'Does it need a separate base, hub or other device?', 'Where can you get any replacement parts or consumables?'],
      kitchen: ['Do the capacity and dimensions meet your needs?', 'How is it cleaned, and which parts are removable?', 'What is included, and where is servicing available?'],
      care: ['Which settings and accessories are included?', 'Are its weight, size and cleaning requirements convenient?', 'What return conditions apply to this kind of item?'],
    },
  },
  ru: {
    heading: 'Что проверить перед выбором', research: 'По сведениям источника — не личный тест',
    stock: 'Наличие и итоговую сумму уточни в магазине.', shipping: 'Бюджет относится к товару, без стоимости доставки.',
    report: 'Сообщить об ошибке', mailHint: 'Откроется почтовое приложение. Письмо нужно отправить самостоятельно.',
    controls: 'Сохрани или сравни', sourceTitle: 'Источник и дата наблюдения',
    checks: {
      workspace: ['Подойдёт ли к твоему устройству и нужным программам?', 'Какой порт, программа или дополнительный аксессуар необходимы?', 'Удобны ли размеры и комплектация для твоего рабочего места?'],
      tech: ['Совпадают ли разъём и требования к питанию твоего устройства?', 'Есть ли нужный кабель или адаптер в комплекте?', 'Подходят ли размеры и назначение для твоих задач?'],
      home: ['Поместится ли в выбранном месте и как устанавливается?', 'Нужна ли отдельная база, хаб или другое устройство?', 'Где найти необходимые запчасти и расходники?'],
      kitchen: ['Подходят ли объём и размеры для твоих привычек?', 'Как мыть устройство и какие детали снимаются?', 'Что входит в комплект и где доступно обслуживание?'],
      care: ['Какие режимы и насадки входят в комплект?', 'Удобны ли вес, размер и правила ухода?', 'Какие условия возврата действуют для этой вещи?'],
    },
  },
} as const;

function RetentionControls({ item }: { item: DiscoveryItem }) {
  return <div className="flex shrink-0 gap-2"><SavedToggle productId={item.id} productName={item.name} /><CompareToggle productId={item.id} categoryKey={item.category} comparisonKey={getDiscoveryComparisonKey(item.id)} productName={item.name} /></div>;
}

const specIcons = { hand: Hand, bluetooth: Bluetooth, usb: Usb };

function SpecificationList({ facts }: { facts: NonNullable<ReturnType<typeof getDiscoveryFacts>> }) {
  const locale = useLocale();
  return <ul data-product-specs className="space-y-3 text-sm leading-6">{facts[locale].map((text, index) => {
    const Icon = specIcons[facts.icons[index]];
    return <li key={text} className="flex min-w-0 items-start gap-2.5"><Icon className="mt-1 size-4 shrink-0 text-neutral-600" strokeWidth={1.7} aria-hidden="true" /><span className="min-w-0">{text}</span></li>;
  })}</ul>;
}

function OfferCard({ item, now, copy }: { item: DiscoveryItem; now: number; copy: DiscoveryCopy }) {
  const facts = getDiscoveryFacts(item);
  const localPath = useLocalizedPath();
  const offer = getDiscoveryOffer(item, now);
  const state = getDiscoveryEvidenceState(item, now);
  return <article data-discovery-offer={item.id} className="flex min-w-0 flex-col border border-black/35 bg-[#FAF9F6]">
    <div className="relative flex aspect-square min-h-24 items-center justify-center overflow-hidden bg-[#092BB4] p-4 text-white"><DiscoveryProductImage src={item.imageUrl} alt={item.name} /></div>
    <div className="flex flex-1 flex-col p-4">
       <p className="text-xs font-semibold text-[#061E81]">{discoveryMerchants[item.merchantId]?.name} · {copy[item.category]}</p>
       <p className="mt-2 break-all text-xs leading-5 text-neutral-600">{copy.exact} · SKU: {item.merchantSku}</p>
      <h2 className="my-4 break-words text-lg font-semibold leading-7"><Link href={localPath(`/products/${item.slug}`)} className={`hover:underline ${focus}`}>{item.name}</Link></h2>
      {facts && <div className="mb-4"><SpecificationList facts={facts} /></div>}
      <div className="mt-auto"><p className={`font-bold tabular-nums ${offer?.price == null ? 'text-base leading-6' : 'text-2xl'}`}>{formatPrice(offer?.price, copy.unknownPrice)}</p><p className="mt-2 text-xs leading-5 text-neutral-600">{state === 'expired' ? copy.expiredState : offer?.price == null ? copy.staleState : copy.fresh} · <time dateTime={item.checkedAt}>{item.checkedAt.slice(0, 10)}</time></p></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/25 pt-3"><Link href={localPath(`/products/${item.slug}`)} className={`inline-flex min-h-11 items-center gap-2 text-sm font-semibold ${focus}`}>{copy.view}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></Link><RetentionControls item={item} /></div>
    </div>
  </article>;
}

function OfferDetail({ item, now, copy }: { item: DiscoveryItem; now: number; copy: DiscoveryCopy }) {
  const locale = useLocale();
  const facts = getDiscoveryFacts(item);
  const localPath = useLocalizedPath();
  const decision = decisionCopy[locale];
  const offer = getDiscoveryOffer(item, now);
  const state = getDiscoveryEvidenceState(item, now);
  const reportHref = `mailto:contact@ainow.ge?subject=${encodeURIComponent(`TrendingNow: ${item.merchantSku}`)}&body=${encodeURIComponent(`Product: ${item.name}\nSKU: ${item.merchantSku}\nCard: https://trendingnow.ge/products/${item.slug}\nSource: ${item.productUrl}\n\n`)}`;
  return <main className="mx-auto w-full max-w-[1600px] px-5 pb-12 pt-6 sm:px-10">
    <Link href={localPath('/products')} className={`inline-flex min-h-11 items-center gap-2 text-sm underline ${focus}`}><ArrowLeft className="size-4" aria-hidden="true" />{copy.back}</Link>
    <p className="mt-4 text-xs font-semibold text-[#092BB4]">{decision.research}</p>
    <h1 className="mt-3 max-w-5xl break-words text-[clamp(1.6rem,3.5vw,3rem)] font-bold leading-[1.2]">{item.name}</h1>
     <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
       <div className="relative flex aspect-square min-w-0 items-center justify-center overflow-hidden bg-[#092BB4] p-6 text-white"><DiscoveryProductImage src={item.imageUrl} alt={item.name} sizes="(max-width: 1024px) 100vw, 42vw" /></div>
      <section className="min-w-0 border border-black/30 bg-white p-5 sm:p-7" aria-label={copy.exact}>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{copy.seller}: <strong>{discoveryMerchants[item.merchantId]?.name}</strong></p><span className="bg-[#FFE622] px-3 py-2 text-xs font-semibold">{state === 'expired' ? copy.expiredState : offer?.price == null ? copy.staleState : copy.freshState}</span></div>
        <p className={`mt-5 font-bold tabular-nums ${offer?.price == null ? 'text-xl leading-7' : 'text-3xl'}`}>{formatPrice(offer?.price, copy.unknownPrice)}</p>
        <p className="mt-2 text-xs leading-5 text-neutral-600">{copy.checked}: <time dateTime={item.checkedAt}>{item.checkedAt.slice(0, 10)}</time> · GEL</p>
        <p className="mt-3 text-sm leading-6">{decision.stock}</p>
        {facts && <div className="mt-4"><SpecificationList facts={facts} /><p className="mt-2 text-xs leading-5 text-neutral-600">{copy.source}: <a href={facts.source} target="_blank" rel="noopener noreferrer" className={`underline ${focus}`}>Logitech</a> · <time dateTime={facts.checkedAt}>{facts.checkedAt}</time></p></div>}
        {offer ? <><Button asChild className="mt-5 h-auto min-h-14 w-full justify-between gap-3 rounded-none bg-[#092BB4] p-4 text-base whitespace-normal hover:bg-[#061E81]"><a href={`/go/${item.id}`} target="_blank" rel={offer.rel} aria-describedby="external-store-note">{copy.buy} · {discoveryMerchants[item.merchantId]?.name}<ExternalLink className="size-5 shrink-0" aria-hidden="true" /></a></Button><p id="external-store-note" className="mt-2 text-xs leading-5 text-neutral-600">{copy.external} · {new URL(offer.href).hostname}</p></> : <p role="status" className="mt-5 border border-black bg-[#FFE622] p-4 text-sm leading-6">{copy.expired}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-black/20 py-4"><p className="text-sm">{decision.controls}</p><RetentionControls item={item} /></div>
        <dl className="mt-5 grid gap-3 text-sm leading-6"><div><dt className="font-semibold">SKU</dt><dd className="break-all">{item.merchantSku}</dd></div><div><dt className="font-semibold">{copy.variant}</dt><dd>{item.name}</dd></div></dl>
      </section>
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="border-t border-black/30 pt-5"><h2 className="text-xl font-bold">{decision.heading}</h2><ul className="mt-4 space-y-3 text-sm leading-7">{decision.checks[item.category].map((text,index)=><li key={text} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center bg-[#FFE622] text-xs font-bold">{index+1}</span><span>{text}</span></li>)}</ul>{!facts && <p className="mt-4 text-xs leading-6 text-neutral-600">{copy.unknown}</p>}</section>
      <section className="min-w-0 border-t border-black/30 pt-5"><h2 className="text-xl font-bold">{decision.sourceTitle}</h2><p className="mt-4 text-sm leading-7">{copy.notice}</p><p className="mt-4 text-xs leading-6 text-neutral-600">{copy.source}: <a className={`underline ${focus}`} href={item.productUrl} target="_blank" rel="noopener noreferrer">{new URL(item.productUrl).hostname}</a> · <time dateTime={item.checkedAt}>{item.checkedAt.slice(0, 10)}</time><br />{copy.disclosure}</p><a href={reportHref} className={`mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline ${focus}`}>{decision.report}</a><p className="text-xs leading-6 text-neutral-600">{decision.mailHint}</p></section>
    </div>
  </main>;
}

export function DiscoveryPilot({ now, item, initialFilters, onFiltersChange, shell = true }: { now: number; item?: DiscoveryItem; initialFilters?: DiscoveryFilters; onFiltersChange?: (filters: DiscoveryFilters) => void; shell?: boolean }) {
  const locale = useLocale();
  const copy = labels[locale];
  const decision = decisionCopy[locale];
  const sourceKey = JSON.stringify(initialFilters ?? {});
  const [previousSource, setPreviousSource] = useState(sourceKey);
  const [filters, setFilters] = useState<DiscoveryFilters>(initialFilters ?? {});
  // URL navigation (including Back) restores state without remounting the input.
  // Draft keystrokes filter locally; explicit submission records one history entry.
  if (sourceKey !== previousSource) { setPreviousSource(sourceKey); setFilters(initialFilters ?? {}); }
  const query = filters.search ?? '';
  const category = filters.category ?? '';
  const items = searchDiscovery(query, category, now, filters.minPrice, filters.maxPrice);
  const commit = (next: DiscoveryFilters): void => { setFilters(next); onFiltersChange?.(next); };
  const active = Boolean(query || category || filters.minPrice !== undefined || filters.maxPrice !== undefined);
  const content = item ? <OfferDetail item={item} now={now} copy={copy} /> : <main className="pb-12">
    <section className="bg-[#092BB4] px-5 py-6 text-white sm:px-10 sm:py-8"><div className="mx-auto w-full max-w-[1600px]"><p className="text-xs font-semibold text-[#FFE622]">{copy.eyebrow}</p><h1 className="mt-3 max-w-5xl text-3xl font-bold leading-[1.2] sm:text-5xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">{copy.intro}</p></div></section>
    <section className="mx-auto w-full max-w-[1600px] px-5 py-5 sm:px-10">
      <form role="search" onSubmit={event=>{event.preventDefault();commit({...filters,search:query.trim()});}} className="flex max-w-3xl">
        <label htmlFor="discovery-search" className="sr-only">{copy.search}</label><Input id="discovery-search" name="search" type="search" maxLength={120} placeholder={copy.search} value={query} onChange={event=>setFilters({...filters,search:event.target.value})} className="h-12 min-w-0 rounded-none border-black bg-white px-4 text-base" /><Button type="submit" aria-label={copy.search} className="h-12 w-12 shrink-0 rounded-none bg-[#092BB4] text-white hover:bg-[#061E81]"><Search className="size-5" aria-hidden="true" /></Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2" aria-label={copy.all}>{['',...categories].map(key=><Button key={key} type="button" variant="outline" aria-pressed={category===key} onClick={()=>commit({...filters,category:key})} className={`min-h-11 rounded-none border-black/30 px-3 text-xs ${category===key?'bg-[#FFE622] text-black':'bg-white'}`}>{key?copy[key as DiscoveryCategory]:copy.all}</Button>)}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 text-xs font-semibold"><SlidersHorizontal className="size-4" aria-hidden="true" />{copy.budget}:</span>{[[undefined,copy.anyBudget],[60,'60 ₾'],[100,copy.under100],[300,copy.under300]].map(([value,label])=><Button key={String(value)} type="button" variant="outline" aria-pressed={filters.maxPrice===value} onClick={()=>commit({...filters,minPrice:undefined,maxPrice:typeof value==='number'?value:undefined})} className={`min-h-11 rounded-none border-black/30 px-3 text-xs ${filters.maxPrice===value?'bg-[#FFE622] text-black':'bg-white'}`}>{label}</Button>)}</div>
      {(filters.minPrice!==undefined||filters.maxPrice!==undefined)&&<p className="mt-2 text-xs leading-5 text-neutral-600">{decision.shipping} {filters.minPrice!==undefined?filters.minPrice:0}–{filters.maxPrice??'∞'} ₾</p>}
      <div className="my-4 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm">{items.length} {copy.count}</p>{active&&<Button type="button" variant="ghost" onClick={()=>commit({})} className="min-h-11 rounded-none text-xs underline">{copy.reset}</Button>}</div>
      {!items.length?<div className="border border-black/30 bg-white p-6"><h2 className="text-lg font-semibold">{copy.empty}</h2><p className="mt-2 max-w-xl text-sm leading-7 text-neutral-600">{copy.emptyHint}</p>{active&&<Button type="button" onClick={()=>commit({})} className="mt-4 h-auto min-h-11 rounded-none bg-[#092BB4] px-4 py-3 whitespace-normal">{copy.reset}</Button>}</div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(product=><OfferCard key={product.id} item={product} now={now} copy={copy} />)}</div>}
    </section>
  </main>;
  return <div className="tn-page min-h-dvh bg-[#F4F2ED] text-[#101010]">{shell&&<StorefrontHeader />}{content}{shell&&<StorefrontFooter />}</div>;
}
