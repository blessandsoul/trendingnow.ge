'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Coffee, CookingPot, Gift, Headphones, Heart, House, LampDesk, Menu, Mountain, Search, Shirt, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLocalizedPath } from '@/i18n/context';
import styles from './BoldDiscoveryHome.module.css';

const picks = [
  { image: 'coffee', icon: Coffee, eyebrow: 'მშვიდი დილისთვის', title: 'ყავა, როგორც გიყვარს', description: 'ყველაფერი გემრიელი ყავისთვის — შენს სამზარეულოში.', search: 'coffee', alt: 'შავი ყავის ჩაიდანი და მინის ჭურჭელი ხის მაგიდაზე' },
  { image: 'headphones', icon: Headphones, eyebrow: 'მოუსმინე შენებურად', title: 'შენი მუსიკა. შენი სივრცე.', description: 'ყურსასმენები მუსიკისთვის, მუშაობისა და დასვენებისთვის.', search: 'headphones', alt: 'მწვანე ყურსასმენები ღია ფერის ქსოვილზე' },
  { image: 'bag', icon: ShoppingBag, eyebrow: 'ყოველდღე შენთან', title: 'ჩანთა ყველა გეგმისთვის', description: 'სამსახურში, ქალაქში თუ გზაში — საჭირო ნივთები თან გქონდეს.', search: 'bag', alt: 'ქსოვილის ჩანთა შავი სახელურებით' },
] as const;
const categories = [
  { title: 'სახლი', description: 'პატარა ცვლილებები', icon: House, search: 'home' },
  { title: 'ტექნიკა', description: 'სასარგებლო სიახლეები', icon: Headphones, search: 'tech' },
  { title: 'სამზარეულო', description: 'გემრიელი ყოველდღიურობა', icon: CookingPot, search: 'kitchen' },
  { title: 'სტილი', description: 'შენს გემოვნებაზე', icon: Shirt, search: 'bag' },
  { title: 'გარეთ', description: 'ახალი თავგადასავლებისთვის', icon: Mountain, search: 'outdoor' },
  { title: 'რჩევები', description: 'აირჩიე უფრო მარტივად', icon: BookOpen, search: null },
] as const;
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ed6b3c]';

export function BoldDiscoveryHome() {
  const localPath = useLocalizedPath();
  const [menuOpen, setMenuOpen] = useState(false);
  const catalog = (search: string) => localPath(`/products?search=${encodeURIComponent(search)}`);
  const navigation = [
    { title: 'აღმოაჩინე', icon: Sparkles, href: localPath('/'), current: true },
    { title: 'საჩუქრები', icon: Gift, href: catalog('gift') },
    { title: 'სახლი', icon: House, href: catalog('home') },
    { title: 'ტექნიკა', icon: Headphones, href: catalog('tech') },
    { title: 'რჩევები', icon: BookOpen, href: localPath('/blog') },
    { title: 'შენახული', icon: Heart, href: localPath('/dashboard/favorites') },
  ];
  return <div lang="ka" className={`${styles.fonts} min-h-svh w-full bg-[#faf9f6] text-[#101010] selection:bg-[#ffe622] selection:text-black`}>
    <a href="#discovery-main" className="fixed -top-24 left-4 z-[100] bg-white p-3 focus:top-4">შინაარსზე გადასვლა</a>
    <header className="flex min-h-20 w-full items-center gap-4 border-b border-black/20 px-5 py-3 md:px-8 xl:px-12">
      <Link href={localPath('/')} className={`${styles.wordmark} shrink-0 text-[29px] leading-none tracking-[-1px] sm:text-[35px] ${focus}`} aria-label="TrendingNow.ge — მთავარი">TrendingNow.ge</Link>
      <nav aria-label="მთავარი ნავიგაცია" className="ml-auto hidden items-center gap-5 xl:flex 2xl:gap-8">{navigation.map(({ icon: Icon, ...item }) => <Link key={item.title} href={item.href} aria-current={item.current ? 'page' : undefined} className={`flex min-h-11 items-center gap-2 border-b-2 py-2 text-sm font-semibold ${item.current ? 'border-[#092bb4]' : 'border-transparent hover:border-[#092bb4]'} ${focus}`}><Icon size={17} strokeWidth={1.7} aria-hidden="true" />{item.title}</Link>)}</nav>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild><Button variant="ghost" size="icon" className="ml-auto size-12 rounded-none hover:bg-[#ffe622] xl:ml-4" aria-label="მენიუს გახსნა"><Menu className="size-7" strokeWidth={1.5} aria-hidden="true" /></Button></SheetTrigger>
        <SheetContent closeLabel="დახურვა" className={`${styles.fonts} overflow-y-auto border-black bg-[#faf9f6] p-6 text-black motion-reduce:animate-none motion-reduce:transition-none`} lang="ka">
          <SheetHeader className="pt-8"><SheetTitle className="text-2xl font-extrabold text-black">აღმოაჩინე შენი შემდეგი რჩეული</SheetTitle><SheetDescription className="text-neutral-600">ნივთები და იდეები ყოველდღიურობისთვის.</SheetDescription></SheetHeader>
          <form action={localPath('/products')} role="search" className="my-5"><label htmlFor="discovery-search" className="mb-2 block text-sm font-semibold">რას ეძებ?</label><div className="flex min-w-0"><Input id="discovery-search" name="search" type="search" placeholder="მოძებნე ნივთი…" required maxLength={120} className="h-12 min-w-0 rounded-none border-black bg-white text-black" /><Button type="submit" aria-label="ძებნა" className="h-12 w-12 shrink-0 rounded-none bg-[#092bb4] text-white hover:bg-[#061e81]"><Search aria-hidden="true" /></Button></div></form>
          <nav aria-label="საიტის მენიუ" className="grid">{navigation.map(({ icon: Icon, ...item }) => <SheetClose asChild key={item.title}><Link href={item.href} className={`group flex min-h-14 items-center gap-3 border-b border-black/15 py-3 font-semibold ${focus}`}><Icon size={20} aria-hidden="true" />{item.title}<ArrowUpRight className="ml-auto size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></Link></SheetClose>)}</nav>
        </SheetContent>
      </Sheet>
    </header>
    <main id="discovery-main">
      <section aria-labelledby="discovery-title" className="relative isolate grid overflow-hidden bg-[#092bb4] px-5 pb-5 pt-8 text-white md:min-h-[610px] md:grid-cols-[minmax(0,1fr)_230px] md:items-center md:gap-5 md:px-8 md:py-10 xl:min-h-[680px] xl:grid-cols-[minmax(0,1fr)_290px] xl:px-12 2xl:min-h-[740px]">
        <div className="relative z-20 min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/90"><Sparkles size={17} aria-hidden="true" />აღმოჩენები ყოველდღე</p>
          <h1 id="discovery-title" className={`${styles.display} m-0 text-[clamp(48px,12.5vw,88px)] leading-[1.08] font-black tracking-[-0.055em] md:text-[clamp(62px,7.5vw,132px)]`}><span className="block">კარგი</span><span className="block">ნივთები.</span><span className="mt-2 block text-[.66em] leading-[1.2] text-[#ffe622]">ზედმეტის გარეშე.</span></h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/90 md:text-base">საინტერესო ნივთები. სასარგებლო რჩევები.<br />ნაკლები ძებნა, მეტი კარგი აღმოჩენა.</p>
        </div>
        <Image className="relative z-10 mx-auto -mb-3 -mt-2 h-[260px] w-full object-contain motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 md:pointer-events-none md:absolute md:bottom-3 md:left-[35%] md:m-0 md:h-[90%] md:w-[40%]" src="/storefront/bold-discovery/hero-lamp.png" alt="ნარინჯისფერი მაგიდის სანათი" width={1024} height={1536} priority sizes="(max-width: 767px) 90vw, 40vw" />
        <div className="relative z-30 bg-[#ffe622] p-5 text-black motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 xl:p-7"><p className="flex items-center gap-2 text-[11px] font-bold"><LampDesk size={18} aria-hidden="true" />კვირის არჩევანი</p><h2 className={`${styles.display} my-5 text-2xl leading-snug font-extrabold xl:text-3xl`}>მეტი სინათლე<br />შენს სახლში</h2><Button asChild variant="outline" className="group h-auto min-h-12 w-full justify-between gap-2 rounded-none border-black bg-transparent px-3 py-3 text-xs font-bold whitespace-normal text-black hover:bg-black hover:text-[#ffe622]"><Link href={catalog('lamp')}>ნახე შერჩეული ნივთები<ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></Link></Button></div>
      </section>
      <section aria-label="შერჩეული აღმოჩენები" className="grid lg:grid-cols-3">{picks.map(({ icon: Icon, ...pick }) => <article key={pick.image} className="group grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-black/35 p-4 md:p-6 lg:border-r lg:p-4 xl:gap-5 xl:p-5 lg:last:border-r-0"><Link href={catalog(pick.search)} tabIndex={-1} aria-label={pick.title} className="min-w-0 overflow-hidden"><Image src={`/storefront/bold-discovery/${pick.image}-blue-v1.png`} alt={pick.alt} width={1024} height={1024} className="aspect-square h-auto w-full object-contain transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" sizes="(max-width: 1023px) 45vw, 17vw" /></Link><div className="flex min-w-0 flex-col items-start py-2"><p className="flex flex-wrap items-center gap-2 text-[10px] leading-5 font-bold text-[#092bb4]"><Icon size={16} aria-hidden="true" />{pick.eyebrow}</p><h2 className={`${styles.display} my-3 text-lg leading-snug font-extrabold sm:text-2xl lg:text-xl 2xl:text-2xl`}><Link href={catalog(pick.search)} className={focus}>{pick.title}</Link></h2><p className="mb-3 hidden text-sm leading-6 text-neutral-700 sm:block">{pick.description}</p><Link href={catalog(pick.search)} className={`mt-auto inline-flex min-h-11 items-center gap-2 border-b border-black text-xs font-semibold hover:text-[#092bb4] ${focus}`}>ნახე არჩევანი<ArrowRight size={17} className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></Link></div></article>)}</section>
      <nav aria-label="აირჩიე კატეგორია" className="grid grid-cols-2 bg-[#101010] text-white sm:grid-cols-3 xl:grid-cols-6">{categories.map(({ icon: Icon, title, description, search }) => <Link href={search ? catalog(search) : localPath('/blog')} key={title} className={`group min-w-0 border-r border-b border-white/25 p-5 transition-colors hover:bg-[#ffe622] hover:text-black md:p-7 ${focus}`}><div className="mb-4 flex items-center justify-between"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><ArrowUpRight size={19} className="opacity-50 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100 motion-reduce:transform-none" aria-hidden="true" /></div><h2 className={`${styles.display} text-lg font-extrabold`}>{title}</h2><p className="mt-2 text-xs leading-5 opacity-75">{description}</p></Link>)}</nav>
    </main>
    <footer className="flex flex-col gap-5 px-5 py-6 text-xs leading-6 text-neutral-600 md:flex-row md:items-center md:justify-between md:px-8 xl:px-12"><p className="max-w-xl">ზოგი ბმულით შეძენისას შესაძლოა საკომისიო მივიღოთ.</p><nav aria-label="ჩვენ შესახებ" className="flex flex-wrap gap-x-6 gap-y-2"><Link className={`min-h-11 content-center hover:text-black ${focus}`} href={localPath('/about-us')}>ჩვენ შესახებ</Link><Link className={`min-h-11 content-center hover:text-black ${focus}`} href={localPath('/blog')}>რჩევები</Link><Link className={`min-h-11 content-center hover:text-black ${focus}`} href={localPath('/contact')}>კონტაქტი</Link></nav></footer>
  </div>;
}
