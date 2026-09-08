'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Coffee, CookingPot, Heart, House, Laptop, LampDesk, PlugZap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale, useLocalizedPath } from '@/i18n/context';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontFooter } from './StorefrontFooter';
import { discoveryShellCopy } from '../lib/discovery-shell-copy';
import styles from './BoldDiscoveryHome.module.css';

const homeCopy = {
  ka: {
    eyebrow: 'შერჩეული აღმოჩენები', good: 'კარგი', finds: 'ნივთები.', noise: 'ზედმეტის გარეშე.',
    intro: 'ნივთები საქართველოს მაღაზიებიდან. შეადარე ვარიანტები და შეინახე ის, რაც მოგწონს.',
    catalog: 'აღმოაჩინე კატალოგი', everyday: 'ნივთები ყოველი დღისთვის', explore: 'ნახე შერჩეული ნივთები',
    lampAlt: 'ნარინჯისფერი მაგიდის სანათის ილუსტრაცია',
    steps: ['აღმოაჩინე ნივთი', 'შეადარე და შეინახე', 'შეიძინე მაღაზიის საიტზე'],
    selected: 'იპოვე შენთვის', view: 'ნახე არჩევანი', art: 'კატეგორიის ილუსტრაცია — არა კონკრეტული გასაყიდი ნივთი.',
    picks: [
      { eyebrow: 'მშვიდი დილისთვის', title: 'შენი სამზარეულო', description: 'ყავის აპარატი, ჩაიდანი თუ მიქსერი — დაიწყე საჭიროებით.', alt: 'ყავის მომზადების ილუსტრაცია' },
      { eyebrow: 'კომფორტული სამუშაო დღე', title: 'შენი სამუშაო სივრცე', description: 'მაუსები, მიკროფონები და ტექნიკა სამუშაოსთვის.', alt: 'ყურსასმენების ილუსტრაცია სამუშაო სივრცისთვის' },
      { eyebrow: 'საჭირო ნივთები თან გქონდეს', title: 'ტექნიკა ყოველდღე', description: 'დამტენები და კაბელები — შეამოწმე თავსებადობა არჩევამდე.', alt: 'ჩანთის ილუსტრაცია ყოველდღიური ნივთებისთვის' },
    ],
    categories: ['სახლი', 'სამუშაო სივრცე', 'სამზარეულო', 'ტექნიკა', 'თავის მოვლა', 'შენახული'],
    descriptions: ['სახლისთვის საჭირო', 'მუშაობა კომფორტულად', 'მომზადება მარტივად', 'ყოველდღიური დამხმარე', 'ზრუნვა საკუთარ თავზე', 'შენი არჩევანი ამ მოწყობილობაზე'],
  },
  en: {
    eyebrow: 'Curated discoveries', good: 'GOOD', finds: 'FINDS.', noise: 'ZERO NOISE.',
    intro: 'Finds from stores in Georgia. Compare your options and save what you like.',
    catalog: 'DISCOVER THE CATALOG', everyday: 'Useful things. Every day.', explore: 'Explore the finds',
    lampAlt: 'Illustration of an orange desk lamp',
    steps: ['Find something useful', 'Compare and save', 'Buy on the store’s website'],
    selected: 'Find your next favourite', view: 'Explore the picks', art: 'Category illustration — not a specific item for sale.',
    picks: [
      { eyebrow: 'FOR SLOW MORNINGS', title: 'Your kitchen. Your way.', description: 'Coffee maker, kettle or mixer — start with what you need.', alt: 'Illustration of coffee equipment' },
      { eyebrow: 'A BETTER WORKDAY', title: 'Space to do your thing.', description: 'Mice, microphones and tech for your workspace.', alt: 'Headphone illustration representing a workspace' },
      { eyebrow: 'TAKE THE ESSENTIALS', title: 'Everyday tech.', description: 'Power banks and cables — check compatibility before choosing.', alt: 'Bag illustration representing everyday essentials' },
    ],
    categories: ['Home', 'Workspace', 'Kitchen', 'Tech', 'Personal care', 'Saved'],
    descriptions: ['Useful home finds', 'Work comfortably', 'Make it simple', 'Everyday helpers', 'Time for yourself', 'Your picks on this device'],
  },
  ru: {
    eyebrow: 'Отобранные находки', good: 'ХОРОШИЕ', finds: 'ВЕЩИ.', noise: 'БЕЗ ЛИШНЕГО.',
    intro: 'Находки из магазинов Грузии. Сравни варианты и сохрани то, что нравится.',
    catalog: 'ОТКРОЙ КАТАЛОГ', everyday: 'Нужные вещи на каждый день', explore: 'Посмотреть находки',
    lampAlt: 'Иллюстрация оранжевой настольной лампы',
    steps: ['Найди нужную вещь', 'Сравни и сохрани', 'Купи на сайте магазина'],
    selected: 'Найди своё', view: 'Посмотреть варианты', art: 'Иллюстрация категории, а не конкретного товара в продаже.',
    picks: [
      { eyebrow: 'ДЛЯ СПОКОЙНОГО УТРА', title: 'Твоя кухня. Твои привычки.', description: 'Кофеварка, чайник или миксер — начни с того, что тебе нужно.', alt: 'Иллюстрация принадлежностей для кофе' },
      { eyebrow: 'УДОБНЫЙ РАБОЧИЙ ДЕНЬ', title: 'Место для твоих идей.', description: 'Мыши, микрофоны и техника для рабочего места.', alt: 'Иллюстрация наушников для рабочего пространства' },
      { eyebrow: 'НУЖНОЕ ПОД РУКОЙ', title: 'Техника на каждый день.', description: 'Зарядные устройства и кабели — проверь совместимость перед выбором.', alt: 'Иллюстрация сумки для повседневных вещей' },
    ],
    categories: ['Дом', 'Рабочее место', 'Кухня', 'Техника', 'Уход за собой', 'Сохранённое'],
    descriptions: ['Полезное для дома', 'Работать с комфортом', 'Готовить проще', 'Помощники на каждый день', 'Время для себя', 'Твой выбор на этом устройстве'],
  },
} as const;

const picks = [
  { image: 'coffee', icon: Coffee, category: 'kitchen' },
  { image: 'headphones', icon: Laptop, category: 'workspace' },
  { image: 'bag', icon: PlugZap, category: 'tech' },
] as const;
const categories = [
  { icon: House, category: 'home' }, { icon: Laptop, category: 'workspace' },
  { icon: CookingPot, category: 'kitchen' }, { icon: PlugZap, category: 'tech' },
  { icon: Sparkles, category: 'care' }, { icon: Heart, category: null },
] as const;
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#092bb4]';

export function BoldDiscoveryHome() {
  const locale = useLocale();
  const localPath = useLocalizedPath();
  const copy = homeCopy[locale];
  const words = discoveryShellCopy[locale];
  return (
    <div lang={locale} className={`${styles.fonts} min-h-svh w-full bg-[#faf9f6] text-[#101010] selection:bg-[#ffe622] selection:text-black`}>
      <StorefrontHeader />
      <main id="discovery-main">
        <section aria-labelledby="discovery-title" className="relative isolate grid overflow-hidden bg-[#092bb4] px-5 pb-5 pt-8 text-white md:min-h-[610px] md:grid-cols-[minmax(0,1fr)_230px] md:items-center md:gap-5 md:px-8 md:py-10 xl:min-h-[680px] xl:grid-cols-[minmax(0,1fr)_290px] xl:px-12 2xl:min-h-[740px]">
          <div className="relative z-20 min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/90"><Sparkles size={17} aria-hidden="true" />{copy.eyebrow}</p>
            <h1 id="discovery-title" className={`${styles.display} m-0 text-[clamp(40px,10.8vw,88px)] leading-[1.12] font-black tracking-[-0.055em] md:text-[clamp(52px,6.8vw,125px)]`}><span className="block">{copy.good}</span><span className="block">{copy.finds}</span><span className="mt-2 block text-[.66em] leading-[1.2] text-[#ffe622]">{copy.noise}</span></h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/90 md:text-base">{copy.intro}</p>
          </div>
          <Image className="relative z-10 mx-auto -mb-3 -mt-2 h-[260px] w-full object-contain motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 md:pointer-events-none md:absolute md:bottom-3 md:left-[35%] md:m-0 md:h-[90%] md:w-[40%]" src="/storefront/bold-discovery/hero-lamp.png" alt={copy.lampAlt} width={1024} height={1536} priority sizes="(max-width: 767px) 90vw, 40vw" />
          <div className="relative z-30 min-w-0 bg-[#ffe622] p-5 text-black motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 xl:p-7">
            <p className="flex items-center gap-2 text-[11px] font-bold"><LampDesk size={18} className="shrink-0" aria-hidden="true" />{copy.catalog}</p>
            <h2 className={`${styles.display} my-5 text-2xl leading-snug font-extrabold xl:text-3xl`}>{copy.everyday}</h2>
            <Button asChild variant="outline" className="group h-auto min-h-12 w-full justify-between gap-2 rounded-none border-black bg-transparent px-3 py-3 text-xs font-bold whitespace-normal text-black hover:bg-black hover:text-[#ffe622]"><Link href={localPath('/products')}>{copy.explore}<ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></Link></Button>
          </div>
        </section>
        <ol aria-label={words.how} className="grid gap-3 border-b border-black/30 bg-white px-5 py-4 text-xs sm:grid-cols-3 md:px-8 xl:px-12">{copy.steps.map((step, index) => <li key={step} className="flex min-w-0 items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center bg-[#ffe622] font-bold">{index + 1}</span>{step}</li>)}</ol>
        <section aria-label={copy.selected} className="grid lg:grid-cols-3">{picks.map(({ image, icon: Icon, category }, index) => {
          const pick = copy.picks[index];
          return <article key={image} className="group grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-black/35 p-4 md:p-6 lg:border-r lg:p-4 xl:gap-5 xl:p-5 lg:last:border-r-0">
            <figure className="min-w-0"><div className="overflow-hidden"><Image src={`/storefront/bold-discovery/${image}-blue-v1.png`} alt={pick.alt} width={1024} height={1024} className="aspect-square h-auto w-full object-contain transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" sizes="(max-width: 1023px) 45vw, 17vw" /></div><figcaption className="mt-2 text-[10px] leading-4 text-neutral-600">{copy.art}</figcaption></figure>
            <div className="flex min-w-0 flex-col items-start py-2"><p className="flex flex-wrap items-center gap-2 text-[10px] leading-5 font-bold text-[#092bb4]"><Icon size={16} aria-hidden="true" />{pick.eyebrow}</p><h2 className={`${styles.display} my-3 text-lg leading-snug font-extrabold sm:text-2xl lg:text-xl 2xl:text-2xl`}>{pick.title}</h2><p className="mb-3 hidden text-sm leading-6 text-neutral-700 sm:block">{pick.description}</p><Link href={localPath(`/products?category=${category}`)} className={`mt-auto inline-flex min-h-11 items-center gap-2 border-b border-black text-xs font-semibold hover:text-[#092bb4] ${focus}`}>{copy.view}<ArrowRight size={17} className="shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></Link></div>
          </article>;
        })}</section>
        <nav aria-label={words.catalog} className="grid grid-cols-2 bg-[#101010] text-white sm:grid-cols-3 xl:grid-cols-6">{categories.map(({ icon: Icon, category }, index) => <Link href={localPath(category ? `/products?category=${category}` : '/saved')} key={copy.categories[index]} className={`group min-w-0 border-r border-b border-white/25 p-5 transition-colors hover:bg-[#ffe622] hover:text-black md:p-7 ${focus}`}><div className="mb-4 flex items-center justify-between"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><ArrowUpRight size={19} className="opacity-50 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100 motion-reduce:transform-none" aria-hidden="true" /></div><h2 className={`${styles.display} text-lg font-extrabold`}>{copy.categories[index]}</h2><p className="mt-2 text-xs leading-5 opacity-75">{copy.descriptions[index]}</p></Link>)}</nav>
      </main>
      <StorefrontFooter />
    </div>
  );
}
