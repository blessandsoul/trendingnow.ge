'use client';

/* eslint-disable react-hooks/set-state-in-effect -- Admin edit forms hydrate async server data into local drafts. */

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Boxes,
  Camera,
  ClipboardList,
  Eye,
  EyeOff,
  GripVertical,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PackagePlus,
  Plus,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SafeImage } from '@/components/common/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { copy } from '@/i18n/copy';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAdminSessions, useForceExpireSession } from '../hooks/useAdminSessions';
import { useAdminStats } from '../hooks/useAdminStats';
import { useAdminOrders, useUpdateAdminOrderStatus } from '../hooks/useAdminOrders';
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
} from '../hooks/useAdminUsers';
import {
  useAdminHomepageConfig,
  useAdminStorefrontCategories,
  useAdminStorefrontProducts,
  useAdminStorefrontSummary,
  useCreateHomeHeroSlide,
  useCreateHomeProductRow,
  useCreateHomePromoBanner,
  useCreateHomeServiceItem,
  useCreateStorefrontCategory,
  useCreateStorefrontProduct,
  useDeactivateStorefrontProduct,
  useDeleteHomeHeroSlide,
  useDeleteHomeProductRow,
  useDeleteHomePromoBanner,
  useDeleteHomeServiceItem,
  useDeleteStorefrontCategory,
  useUpdateHomeHero,
  useUpdateHomeHeroSlide,
  useUpdateHomeHeroSlideOrder,
  useUpdateHomeNewsletter,
  useUpdateHomeProductRow,
  useUpdateHomeProductRowItems,
  useUpdateHomeProductRowOrder,
  useUpdateHomePromoBanner,
  useUpdateHomePromoBannerOrder,
  useUpdateHomeServiceItem,
  useUpdateHomeServiceItemOrder,
  useUpdateStorefrontCategory,
  useUpdateStorefrontCategoryOrder,
  useUpdateStorefrontProduct,
  useUploadStorefrontAsset,
} from '../hooks/useAdminStorefront';
import type {
  AdminHomeProductRowPlacement,
  AdminHomeProductRowSource,
  AdminHomePromoTone,
  AdminOrderStatus,
  AdminStorefrontAssetKind,
  IAdminOrder,
  IAdminHomeHeroSlide,
  IAdminHomeProductRow,
  IAdminHomePromoBanner,
  IAdminHomeServiceItem,
  IAdminProductAttributes,
  IAdminProductQuestion,
  IAdminProductSpecGroup,
  IAdminStorefrontCategory,
  IAdminStorefrontProduct,
  ICreateStorefrontProductRequest,
} from '../types/admin.types';
import { formatGel } from '@/features/storefront/lib/format';
import { ProductPreviewDialog } from './ProductPreviewDialog';

type AdminPage = 'overview' | 'homepage' | 'categories' | 'products' | 'orders' | 'users' | 'sessions';

const adminCopy = copy.admin.editor;

// TipTap touches the DOM at import time — load it client-only, on demand.
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});

const navItems: Array<{ page: AdminPage; label: string; href: string; icon: typeof LayoutDashboard }> = [
  { page: 'overview', label: adminCopy.nav.overview, href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { page: 'homepage', label: adminCopy.nav.homepage, href: ROUTES.ADMIN.HOMEPAGE, icon: Home },
  { page: 'categories', label: adminCopy.nav.categories, href: ROUTES.ADMIN.CATEGORIES, icon: Tags },
  { page: 'products', label: adminCopy.nav.products, href: ROUTES.ADMIN.PRODUCTS, icon: Boxes },
  { page: 'orders', label: adminCopy.nav.orders, href: ROUTES.ADMIN.ORDERS, icon: ClipboardList },
  { page: 'users', label: adminCopy.nav.users, href: ROUTES.ADMIN.USERS, icon: Users },
  { page: 'sessions', label: adminCopy.nav.sessions, href: ROUTES.ADMIN.SESSIONS, icon: Activity },
];

const emptyHeroDraft = {
  eyebrow: '',
  title: '',
  text: '',
  ctaLabel: '',
  ctaHref: '',
  isActive: true,
};

const emptyNewsletterDraft = {
  title: '',
  text: '',
  placeholder: '',
  buttonLabel: '',
  isActive: true,
};

const emptyProductDraft: ICreateStorefrontProductRequest = {
  slug: '',
  name: '',
  description: '',
  brand: '',
  imageUrl: '/storefront/hero-products.png',
  salePrice: 0,
  originalPrice: null,
  currency: 'GEL',
  isFeatured: false,
  isNew: true,
  isBestseller: false,
  isActive: true,
  categoryId: '',
};

function pageFromPath(pathname: string): AdminPage {
  if (pathname.endsWith('/homepage')) return 'homepage';
  if (pathname.endsWith('/categories')) return 'categories';
  if (pathname.endsWith('/products')) return 'products';
  if (pathname.endsWith('/orders')) return 'orders';
  if (pathname.endsWith('/users')) return 'users';
  if (pathname.endsWith('/sessions')) return 'sessions';
  return 'overview';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ka-GE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const orderStatuses: AdminOrderStatus[] = ['PENDING', 'ACCEPTED', 'SENT_FOR_DELIVERY', 'DELIVERED'];

function topLevelCategories(categories: IAdminStorefrontCategory[], excludeId?: string): IAdminStorefrontCategory[] {
  return categories.filter((item) => item.parentId === null && item.id !== excludeId);
}

function orderPayload<T extends { id: string }>(items: T[]) {
  return {
    items: items.map((item, index) => ({
      id: item.id,
      sortOrder: index + 1,
    })),
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#7A8595]">{label}</span>
      {children}
    </label>
  );
}

function NativeSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-9 rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
    >
      {children}
    </select>
  );
}

function TogglePill({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-bold transition disabled:opacity-60',
        active
          ? 'border-[#BFA4FF] bg-[#FFF0F3] text-[#07152A]'
          : 'border-[#DCE4EF] bg-white text-[#657286] hover:border-[#8C5CF6]',
      )}
    >
      {active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  hint: string;
  icon: typeof LayoutDashboard;
}): React.ReactElement {
  return (
    <article className="rounded-[6px] border border-[#DDE5EF] bg-white p-4 shadow-[0_12px_30px_rgba(8,21,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7A8595]">{title}</p>
          <p className="mt-2 text-3xl font-black tabular-nums text-[#07152A]">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-[6px] bg-[#F2EAFF] text-[#07152A]">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#657286]">{hint}</p>
    </article>
  );
}

function Panel({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <section className={cn('rounded-[6px] border border-[#DDE5EF] bg-white shadow-[0_12px_30px_rgba(8,21,42,0.04)]', className)}>
      <div className="flex flex-col gap-3 border-b border-[#E8EDF4] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-black text-[#07152A]">{title}</h2>
          {description && <p className="mt-1 text-sm leading-5 text-[#657286]">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-20 opacity-80')}
    >
      <div className="absolute left-3 top-3 z-10">
        <button
          type="button"
          className="grid size-8 cursor-grab place-items-center rounded-[6px] border border-[#DDE5EF] bg-white text-[#7A8595] shadow-sm active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={adminCopy.dragToReorder}
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function SortableList<T extends { id: string }>({
  items,
  children,
  onReorder,
}: {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
  onReorder: (items: T[]) => void;
}): React.ReactElement {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {children(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function AssetUploadButton({
  kind,
  label,
  onUploaded,
  compact = false,
}: {
  kind: AdminStorefrontAssetKind;
  label?: string;
  onUploaded: (url: string) => void;
  compact?: boolean;
}): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAsset = useUploadStorefrontAsset();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          uploadAsset.mutate({ file, kind, label }, {
            onSuccess: ({ url }) => onUploaded(url),
          });
          event.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size={compact ? 'sm' : 'default'}
        className="rounded-[6px] border-[#DDE5EF] bg-white"
        disabled={uploadAsset.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadAsset.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {adminCopy.upload}
      </Button>
    </>
  );
}

function AdminSidebar({ page, mobile = false }: { page: AdminPage; mobile?: boolean }): React.ReactElement {
  return (
    <div className={cn('tn-dark-panel flex h-full flex-col rounded-none text-white', mobile ? 'p-4' : 'p-4')}>
      <Link href={ROUTES.HOME} className="mb-7 inline-flex items-center gap-3" aria-label={adminCopy.homeAria}>
        <span className="grid size-10 place-items-center rounded-[12px] bg-[#FF4057] text-white">
          <ShoppingBag className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-black leading-4">TrendingNow.ge</span>
          <span className="text-xs text-white/55">{adminCopy.storeAdmin}</span>
        </span>
      </Link>

      <nav className="grid gap-1">
        {navItems.map(({ page: itemPage, label, href, icon: Icon }) => (
          <Link
            key={itemPage}
            href={href}
            className={cn(
              'flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-bold text-white/68 transition hover:bg-white/8 hover:text-white',
              page === itemPage && 'bg-white text-[#07152A] shadow-[0_10px_22px_rgba(0,0,0,0.16)] hover:bg-white hover:text-[#07152A]',
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-[14px] border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/62">
        {adminCopy.sidebarNote}
      </div>
    </div>
  );
}

function DashboardShell({ page, children }: { page: AdminPage; children: React.ReactNode }): React.ReactElement {
  const { user, logout, isLoggingOut } = useAuth();
  const pageLabel = navItems.find((item) => item.page === page)?.label ?? adminCopy.nav.overview;

  return (
    <div className="tn-page min-h-dvh text-[#11141B]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[254px] lg:block">
        <AdminSidebar page={page} />
      </aside>

      <div className="lg:pl-[254px]">
        <header className="sticky top-0 z-30 border-b border-[#E8E0F8] bg-white/92 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" size="icon" className="rounded-[6px] lg:hidden" aria-label={adminCopy.openAdminMenu}>
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[294px] border-0 bg-[#07152A] p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>{adminCopy.adminMenu}</SheetTitle>
                    <SheetDescription>{adminCopy.adminNavigation}</SheetDescription>
                  </SheetHeader>
                  <AdminSidebar page={page} mobile />
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8C5CF6]">{adminCopy.adminTitle}</p>
                <h1 className="truncate text-xl font-black text-[#11141B] sm:text-2xl">{pageLabel}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button asChild variant="outline" className="hidden rounded-[6px] border-[#DDE5EF] bg-white sm:inline-flex">
                <Link href={ROUTES.HOME}>
                  <Home className="size-4" />
                  {adminCopy.storeAdmin}
                </Link>
              </Button>
              <div className="hidden text-right md:block">
                <p className="text-sm font-black">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#657286]">{user?.email}</p>
              </div>
              <Badge className="border-[#D9ECFF] bg-[#F0F7FF] text-[#174A98]">{copy.admin.adminBadge}</Badge>
              <Button
                type="button"
                variant="outline"
                className="rounded-[6px] border-[#DDE5EF] bg-white"
                disabled={isLoggingOut}
                onClick={() => void logout()}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{adminCopy.logout}</span>
              </Button>
            </div>
          </div>
        </header>

        <main
          className="min-h-[calc(100dvh-65px)] px-4 py-5 lg:px-6"
          style={{
            backgroundImage: 'radial-gradient(#DDD2F3 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function AccessState(): React.ReactElement {
  const { user, isInitializing, logout } = useAuth();
  const pathname = usePathname();
  const page = pageFromPath(pathname);

  if (isInitializing) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F5F7FA]">
        <div className="flex items-center gap-3 rounded-[6px] border border-[#DDE5EF] bg-white px-5 py-4 text-sm font-bold text-[#657286]">
          <Loader2 className="size-4 animate-spin" />
          {copy.admin.checkingAccess}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F5F7FA] px-5">
        <div className="w-full max-w-[460px] rounded-[6px] border border-[#DDE5EF] bg-white p-6 text-center shadow-[0_18px_60px_rgba(8,21,42,0.08)]">
          <ShieldCheck className="mx-auto size-10 text-[#7A8595]" />
          <h1 className="mt-4 text-2xl font-black">{copy.admin.accessRequiredTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-[#657286]">
            {copy.admin.accessRequiredText}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]">
              <Link href={ROUTES.LOGIN}>{copy.admin.signInAsAdmin}</Link>
            </Button>
            {user && (
              <Button type="button" variant="outline" className="rounded-[6px]" onClick={() => void logout()}>
                {adminCopy.logout}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell page={page}>
      <DashboardContent page={page} />
    </DashboardShell>
  );
}

function OverviewPage({
  stats,
  summary,
  homepageCounts,
}: {
  stats: ReturnType<typeof useAdminStats>['stats'];
  summary: ReturnType<typeof useAdminStorefrontSummary>['data'];
  homepageCounts: {
    rows: number;
    banners: number;
    services: number;
  };
}): React.ReactElement {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4">
        <MetricCard title={adminCopy.nav.users} value={stats?.totalUsers ?? 0} hint={adminCopy.registeredAccounts} icon={Users} />
        <MetricCard title={adminCopy.nav.sessions} value={stats?.activeSessions ?? 0} hint={adminCopy.activeAuthenticatedSessions} icon={Activity} />
        <MetricCard title={adminCopy.nav.products} value={summary?.activeProductCount ?? 0} hint={adminCopy.visibleStorefrontProducts} icon={ShoppingBag} />
      </section>

      <section className="grid gap-4">
        <Panel title={adminCopy.homepageCms} description={adminCopy.homepageCmsHint}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-4">
              <p className="text-2xl font-black">{homepageCounts.rows}</p>
              <p className="text-sm font-bold text-[#657286]">{adminCopy.productRowsCount}</p>
            </div>
            <div className="rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-4">
              <p className="text-2xl font-black">{homepageCounts.banners}</p>
              <p className="text-sm font-bold text-[#657286]">{adminCopy.promoBannersCount}</p>
            </div>
            <div className="rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-4">
              <p className="text-2xl font-black">{homepageCounts.services}</p>
              <p className="text-sm font-bold text-[#657286]">{adminCopy.serviceItemsCount}</p>
            </div>
          </div>
          <Button asChild className="mt-4 rounded-[6px] bg-[#07152A] text-white hover:bg-[#142238]">
            <Link href={ROUTES.ADMIN.HOMEPAGE}>{adminCopy.openHomepageEditor}</Link>
          </Button>
        </Panel>

        <Panel title={adminCopy.storefrontHealth} description={adminCopy.storefrontHealthHint}>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-[6px] bg-[#F7F9FB] px-3 py-2">
              <span>{adminCopy.sourceLabels.FEATURED}</span>
              <strong>{summary?.featuredProductCount ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-[6px] bg-[#F7F9FB] px-3 py-2">
              <span>{adminCopy.sourceLabels.BESTSELLER}</span>
              <strong>{summary?.bestsellerProductCount ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-[6px] bg-[#F7F9FB] px-3 py-2">
              <span>{adminCopy.newProducts}</span>
              <strong>{summary?.newProductCount ?? 0}</strong>
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function HeroEditor(): React.ReactElement {
  const homepage = useAdminHomepageConfig();
  const updateHero = useUpdateHomeHero();
  const createSlide = useCreateHomeHeroSlide();
  const updateSlide = useUpdateHomeHeroSlide();
  const deleteSlide = useDeleteHomeHeroSlide();
  const orderSlides = useUpdateHomeHeroSlideOrder();
  const [heroDraft, setHeroDraft] = useState(emptyHeroDraft);
  const [slideDraft, setSlideDraft] = useState({ imageUrl: '', altText: '', sortOrder: '0', isActive: true });

  useEffect(() => {
    if (!homepage.data?.hero) return;
    setHeroDraft({
      eyebrow: homepage.data.hero.eyebrow ?? '',
      title: homepage.data.hero.title,
      text: homepage.data.hero.text ?? '',
      ctaLabel: homepage.data.hero.ctaLabel ?? '',
      ctaHref: homepage.data.hero.ctaHref ?? '',
      isActive: homepage.data.hero.isActive,
    });
  }, [homepage.data?.hero]);

  const slides = homepage.data?.hero?.slides ?? [];

  return (
    <Panel title={adminCopy.hero} description={adminCopy.heroHint}>
      <div className="grid gap-4">
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            updateHero.mutate({
              eyebrow: nullable(heroDraft.eyebrow),
              title: heroDraft.title || 'TrendingNow.ge',
              text: nullable(heroDraft.text),
              ctaLabel: nullable(heroDraft.ctaLabel),
              ctaHref: nullable(heroDraft.ctaHref),
              isActive: heroDraft.isActive,
            });
          }}
        >
          <Field label={adminCopy.eyebrow}>
            <Input value={heroDraft.eyebrow} onChange={(event) => setHeroDraft((prev) => ({ ...prev, eyebrow: event.target.value }))} />
          </Field>
          <Field label={adminCopy.title}>
            <Input value={heroDraft.title} onChange={(event) => setHeroDraft((prev) => ({ ...prev, title: event.target.value }))} />
          </Field>
          <Field label={adminCopy.text}>
            <Input value={heroDraft.text} onChange={(event) => setHeroDraft((prev) => ({ ...prev, text: event.target.value }))} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={adminCopy.ctaLabel}>
              <Input value={heroDraft.ctaLabel} onChange={(event) => setHeroDraft((prev) => ({ ...prev, ctaLabel: event.target.value }))} />
            </Field>
            <Field label={adminCopy.ctaHref}>
              <Input value={heroDraft.ctaHref} onChange={(event) => setHeroDraft((prev) => ({ ...prev, ctaHref: event.target.value }))} />
            </Field>
          </div>
          <div className="flex items-center justify-between gap-3">
            <TogglePill active={heroDraft.isActive} label={heroDraft.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => setHeroDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} />
            <Button type="submit" className="rounded-[6px] bg-[#07152A] text-white hover:bg-[#142238]" disabled={updateHero.isPending}>
              {updateHero.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {adminCopy.saveHero}
            </Button>
          </div>
        </form>

        <div className="grid gap-3">
          <form
            className="grid gap-2 rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!slideDraft.imageUrl) return;
              createSlide.mutate({
                imageUrl: slideDraft.imageUrl,
                altText: nullable(slideDraft.altText),
                sortOrder: Number(slideDraft.sortOrder || 0),
                isActive: slideDraft.isActive,
              }, {
                onSuccess: () => setSlideDraft({ imageUrl: '', altText: '', sortOrder: '0', isActive: true }),
              });
            }}
          >
            <div className="flex items-end gap-2">
              <Field label={adminCopy.newSlideImage}>
                <Input value={slideDraft.imageUrl} onChange={(event) => setSlideDraft((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder="/uploads/storefront/hero/x.webp" />
              </Field>
              <AssetUploadButton kind="hero" label={adminCopy.heroSlide} compact onUploaded={(url) => setSlideDraft((prev) => ({ ...prev, imageUrl: url }))} />
              <Button type="submit" className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]" disabled={createSlide.isPending}>
                <Plus className="size-4" />
                {adminCopy.add}
              </Button>
            </div>
            <Input value={slideDraft.altText} onChange={(event) => setSlideDraft((prev) => ({ ...prev, altText: event.target.value }))} placeholder={adminCopy.altText} />
          </form>

          <SortableList
            items={slides}
            onReorder={(items) => orderSlides.mutate(orderPayload(items))}
          >
            {(slide: IAdminHomeHeroSlide, index) => (
              <article className="rounded-[6px] border border-[#E4EAF2] bg-white p-3 pl-14">
                <div className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-[6px] bg-[#F7F9FB]">
                    <SafeImage src={publicMediaUrl(slide.imageUrl)} alt={slide.altText ?? ''} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="grid min-w-0 flex-1 gap-2">
                    <Input value={slide.imageUrl} onChange={(event) => updateSlide.mutate({ slideId: slide.id, data: { imageUrl: event.target.value } })} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <TogglePill active={slide.isActive} label={slide.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => updateSlide.mutate({ slideId: slide.id, data: { isActive: !slide.isActive } })} />
                      <Button type="button" size="sm" variant="outline" className="rounded-[6px] text-[#B42318]" onClick={() => deleteSlide.mutate(slide.id)}>
                        <Trash2 className="size-4" />
                        {adminCopy.delete}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </SortableList>
        </div>
      </div>
    </Panel>
  );
}

function ProductRowsEditor({
  categories,
  products,
}: {
  categories: IAdminStorefrontCategory[];
  products: IAdminStorefrontProduct[];
}): React.ReactElement {
  const homepage = useAdminHomepageConfig();
  const createRow = useCreateHomeProductRow();
  const updateRow = useUpdateHomeProductRow();
  const deleteRow = useDeleteHomeProductRow();
  const orderRows = useUpdateHomeProductRowOrder();
  const [draft, setDraft] = useState({
    title: '',
    source: 'BESTSELLER' as AdminHomeProductRowSource,
    placement: 'ABOVE_BANNERS' as AdminHomeProductRowPlacement,
    productLimit: '6',
    categoryId: '',
  });

  const rows = homepage.data?.productRows ?? [];

  return (
    <Panel title={adminCopy.productRows} description={adminCopy.productRowsHint}>
      <form
        className="mb-4 grid gap-3 rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.title) return;
          createRow.mutate({
            title: draft.title,
            source: draft.source,
            placement: draft.placement,
            productLimit: Number(draft.productLimit || 6),
            categoryId: draft.source === 'CATEGORY' ? draft.categoryId : null,
            sortOrder: rows.length + 1,
            isActive: true,
          }, {
            onSuccess: () => setDraft((prev) => ({ ...prev, title: '' })),
          });
        }}
      >
        <Input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder={adminCopy.rowTitle} />
        <NativeSelect value={draft.source} onChange={(value) => setDraft((prev) => ({ ...prev, source: value as AdminHomeProductRowSource }))}>
          <option value="BESTSELLER">{adminCopy.sourceLabels.BESTSELLER}</option>
          <option value="FEATURED">{adminCopy.sourceLabels.FEATURED}</option>
          <option value="NEW">{adminCopy.sourceLabels.NEW}</option>
          <option value="CATEGORY">{adminCopy.sourceLabels.CATEGORY}</option>
          <option value="MANUAL">{adminCopy.sourceLabels.MANUAL}</option>
        </NativeSelect>
        <NativeSelect value={draft.placement} onChange={(value) => setDraft((prev) => ({ ...prev, placement: value as AdminHomeProductRowPlacement }))}>
          <option value="ABOVE_BANNERS">{adminCopy.placementLabels.ABOVE_BANNERS}</option>
          <option value="BELOW_BANNERS">{adminCopy.placementLabels.BELOW_BANNERS}</option>
        </NativeSelect>
        <Input value={draft.productLimit} onChange={(event) => setDraft((prev) => ({ ...prev, productLimit: event.target.value }))} inputMode="numeric" placeholder={adminCopy.limit} />
        {draft.source === 'CATEGORY' && (
          <NativeSelect value={draft.categoryId} onChange={(value) => setDraft((prev) => ({ ...prev, categoryId: value }))} className="lg:col-span-4">
            <option value="">{adminCopy.chooseCategory}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </NativeSelect>
        )}
        <Button type="submit" className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]" disabled={createRow.isPending}>
          <Plus className="size-4" />
          {adminCopy.addRow}
        </Button>
      </form>

      <SortableList
        items={rows}
        onReorder={(items) => orderRows.mutate(orderPayload(items))}
      >
        {(row, index) => (
          <ProductRowCard
            row={row}
            index={index}
            total={rows.length}
            categories={categories}
            products={products}
            onMove={(direction) => {
              const target = direction === 'up' ? index - 1 : index + 1;
              if (target < 0 || target >= rows.length) return;
              orderRows.mutate(orderPayload(arrayMove(rows, index, target)));
            }}
            onSave={(data) => updateRow.mutate({ rowId: row.id, data })}
            onDelete={() => deleteRow.mutate(row.id)}
          />
        )}
      </SortableList>
    </Panel>
  );
}

function ProductRowCard({
  row,
  index,
  total,
  categories,
  products,
  onMove,
  onSave,
  onDelete,
}: {
  row: IAdminHomeProductRow;
  index: number;
  total: number;
  categories: IAdminStorefrontCategory[];
  products: IAdminStorefrontProduct[];
  onMove: (direction: 'up' | 'down') => void;
  onSave: (data: {
    title: string;
    source: AdminHomeProductRowSource;
    placement: AdminHomeProductRowPlacement;
    productLimit: number;
    categoryId: string | null;
    isActive: boolean;
  }) => void;
  onDelete: () => void;
}): React.ReactElement {
  const updateItems = useUpdateHomeProductRowItems();
  const [draft, setDraft] = useState({
    title: row.title,
    source: row.source,
    placement: row.placement,
    productLimit: String(row.productLimit),
    categoryId: row.categoryId ?? '',
    isActive: row.isActive,
  });
  const [manualProductId, setManualProductId] = useState('');

  useEffect(() => {
    setDraft({
      title: row.title,
      source: row.source,
      placement: row.placement,
      productLimit: String(row.productLimit),
      categoryId: row.categoryId ?? '',
      isActive: row.isActive,
    });
  }, [row]);

  const manualIds = row.items.map((item) => item.productId);

  return (
    <article className="rounded-[6px] border border-[#E4EAF2] bg-white p-3 pl-14">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.75fr_0.75fr_0.45fr_auto]">
        <Input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} />
        <NativeSelect value={draft.source} onChange={(value) => setDraft((prev) => ({ ...prev, source: value as AdminHomeProductRowSource }))}>
          <option value="BESTSELLER">{adminCopy.sourceLabels.BESTSELLER}</option>
          <option value="FEATURED">{adminCopy.sourceLabels.FEATURED}</option>
          <option value="NEW">{adminCopy.sourceLabels.NEW}</option>
          <option value="CATEGORY">{adminCopy.sourceLabels.CATEGORY}</option>
          <option value="MANUAL">{adminCopy.sourceLabels.MANUAL}</option>
        </NativeSelect>
        <NativeSelect value={draft.placement} onChange={(value) => setDraft((prev) => ({ ...prev, placement: value as AdminHomeProductRowPlacement }))}>
          <option value="ABOVE_BANNERS">{adminCopy.placementLabels.ABOVE_BANNERS}</option>
          <option value="BELOW_BANNERS">{adminCopy.placementLabels.BELOW_BANNERS}</option>
        </NativeSelect>
        <Input value={draft.productLimit} onChange={(event) => setDraft((prev) => ({ ...prev, productLimit: event.target.value }))} inputMode="numeric" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="icon" variant="outline" className="rounded-[6px]" disabled={index === 0} onClick={() => onMove('up')} aria-label={adminCopy.moveUp}>
            <ArrowUp className="size-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" className="rounded-[6px]" disabled={index === total - 1} onClick={() => onMove('down')} aria-label={adminCopy.moveDown}>
            <ArrowDown className="size-4" />
          </Button>
          <Button type="button" size="icon" variant="outline" className="rounded-[6px] text-[#B42318]" onClick={onDelete} aria-label={adminCopy.deleteRow}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{adminCopy.sourceLabels[row.source]}</Badge>
          <Badge variant="outline">{row.placement === 'ABOVE_BANNERS' ? adminCopy.placementLabels.ABOVE_BANNERS : adminCopy.placementLabels.BELOW_BANNERS}</Badge>
          <TogglePill active={draft.isActive} label={draft.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => setDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} />
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.source === 'CATEGORY' && (
            <NativeSelect value={draft.categoryId} onChange={(value) => setDraft((prev) => ({ ...prev, categoryId: value }))}>
              <option value="">{adminCopy.chooseCategory}</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </NativeSelect>
          )}
          <Button
            type="button"
            className="rounded-[6px] bg-[#07152A] text-white hover:bg-[#142238]"
            onClick={() => onSave({
              title: draft.title,
              source: draft.source,
              placement: draft.placement,
              productLimit: Number(draft.productLimit || 6),
              categoryId: draft.source === 'CATEGORY' ? draft.categoryId : null,
              isActive: draft.isActive,
            })}
          >
            <Save className="size-4" />
            {adminCopy.saveRow}
          </Button>
        </div>
      </div>

      {draft.source === 'MANUAL' && (
        <div className="mt-3 rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <NativeSelect value={manualProductId} onChange={setManualProductId} className="w-full">
              <option value="">{adminCopy.chooseManualProduct}</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </NativeSelect>
            <Button
              type="button"
              className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]"
              disabled={!manualProductId || manualIds.includes(manualProductId)}
              onClick={() => {
                const next = [...manualIds, manualProductId];
                updateItems.mutate({
                  rowId: row.id,
                  data: { items: next.map((productId, sortOrder) => ({ productId, sortOrder: sortOrder + 1 })) },
                });
                setManualProductId('');
              }}
            >
              <Plus className="size-4" />
              {adminCopy.addProduct}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {row.items.map((item, itemIndex) => (
              <span key={item.productId} className="inline-flex items-center gap-2 rounded-full border border-[#DDE5EF] bg-white py-1 pl-2.5 pr-1 text-xs font-bold">
                {item.product.name}
                <button
                  type="button"
                  className="grid size-5 place-items-center rounded-full hover:bg-[#F2F5F9]"
                  onClick={() => {
                    const next = manualIds.filter((productId) => productId !== item.productId);
                    updateItems.mutate({
                      rowId: row.id,
                      data: { items: next.map((productId, sortOrder) => ({ productId, sortOrder: sortOrder + 1 })) },
                    });
                  }}
                    aria-label={adminCopy.removeProduct(item.product.name)}
                >
                  <X className="size-3" />
                </button>
                <span className="sr-only">{itemIndex + 1}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function PromoBannersEditor(): React.ReactElement {
  const homepage = useAdminHomepageConfig();
  const createBanner = useCreateHomePromoBanner();
  const updateBanner = useUpdateHomePromoBanner();
  const deleteBanner = useDeleteHomePromoBanner();
  const orderBanners = useUpdateHomePromoBannerOrder();
  const [draft, setDraft] = useState({
    imageUrl: '/storefront/promo-audio-sale.png',
    title: '',
    eyebrow: '',
    ctaLabel: 'ნახვა',
    ctaHref: '/products',
    tone: 'NAVY' as AdminHomePromoTone,
  });
  const banners = homepage.data?.promoBanners ?? [];

  return (
    <Panel title={adminCopy.promoBanners} description={adminCopy.promoBannersHint}>
      <form
        className="mb-4 grid gap-3 rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-3 lg:grid-cols-[0.9fr_1fr_0.7fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.title || !draft.imageUrl) return;
          createBanner.mutate({
            imageUrl: draft.imageUrl,
            title: draft.title,
            eyebrow: nullable(draft.eyebrow),
            ctaLabel: nullable(draft.ctaLabel),
            ctaHref: nullable(draft.ctaHref),
            tone: draft.tone,
            sortOrder: banners.length + 1,
            isActive: true,
          }, {
            onSuccess: () => setDraft((prev) => ({ ...prev, title: '', eyebrow: '' })),
          });
        }}
      >
        <Input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder={adminCopy.bannerTitle} />
        <div className="flex gap-2">
          <Input value={draft.imageUrl} onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder={adminCopy.imageUrl} />
          <AssetUploadButton kind="banner" label={adminCopy.promoBanner} compact onUploaded={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))} />
        </div>
        <NativeSelect value={draft.tone} onChange={(value) => setDraft((prev) => ({ ...prev, tone: value as AdminHomePromoTone }))}>
          <option value="NAVY">{adminCopy.toneLabels.NAVY}</option>
          <option value="WARM">{adminCopy.toneLabels.WARM}</option>
          <option value="BLUE">{adminCopy.toneLabels.BLUE}</option>
        </NativeSelect>
        <Button type="submit" className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]" disabled={createBanner.isPending}>
          <Plus className="size-4" />
          {adminCopy.add}
        </Button>
      </form>

      <SortableList
        items={banners}
        onReorder={(items) => orderBanners.mutate(orderPayload(items))}
      >
        {(banner: IAdminHomePromoBanner) => (
          <article className="rounded-[6px] border border-[#E4EAF2] bg-white p-3 pl-14">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative h-24 w-full overflow-hidden rounded-[6px] bg-[#F7F9FB] md:w-44">
                <SafeImage src={publicMediaUrl(banner.imageUrl)} alt="" fill sizes="176px" className="object-cover" />
              </div>
              <div className="grid min-w-0 flex-1 gap-2">
                <Input defaultValue={banner.title} onBlur={(event) => updateBanner.mutate({ bannerId: banner.id, data: { title: event.target.value } })} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input defaultValue={banner.eyebrow ?? ''} onBlur={(event) => updateBanner.mutate({ bannerId: banner.id, data: { eyebrow: nullable(event.target.value) } })} placeholder={adminCopy.eyebrow} />
                  <Input defaultValue={banner.ctaLabel ?? ''} onBlur={(event) => updateBanner.mutate({ bannerId: banner.id, data: { ctaLabel: nullable(event.target.value) } })} placeholder={adminCopy.ctaLabel} />
                  <NativeSelect value={banner.tone} onChange={(value) => updateBanner.mutate({ bannerId: banner.id, data: { tone: value as AdminHomePromoTone } })}>
                    <option value="NAVY">{adminCopy.toneLabels.NAVY}</option>
                    <option value="WARM">{adminCopy.toneLabels.WARM}</option>
                    <option value="BLUE">{adminCopy.toneLabels.BLUE}</option>
                  </NativeSelect>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TogglePill active={banner.isActive} label={banner.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => updateBanner.mutate({ bannerId: banner.id, data: { isActive: !banner.isActive } })} />
                  <AssetUploadButton kind="banner" label={banner.title} compact onUploaded={(url) => updateBanner.mutate({ bannerId: banner.id, data: { imageUrl: url } })} />
                  <Button type="button" size="sm" variant="outline" className="rounded-[6px] text-[#B42318]" onClick={() => deleteBanner.mutate(banner.id)}>
                    <Trash2 className="size-4" />
                    {adminCopy.delete}
                  </Button>
                </div>
              </div>
            </div>
          </article>
        )}
      </SortableList>
    </Panel>
  );
}

function ServiceNewsletterEditor(): React.ReactElement {
  const homepage = useAdminHomepageConfig();
  const createService = useCreateHomeServiceItem();
  const updateService = useUpdateHomeServiceItem();
  const deleteService = useDeleteHomeServiceItem();
  const orderServices = useUpdateHomeServiceItemOrder();
  const updateNewsletter = useUpdateHomeNewsletter();
  const [serviceDraft, setServiceDraft] = useState({ icon: 'shield', title: '', text: '' });
  const [newsletterDraft, setNewsletterDraft] = useState(emptyNewsletterDraft);

  useEffect(() => {
    if (!homepage.data?.newsletter) return;
    setNewsletterDraft({
      title: homepage.data.newsletter.title,
      text: homepage.data.newsletter.text,
      placeholder: homepage.data.newsletter.placeholder,
      buttonLabel: homepage.data.newsletter.buttonLabel,
      isActive: homepage.data.newsletter.isActive,
    });
  }, [homepage.data?.newsletter]);

  const services = homepage.data?.serviceItems ?? [];

  return (
    <div className="grid gap-5">
      <Panel title={adminCopy.serviceStrip} description={adminCopy.serviceStripHint}>
        <form
          className="mb-4 grid gap-3 rounded-[6px] border border-[#E4EAF2] bg-[#FAFBFC] p-3 sm:grid-cols-[0.45fr_1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!serviceDraft.title || !serviceDraft.text) return;
            createService.mutate({ ...serviceDraft, sortOrder: services.length + 1, isActive: true }, {
              onSuccess: () => setServiceDraft({ icon: 'shield', title: '', text: '' }),
            });
          }}
        >
          <Input value={serviceDraft.icon} onChange={(event) => setServiceDraft((prev) => ({ ...prev, icon: event.target.value }))} placeholder={adminCopy.icon} />
          <Input value={serviceDraft.title} onChange={(event) => setServiceDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder={adminCopy.title} />
          <Input value={serviceDraft.text} onChange={(event) => setServiceDraft((prev) => ({ ...prev, text: event.target.value }))} placeholder={adminCopy.text} />
          <Button type="submit" className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]">
            <Plus className="size-4" />
            {adminCopy.add}
          </Button>
        </form>
        <SortableList
          items={services}
          onReorder={(items) => orderServices.mutate(orderPayload(items))}
        >
          {(item: IAdminHomeServiceItem) => (
            <article className="rounded-[6px] border border-[#E4EAF2] bg-white p-3 pl-14">
              <div className="grid gap-2 sm:grid-cols-[0.4fr_1fr_1fr_auto]">
                <Input defaultValue={item.icon} onBlur={(event) => updateService.mutate({ itemId: item.id, data: { icon: event.target.value } })} />
                <Input defaultValue={item.title} onBlur={(event) => updateService.mutate({ itemId: item.id, data: { title: event.target.value } })} />
                <Input defaultValue={item.text} onBlur={(event) => updateService.mutate({ itemId: item.id, data: { text: event.target.value } })} />
                <div className="flex gap-2">
                  <TogglePill active={item.isActive} label={item.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => updateService.mutate({ itemId: item.id, data: { isActive: !item.isActive } })} />
                  <Button type="button" size="icon" variant="outline" className="rounded-[6px] text-[#B42318]" onClick={() => deleteService.mutate(item.id)} aria-label={adminCopy.deleteServiceItem}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          )}
        </SortableList>
      </Panel>

      <Panel title={adminCopy.newsletter} description={adminCopy.newsletterHint}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            updateNewsletter.mutate(newsletterDraft);
          }}
        >
          <Field label={adminCopy.title}>
            <Input value={newsletterDraft.title} onChange={(event) => setNewsletterDraft((prev) => ({ ...prev, title: event.target.value }))} />
          </Field>
          <Field label={adminCopy.text}>
            <Input value={newsletterDraft.text} onChange={(event) => setNewsletterDraft((prev) => ({ ...prev, text: event.target.value }))} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={adminCopy.placeholder}>
              <Input value={newsletterDraft.placeholder} onChange={(event) => setNewsletterDraft((prev) => ({ ...prev, placeholder: event.target.value }))} />
            </Field>
            <Field label={adminCopy.buttonLabel}>
              <Input value={newsletterDraft.buttonLabel} onChange={(event) => setNewsletterDraft((prev) => ({ ...prev, buttonLabel: event.target.value }))} />
            </Field>
          </div>
          <div className="flex items-center justify-between gap-3">
            <TogglePill active={newsletterDraft.isActive} label={newsletterDraft.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => setNewsletterDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} />
            <Button type="submit" className="rounded-[6px] bg-[#07152A] text-white hover:bg-[#142238]" disabled={updateNewsletter.isPending}>
              <Save className="size-4" />
              {adminCopy.saveNewsletter}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function HomepagePage({
  categories,
  products,
}: {
  categories: IAdminStorefrontCategory[];
  products: IAdminStorefrontProduct[];
}): React.ReactElement {
  return (
    <div className="grid gap-5">
      <HeroEditor />
      <ProductRowsEditor categories={categories} products={products} />
      <PromoBannersEditor />
      <ServiceNewsletterEditor />
    </div>
  );
}

function CategoryCard({
  category,
  categories,
}: {
  category: IAdminStorefrontCategory;
  categories: IAdminStorefrontCategory[];
}): React.ReactElement {
  const updateCategory = useUpdateStorefrontCategory();
  const deleteCategory = useDeleteStorefrontCategory();
  const parentOptions = topLevelCategories(categories, category.id);
  const hasChildren = category._count.children > 0;
  const [draft, setDraft] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    imageUrl: category.imageUrl ?? '',
    sortOrder: String(category.sortOrder),
    isFeatured: category.isFeatured,
    isActive: category.isActive,
    parentId: category.parentId ?? '',
  });

  useEffect(() => {
    setDraft({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      sortOrder: String(category.sortOrder),
      isFeatured: category.isFeatured,
      isActive: category.isActive,
      parentId: category.parentId ?? '',
    });
  }, [category]);

  return (
    <article className="rounded-[6px] border border-[#E4EAF2] bg-white p-3 pl-14">
      <div className="grid gap-3">
        <div className="relative grid size-[84px] place-items-center overflow-hidden rounded-[6px] bg-[#F7F9FB]">
          {draft.imageUrl ? (
            <SafeImage src={publicMediaUrl(draft.imageUrl)} alt={draft.name} fill sizes="84px" className="object-contain p-2" />
          ) : (
            <Camera className="size-6 text-[#7A8595]" />
          )}
        </div>
        <div className="grid gap-2">
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
            <Input value={draft.slug} onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))} />
          </div>
          <Input value={draft.description} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder={adminCopy.description} />
          <Field label={adminCopy.categoryParent}>
            {hasChildren ? (
              <span className="flex h-9 items-center rounded-md border border-input bg-[#F7F9FB] px-3 text-sm text-[#657286]">
                {adminCopy.categoryParentNone}
              </span>
            ) : (
              <NativeSelect value={draft.parentId} onChange={(value) => setDraft((prev) => ({ ...prev, parentId: value }))} className="w-full">
                <option value="">{adminCopy.categoryParentNone}</option>
                {parentOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
              </NativeSelect>
            )}
          </Field>
          <div className="flex gap-2">
            <Input value={draft.imageUrl} onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder={adminCopy.imageUrl} />
            <AssetUploadButton kind="category" label={draft.name} compact onUploaded={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))} />
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <TogglePill active={draft.isFeatured} label={draft.isFeatured ? adminCopy.rail : adminCopy.notRail} onClick={() => setDraft((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))} />
          <TogglePill active={draft.isActive} label={draft.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => setDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} />
          <Button
            type="button"
            className="rounded-[6px] bg-[#07152A] text-white hover:bg-[#142238]"
            disabled={updateCategory.isPending}
            onClick={() => updateCategory.mutate({
              categoryId: category.id,
              data: {
                name: draft.name,
                slug: draft.slug,
                description: nullable(draft.description),
                imageUrl: nullable(draft.imageUrl),
                sortOrder: Number(draft.sortOrder || 0),
                isFeatured: draft.isFeatured,
                isActive: draft.isActive,
                parentId: draft.parentId || null,
              },
            })}
          >
            <Save className="size-4" />
            {adminCopy.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-[6px] text-[#B42318]"
            disabled={deleteCategory.isPending || category._count.products > 0 || hasChildren}
            onClick={() => deleteCategory.mutate(category.id)}
          >
            <Trash2 className="size-4" />
            {adminCopy.delete}
          </Button>
          <Badge variant="outline">{adminCopy.productCount(category._count.products)}</Badge>
        </div>
      </div>
    </article>
  );
}

function CategoriesPage({ categories }: { categories: IAdminStorefrontCategory[] }): React.ReactElement {
  const createCategory = useCreateStorefrontCategory();
  const orderCategories = useUpdateStorefrontCategoryOrder();
  const parents = topLevelCategories(categories);
  const childrenOf = (parentId: string): IAdminStorefrontCategory[] =>
    categories.filter((item) => item.parentId === parentId);
  const [draft, setDraft] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    description: '',
    parentId: '',
  });

  return (
    <div className="grid gap-5">
      <Panel title={adminCopy.createCategory} description={adminCopy.createCategoryHint}>
        <form
          className="grid gap-3 lg:grid-cols-[1fr_1fr_1.1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.name) return;
            createCategory.mutate({
              name: draft.name,
              slug: draft.slug || slugify(draft.name),
              imageUrl: nullable(draft.imageUrl),
              description: nullable(draft.description),
              // Keep sortOrder scales separate: new siblings are numbered within their own group.
              sortOrder: (draft.parentId ? childrenOf(draft.parentId).length : parents.length) + 1,
              isFeatured: true,
              isActive: true,
              parentId: draft.parentId || null,
            }, {
              onSuccess: () => setDraft({ name: '', slug: '', imageUrl: '', description: '', parentId: '' }),
            });
          }}
        >
          <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }))} placeholder={adminCopy.categoryName} />
          <Input value={draft.slug} onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))} placeholder={adminCopy.slug} />
          <div className="flex gap-2">
            <Input value={draft.imageUrl} onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder={adminCopy.imageUrl} />
            <AssetUploadButton kind="category" label={draft.name} compact onUploaded={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))} />
          </div>
          <Field label={adminCopy.categoryParent}>
            <NativeSelect value={draft.parentId} onChange={(value) => setDraft((prev) => ({ ...prev, parentId: value }))} className="w-full">
              <option value="">{adminCopy.categoryParentNone}</option>
              {topLevelCategories(categories).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </NativeSelect>
          </Field>
          <Button type="submit" className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]" disabled={createCategory.isPending}>
            <Plus className="size-4" />
            {adminCopy.createCategory}
          </Button>
        </form>
      </Panel>

      <Panel title={adminCopy.nav.categories} description={adminCopy.categoriesHint}>
        {/* Two sortOrder scales, never mixed: dragging a parent renumbers only top-level
            categories; dragging a child renumbers only that parent's children. */}
        <SortableList
          items={parents}
          onReorder={(items) => orderCategories.mutate(orderPayload(items))}
        >
          {(category) => {
            const children = childrenOf(category.id);
            return (
              <div className="grid gap-3">
                <CategoryCard category={category} categories={categories} />
                {children.length > 0 && (
                  <div className="ml-10 grid gap-3 border-l-2 border-[#E4EAF2] pl-4">
                    <SortableList
                      items={children}
                      onReorder={(items) => orderCategories.mutate(orderPayload(items))}
                    >
                      {(child) => <CategoryCard category={child} categories={categories} />}
                    </SortableList>
                  </div>
                )}
              </div>
            );
          }}
        </SortableList>
      </Panel>
    </div>
  );
}

/**
 * Trims + drops empty spec rows/groups and half-filled questions before submit,
 * while spreading sku/highlights/featureCards/benefits/delivery through
 * untouched so an edit round-trips the parts this form does not manage.
 */
function pruneAttributes(
  attributes: IAdminProductAttributes | null | undefined,
): IAdminProductAttributes | null | undefined {
  if (!attributes) return attributes;

  const specificationGroups = (attributes.specificationGroups ?? [])
    .map((group) => ({
      title: group.title.trim(),
      items: group.items
        .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
        .filter((item) => item.label.length > 0 && item.value.length > 0),
    }))
    .filter((group) => group.title.length > 0 && group.items.length > 0);

  const questions = (attributes.questions ?? [])
    .map((entry) => ({ question: entry.question.trim(), answer: entry.answer.trim() }))
    .filter((entry) => entry.question.length > 0 && entry.answer.length > 0);

  return { ...attributes, specificationGroups, questions };
}

function EditorSection({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function SpecsEditor({
  groups,
  onChange,
}: {
  groups: IAdminProductSpecGroup[];
  onChange: (groups: IAdminProductSpecGroup[]) => void;
}): React.ReactElement {
  const updateGroup = (index: number, patch: Partial<IAdminProductSpecGroup>): void => {
    onChange(groups.map((group, i) => (i === index ? { ...group, ...patch } : group)));
  };

  return (
    <div className="grid gap-3">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="grid gap-2 rounded-[6px] border border-border bg-card p-3">
          <div className="flex gap-2">
            <Input
              value={group.title}
              onChange={(event) => updateGroup(groupIndex, { title: event.target.value })}
              placeholder={adminCopy.specsGroupTitle}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0 rounded-[6px] text-destructive"
              onClick={() => onChange(groups.filter((_, i) => i !== groupIndex))}
              aria-label={adminCopy.specsRemoveGroup}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          {group.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex gap-2">
              <Input
                value={item.label}
                onChange={(event) => updateGroup(groupIndex, {
                  items: group.items.map((row, i) => (i === itemIndex ? { ...row, label: event.target.value } : row)),
                })}
                placeholder={adminCopy.specsLabel}
              />
              <Input
                value={item.value}
                onChange={(event) => updateGroup(groupIndex, {
                  items: group.items.map((row, i) => (i === itemIndex ? { ...row, value: event.target.value } : row)),
                })}
                placeholder={adminCopy.specsValue}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="shrink-0 rounded-[6px] text-destructive"
                onClick={() => updateGroup(groupIndex, { items: group.items.filter((_, i) => i !== itemIndex) })}
                aria-label={adminCopy.specsRemoveRow}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="justify-self-start rounded-[6px]"
            onClick={() => updateGroup(groupIndex, { items: [...group.items, { label: '', value: '' }] })}
          >
            <Plus className="size-4" />
            {adminCopy.specsAddRow}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="justify-self-start rounded-[6px]"
        onClick={() => onChange([...groups, { title: '', items: [{ label: '', value: '' }] }])}
      >
        <Plus className="size-4" />
        {adminCopy.specsAddGroup}
      </Button>
    </div>
  );
}

function QuestionsEditor({
  questions,
  onChange,
}: {
  questions: IAdminProductQuestion[];
  onChange: (questions: IAdminProductQuestion[]) => void;
}): React.ReactElement {
  const updateQuestion = (index: number, patch: Partial<IAdminProductQuestion>): void => {
    onChange(questions.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  return (
    <div className="grid gap-3">
      {questions.map((entry, index) => (
        <div key={index} className="grid gap-2 rounded-[6px] border border-border bg-card p-3">
          <div className="flex gap-2">
            <Input
              value={entry.question}
              onChange={(event) => updateQuestion(index, { question: event.target.value })}
              placeholder={adminCopy.questionsQuestion}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0 rounded-[6px] text-destructive"
              onClick={() => onChange(questions.filter((_, i) => i !== index))}
              aria-label={adminCopy.questionsRemove}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <EditorSection label={adminCopy.questionsAnswer}>
            <RichTextEditor value={entry.answer} onChange={(html) => updateQuestion(index, { answer: html })} />
          </EditorSection>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="justify-self-start rounded-[6px]"
        onClick={() => onChange([...questions, { question: '', answer: '' }])}
      >
        <Plus className="size-4" />
        {adminCopy.questionsAdd}
      </Button>
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  onClose,
}: {
  product?: IAdminStorefrontProduct;
  categories: IAdminStorefrontCategory[];
  onClose: () => void;
}): React.ReactElement {
  const createProduct = useCreateStorefrontProduct();
  const updateProduct = useUpdateStorefrontProduct();
  const deactivateProduct = useDeactivateStorefrontProduct();
  const uploadDescriptionImage = useUploadStorefrontAsset();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draft, setDraft] = useState<ICreateStorefrontProductRequest>({
    ...emptyProductDraft,
    categoryId: categories[0]?.id ?? '',
  });

  useEffect(() => {
    if (!product) {
      setDraft({ ...emptyProductDraft, categoryId: categories[0]?.id ?? '' });
      return;
    }

    setDraft({
      slug: product.slug,
      name: product.name,
      description: product.description ?? '',
      brand: product.brand,
      imageUrl: product.imageUrl,
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      currency: product.currency,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      isActive: product.isActive,
      categoryId: product.categoryId,
      gallery: product.gallery,
      attributes: product.attributes,
    });
  }, [categories, product]);

  const isSaving = createProduct.isPending || updateProduct.isPending;
  const isDeleting = deactivateProduct.isPending;

  const patchAttributes = (patch: Partial<IAdminProductAttributes>): void => {
    setDraft((prev) => ({ ...prev, attributes: { ...(prev.attributes ?? {}), ...patch } }));
  };

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const payload = {
          ...draft,
          slug: draft.slug || slugify(draft.name),
          description: nullable(String(draft.description ?? '')),
          originalPrice: draft.originalPrice ? Number(draft.originalPrice) : null,
          salePrice: Number(draft.salePrice),
          attributes: pruneAttributes(draft.attributes),
        };
        if (product) {
          updateProduct.mutate({ productId: product.id, data: payload }, { onSuccess: onClose });
        } else {
          createProduct.mutate(payload, { onSuccess: onClose });
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={adminCopy.name}>
          <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }))} required />
        </Field>
        <Field label={adminCopy.slug}>
          <Input value={draft.slug} onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))} required />
        </Field>
        <Field label={adminCopy.brand}>
          <Input value={draft.brand} onChange={(event) => setDraft((prev) => ({ ...prev, brand: event.target.value }))} required />
        </Field>
        <Field label={adminCopy.category}>
          <NativeSelect value={draft.categoryId} onChange={(value) => setDraft((prev) => ({ ...prev, categoryId: value }))} className="w-full">
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </NativeSelect>
        </Field>
        <Field label={adminCopy.salePrice}>
          <Input value={String(draft.salePrice)} onChange={(event) => setDraft((prev) => ({ ...prev, salePrice: Number(event.target.value || 0) }))} inputMode="numeric" />
        </Field>
        <Field label={adminCopy.originalPrice}>
          <Input value={String(draft.originalPrice ?? '')} onChange={(event) => setDraft((prev) => ({ ...prev, originalPrice: event.target.value ? Number(event.target.value) : null }))} inputMode="numeric" />
        </Field>
      </div>
      <EditorSection label={adminCopy.description}>
        <RichTextEditor
          value={String(draft.description ?? '')}
          onChange={(html) => setDraft((prev) => ({ ...prev, description: html }))}
          defaultImageAlt={draft.name}
          onImageUpload={async (file) => {
            const asset = await uploadDescriptionImage.mutateAsync({ file, kind: 'product', label: draft.name });
            return asset.url;
          }}
        />
      </EditorSection>
      <Field label={adminCopy.image}>
        <div className="flex gap-2">
          <Input value={draft.imageUrl} onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))} />
          <AssetUploadButton kind="product" label={draft.name} compact onUploaded={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))} />
        </div>
      </Field>
      <EditorSection label={adminCopy.specsSection}>
        <SpecsEditor
          groups={draft.attributes?.specificationGroups ?? []}
          onChange={(specificationGroups) => patchAttributes({ specificationGroups })}
        />
      </EditorSection>
      <EditorSection label={adminCopy.questionsSection}>
        <QuestionsEditor
          questions={draft.attributes?.questions ?? []}
          onChange={(questions) => patchAttributes({ questions })}
        />
      </EditorSection>
      <div className="flex flex-wrap gap-2">
        <TogglePill active={Boolean(draft.isFeatured)} label={adminCopy.sourceLabels.FEATURED} onClick={() => setDraft((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))} />
        <TogglePill active={Boolean(draft.isBestseller)} label={adminCopy.sourceLabels.BESTSELLER} onClick={() => setDraft((prev) => ({ ...prev, isBestseller: !prev.isBestseller }))} />
        <TogglePill active={Boolean(draft.isNew)} label={adminCopy.sourceLabels.NEW} onClick={() => setDraft((prev) => ({ ...prev, isNew: !prev.isNew }))} />
        <TogglePill active={Boolean(draft.isActive)} label={draft.isActive ? copy.admin.live : copy.admin.hidden} onClick={() => setDraft((prev) => ({ ...prev, isActive: !prev.isActive }))} />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Button type="submit" className="rounded-[6px] bg-[#07152A] text-white hover:bg-[#142238]" disabled={isSaving || !categories.length}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {product ? adminCopy.saveProduct : adminCopy.createProduct}
        </Button>
        <Button type="button" variant="outline" className="rounded-[6px]" onClick={() => setPreviewOpen(true)}>
          <Eye className="size-4" />
          {adminCopy.previewProduct}
        </Button>
        {product && (
          <Button
            type="button"
            variant="outline"
            className="rounded-[6px] border-[#F2D0D0] text-[#B42318] hover:bg-[#FFF5F5] hover:text-[#B42318] sm:col-span-2"
            disabled={isDeleting || !product.isActive}
            onClick={() => {
              if (!window.confirm(`${adminCopy.delete}: ${product.name}?`)) return;
              deactivateProduct.mutate(product.id, { onSuccess: onClose });
            }}
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {adminCopy.delete}
          </Button>
        )}
      </div>
      <ProductPreviewDialog draft={draft} open={previewOpen} onOpenChange={setPreviewOpen} />
    </form>
  );
}

function ProductsPage({ categories }: { categories: IAdminStorefrontCategory[] }): React.ReactElement {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'featured' | 'bestseller' | 'new'>('all');
  const [editingProduct, setEditingProduct] = useState<IAdminStorefrontProduct | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const updateProduct = useUpdateStorefrontProduct();
  const deactivateProduct = useDeactivateStorefrontProduct();
  const params = useMemo(() => ({
    page: 1,
    limit: 20,
    search: search || undefined,
    category: categoryFilter || undefined,
    section: sectionFilter === 'all' ? undefined : sectionFilter,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
  }), [categoryFilter, search, sectionFilter]);
  const productsQuery = useAdminStorefrontProducts(params);
  const products = productsQuery.data?.items ?? [];

  return (
    <Panel
      title={adminCopy.nav.products}
      description={adminCopy.productDetails}
      action={(
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button type="button" className="rounded-[10px] bg-[#FF4057] text-white hover:bg-[#E9344C]" onClick={() => setEditingProduct(undefined)}>
              <PackagePlus className="size-4" />
              {adminCopy.newProduct}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto p-5 sm:max-w-[620px] sm:p-6">
            <SheetHeader>
              <SheetTitle>{editingProduct ? adminCopy.editProduct : adminCopy.createProduct}</SheetTitle>
              <SheetDescription>{adminCopy.productDetails}</SheetDescription>
            </SheetHeader>
            <ProductEditor product={editingProduct} categories={categories} onClose={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    >
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative lg:w-[320px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7A8595]" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={adminCopy.searchProducts} className="pl-9" />
        </div>
        <NativeSelect value={categoryFilter} onChange={setCategoryFilter}>
          <option value="">{adminCopy.allCategories}</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </NativeSelect>
        <NativeSelect value={sectionFilter} onChange={(value) => setSectionFilter(value as typeof sectionFilter)}>
          <option value="all">{adminCopy.allSections}</option>
          <option value="featured">{adminCopy.sourceLabels.FEATURED}</option>
          <option value="bestseller">{adminCopy.sourceLabels.BESTSELLER}</option>
          <option value="new">{adminCopy.newProducts}</option>
        </NativeSelect>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.product}</TableHead>
              <TableHead>{adminCopy.price}</TableHead>
              <TableHead>{adminCopy.flags}</TableHead>
              <TableHead className="text-right">{adminCopy.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">{adminCopy.loadingProducts}</TableCell>
              </TableRow>
            )}
            {!productsQuery.isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">{adminCopy.noProducts}</TableCell>
              </TableRow>
            )}
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex min-w-[260px] items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-[6px] bg-[#F7F9FB]">
                      <SafeImage src={publicMediaUrl(product.imageUrl)} alt={product.name} fill sizes="48px" className="object-contain p-1.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-bold">{product.name}</p>
                      <p className="text-xs text-[#657286]">{product.category.name} · {product.brand}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-bold tabular-nums">{formatGel(product.salePrice)}</TableCell>
                <TableCell>
                  <div className="flex min-w-[300px] flex-wrap gap-2">
                    <TogglePill active={product.isFeatured} label={adminCopy.sourceLabels.FEATURED} disabled={updateProduct.isPending} onClick={() => updateProduct.mutate({ productId: product.id, data: { isFeatured: !product.isFeatured } })} />
                    <TogglePill active={product.isBestseller} label={adminCopy.sourceLabels.BESTSELLER} disabled={updateProduct.isPending} onClick={() => updateProduct.mutate({ productId: product.id, data: { isBestseller: !product.isBestseller } })} />
                    <TogglePill active={product.isNew} label={adminCopy.sourceLabels.NEW} disabled={updateProduct.isPending} onClick={() => updateProduct.mutate({ productId: product.id, data: { isNew: !product.isNew } })} />
                    <TogglePill active={product.isActive} label={product.isActive ? copy.admin.live : copy.admin.hidden} disabled={updateProduct.isPending} onClick={() => updateProduct.mutate({ productId: product.id, data: { isActive: !product.isActive } })} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" className="rounded-[6px]" onClick={() => { setEditingProduct(product); setSheetOpen(true); }}>
                      {adminCopy.edit}
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="rounded-[6px] text-[#B42318]" disabled={deactivateProduct.isPending || !product.isActive} onClick={() => deactivateProduct.mutate(product.id)}>
                      {adminCopy.hide}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}

function UsersPage(): React.ReactElement {
  const { users, isLoading } = useAdminUsers({ page: 1, limit: 20 });
  const updateUserStatus = useUpdateUserStatus();
  const updateUserRole = useUpdateUserRole();

  return (
    <Panel title={adminCopy.nav.users} description={adminCopy.usersHint}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.admin.user}</TableHead>
              <TableHead>{adminCopy.role}</TableHead>
              <TableHead>{adminCopy.status}</TableHead>
              <TableHead className="text-right">{adminCopy.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4}>{adminCopy.loadingUsers}</TableCell></TableRow>}
            {users.map((adminUser) => (
              <TableRow key={adminUser.id}>
                <TableCell>
                  <p className="font-bold">{adminUser.firstName} {adminUser.lastName}</p>
                  <p className="text-xs text-[#657286]">{adminUser.email}</p>
                </TableCell>
                <TableCell><Badge>{adminUser.role}</Badge></TableCell>
                <TableCell>{adminUser.isActive ? copy.admin.active : copy.admin.inactive}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" className="rounded-[6px]" disabled={updateUserStatus.isUpdating} onClick={() => updateUserStatus.updateStatus({ userId: adminUser.id, isActive: !adminUser.isActive })}>
                      {adminUser.isActive ? copy.admin.deactivate : copy.admin.activate}
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="rounded-[6px]" disabled={updateUserRole.isUpdating} onClick={() => updateUserRole.updateRole({ userId: adminUser.id, role: adminUser.role === 'ADMIN' ? 'USER' : 'ADMIN' })}>
                      {adminUser.role === 'ADMIN' ? copy.admin.demote : copy.admin.makeAdmin}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}

function SessionsPage(): React.ReactElement {
  const { sessions, isLoading } = useAdminSessions({ page: 1, limit: 30 });
  const expireSession = useForceExpireSession();

  return (
    <Panel title={adminCopy.nav.sessions} description={adminCopy.sessionsHint}>
      <div className="grid gap-2">
        {isLoading && <div className="rounded-[6px] border border-[#E4EAF2] bg-white p-4 text-sm text-[#657286]">{adminCopy.loadingSessions}</div>}
        {sessions.map((session) => (
          <article key={session.id} className="flex items-start justify-between gap-3 rounded-[6px] border border-[#E4EAF2] bg-white p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{session.user.email}</p>
              <p className="mt-1 text-xs text-[#657286]">{formatDate(session.lastActiveAt)} · {session.ipAddress ?? adminCopy.unknownIp}</p>
              <p className="mt-1 truncate text-xs text-[#8B96A5]">{session.deviceInfo ?? adminCopy.unknownDevice}</p>
            </div>
            <Button type="button" size="sm" variant="outline" className="rounded-[6px]" disabled={expireSession.isExpiring} onClick={() => expireSession.expireSession(session.id)}>
              {adminCopy.expire}
            </Button>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function OrderItemsPreview({ order }: { order: IAdminOrder }): React.ReactElement {
  return (
    <div className="grid gap-2">
      {order.items.map((item) => (
        <div key={item.id} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2">
          <span className="relative block aspect-square overflow-hidden rounded-[6px] bg-[#F8FAFC]">
            <SafeImage src={publicMediaUrl(item.productImageUrl)} alt="" fill sizes="42px" className="object-contain p-1" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold text-[#07152A]">{item.productName}</span>
            <span className="block text-[11px] text-[#657286]">x {item.quantity}</span>
          </span>
          <span className="text-xs font-black tabular-nums">{formatGel(item.lineTotal)}</span>
        </div>
      ))}
    </div>
  );
}

function OrdersPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | AdminOrderStatus>('ALL');
  const params = useMemo(() => ({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
    status: status === 'ALL' ? undefined : status,
  }), [search, status]);
  const ordersQuery = useAdminOrders(params);
  const updateOrderStatus = useUpdateAdminOrderStatus();
  const orders = ordersQuery.data?.items ?? [];

  return (
    <Panel
      title={adminCopy.nav.orders}
      description={adminCopy.ordersHint}
      action={(
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={adminCopy.orderSearch}
            className="h-9 sm:w-56"
          />
          <NativeSelect value={status} onChange={(value) => setStatus(value as 'ALL' | AdminOrderStatus)}>
            <option value="ALL">{adminCopy.allStatuses}</option>
            {orderStatuses.map((item) => (
              <option key={item} value={item}>{adminCopy.statusLabels[item]}</option>
            ))}
          </NativeSelect>
        </div>
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.orderCode}</TableHead>
              <TableHead>{adminCopy.customer}</TableHead>
              <TableHead>{adminCopy.items}</TableHead>
              <TableHead>{adminCopy.total}</TableHead>
              <TableHead>{adminCopy.status}</TableHead>
              <TableHead>{adminCopy.telegram}</TableHead>
              <TableHead>{adminCopy.created}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersQuery.isLoading && <TableRow><TableCell colSpan={7}>{adminCopy.loadingOrders}</TableCell></TableRow>}
            {!ordersQuery.isLoading && orders.length === 0 && <TableRow><TableCell colSpan={7}>{adminCopy.noOrders}</TableCell></TableRow>}
            {orders.map((order) => (
              <TableRow key={order.id} className="align-top">
                <TableCell className="min-w-[180px]">
                  <p className="font-black">{order.publicCode}</p>
                  <p className="mt-1 text-xs text-[#657286]">{order.user?.email ?? adminCopy.guestCustomer}</p>
                </TableCell>
                <TableCell className="min-w-[230px]">
                  <p className="font-bold">{order.firstName} {order.lastName}</p>
                  <p className="mt-1 text-xs text-[#657286]">{order.phone}</p>
                  <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#657286]">
                    <span className="font-bold text-[#07152A]">{adminCopy.deliveryAddress}: </span>
                    {order.deliveryAddress}
                  </p>
                </TableCell>
                <TableCell className="min-w-[280px]">
                  <OrderItemsPreview order={order} />
                </TableCell>
                <TableCell className="whitespace-nowrap font-black tabular-nums">{formatGel(order.total)}</TableCell>
                <TableCell className="min-w-[190px]">
                  <NativeSelect
                    value={order.status}
                    onChange={(value) => updateOrderStatus.mutate({ orderId: order.id, status: value as AdminOrderStatus })}
                    className="w-full"
                  >
                    {orderStatuses.map((item) => (
                      <option key={item} value={item}>{adminCopy.statusLabels[item]}</option>
                    ))}
                  </NativeSelect>
                </TableCell>
                <TableCell className="min-w-[150px]">
                  <Badge className="border-[#D9ECFF] bg-[#F0F7FF] text-[#174A98]">{order.telegramStatus}</Badge>
                  {order.telegramError && <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#A23A3A]">{order.telegramError}</p>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-[#657286]">{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}

function DashboardContent({ page }: { page: AdminPage }): React.ReactElement {
  const { stats } = useAdminStats(true);
  const storefrontSummary = useAdminStorefrontSummary(true);
  const categoriesQuery = useAdminStorefrontCategories(true);
  const homepage = useAdminHomepageConfig(true);
  const productOptions = useAdminStorefrontProducts({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' }, true);

  const categories = categoriesQuery.data ?? [];
  const products = productOptions.data?.items ?? [];

  if (page === 'homepage') {
    return <HomepagePage categories={categories} products={products} />;
  }

  if (page === 'categories') {
    return <CategoriesPage categories={categories} />;
  }

  if (page === 'products') {
    return <ProductsPage categories={categories} />;
  }

  if (page === 'orders') {
    return <OrdersPage />;
  }

  if (page === 'users') {
    return <UsersPage />;
  }

  if (page === 'sessions') {
    return <SessionsPage />;
  }

  return (
    <OverviewPage
      stats={stats}
      summary={storefrontSummary.data}
      homepageCounts={{
        rows: homepage.data?.productRows.length ?? 0,
        banners: homepage.data?.promoBanners.length ?? 0,
        services: homepage.data?.serviceItems.length ?? 0,
      }}
    />
  );
}

export function AdminDashboard(): React.ReactElement {
  return <AccessState />;
}
