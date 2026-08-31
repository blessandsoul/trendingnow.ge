import type { Metadata } from 'next';
import Link from 'next/link';
import type React from 'react';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { Heart, KeyRound, LifeBuoy, MailCheck, PackageCheck, ShieldCheck, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { PasswordResetScreen } from '@/features/auth/components/PasswordResetScreen';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { CartStorefront } from '@/features/storefront/components/CartStorefront';
import { FavoritesDashboard } from '@/features/storefront/components/FavoritesDashboard';
import { HomeStorefront } from '@/features/storefront/components/HomeStorefront';
import { ProductDetailRoute } from '@/features/storefront/pages/ProductDetailRoute';
import { ProductsStorefront } from '@/features/storefront/components/ProductsStorefront';
import { OrderSuccessPage } from '@/features/storefront/components/OrderSuccessPage';
import { OrdersDashboard } from '@/features/storefront/components/OrdersDashboard';
import { StorefrontInfoPage } from '@/features/storefront/components/StorefrontInfoPage';
import { productMetadataForSlug } from '@/features/storefront/lib/product-metadata';
import { getCopy, type AppCopy } from '@/i18n/copy';
import { DEFAULT_LOCALE, isActiveLocale, localizedPath, type ActiveLocale } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';
import {
  buildCatalogMetadata,
  buildPrivateMetadata,
  buildPublicMetadata,
  hasCatalogRefinement,
  type MetadataSearchParams,
} from '@/lib/seo/metadata';

interface PageProps {
  params: Promise<{
    locale: string;
    segments?: string[];
  }>;
  searchParams: Promise<MetadataSearchParams>;
}

type PrefixedLocale = Exclude<ActiveLocale, typeof DEFAULT_LOCALE>;
type InfoPageKey = keyof AppCopy['infoPages'];
type RouteSegments = readonly string[];

const infoPageRoutes = {
  'about-us': 'aboutUs',
  delivery: 'delivery',
  warranty: 'warranty',
  'payment-methods': 'paymentMethods',
  faq: 'faq',
  contact: 'contact',
  'corporate-offer': 'corporateOffer',
} as const satisfies Record<string, InfoPageKey>;

type InfoPageSlug = keyof typeof infoPageRoutes;

function isInfoPageSlug(slug: string): slug is InfoPageSlug {
  return slug in infoPageRoutes;
}

function pathFromSegments(segments: RouteSegments): string {
  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

function resolvePrefixedLocale(rawLocale: string, segments: RouteSegments): PrefixedLocale {
  if (rawLocale === DEFAULT_LOCALE) {
    permanentRedirect(pathFromSegments(segments));
  }

  if (!isActiveLocale(rawLocale)) {
    notFound();
  }

  return rawLocale as PrefixedLocale;
}

function getInfoPageKey(segments: RouteSegments): InfoPageKey | null {
  if (segments.length !== 1) return null;

  const [slug] = segments;
  return isInfoPageSlug(slug) ? infoPageRoutes[slug] : null;
}

async function metadataForSegments(
  copy: AppCopy,
  locale: ActiveLocale,
  segments: RouteSegments,
  searchParams: MetadataSearchParams,
): Promise<Metadata> {
  const infoPageKey = getInfoPageKey(segments);
  if (infoPageKey) return buildPublicMetadata(copy.infoPages[infoPageKey].metadata, locale, pathFromSegments(segments));

  if (segments.length === 0) return buildPublicMetadata(copy.metadata.home, locale, '/');
  if (segments.length === 2 && segments[0] === 'products') return productMetadataForSlug(segments[1], copy, locale);
  if (segments.length === 2 && segments[0] === 'dashboard' && segments[1] === 'favorites') return buildPrivateMetadata(copy.metadata.dashboard);
  if (segments.length === 2 && segments[0] === 'dashboard' && segments[1] === 'orders') return buildPrivateMetadata(copy.metadata.dashboard);
  if (segments.length === 2 && segments[0] === 'order-success') return buildPrivateMetadata(copy.metadata.cart);
  if (segments.length !== 1) return {};

  switch (segments[0]) {
    case 'products':
      return buildCatalogMetadata(copy.metadata.products, locale, hasCatalogRefinement(searchParams));
    case 'cart':
      return buildPrivateMetadata(copy.metadata.cart);
    case 'login':
      return buildPrivateMetadata(copy.metadata.login);
    case 'register':
      return buildPrivateMetadata(copy.metadata.register);
    case 'reset-password':
      return buildPrivateMetadata(copy.metadata.resetPassword);
    case 'verify-account':
      return buildPrivateMetadata(copy.metadata.verifyAccount);
    case 'dashboard':
      return buildPrivateMetadata(copy.metadata.dashboard);
    default:
      return {};
  }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale: rawLocale, segments = [] }, query] = await Promise.all([params, searchParams]);

  if (rawLocale === DEFAULT_LOCALE) {
    return metadataForSegments(getCopy(DEFAULT_LOCALE), DEFAULT_LOCALE, segments, query);
  }

  if (!isActiveLocale(rawLocale)) {
    return {};
  }

  return metadataForSegments(getCopy(rawLocale), rawLocale, segments, query);
}

export default async function Page({ params }: PageProps): Promise<React.ReactElement> {
  const { locale: rawLocale, segments = [] } = await params;
  const locale = resolvePrefixedLocale(rawLocale, segments);
  const copy = getCopy(locale);

  if (segments.length === 0) return <HomeStorefront />;

  const infoPageKey = getInfoPageKey(segments);
  if (infoPageKey) return <StorefrontInfoPage {...copy.infoPages[infoPageKey]} />;

  if (segments.length === 2 && segments[0] === 'products') {
    return <ProductDetailRoute slug={segments[1]} />;
  }

  if (segments.length === 2 && segments[0] === 'dashboard' && segments[1] === 'favorites') {
    return <FavoritesDashboard />;
  }

  if (segments.length === 2 && segments[0] === 'dashboard' && segments[1] === 'orders') {
    return <OrdersDashboard />;
  }

  if (segments.length === 2 && segments[0] === 'order-success') {
    return <OrderSuccessPage orderCode={segments[1]} locale={locale} />;
  }

  if (segments.length !== 1) notFound();

  switch (segments[0]) {
    case 'products':
      return <ProductsStorefront />;
    case 'cart':
      return <CartStorefront />;
    case 'login':
      return <LoginRoute copy={copy} />;
    case 'register':
      return <RegisterRoute copy={copy} />;
    case 'reset-password':
      return <ResetPasswordRoute copy={copy} />;
    case 'verify-account':
      return <VerifyAccountRoute copy={copy} locale={locale} />;
    case 'dashboard':
      redirect(localizedPath(locale, ROUTES.DASHBOARD_FAVORITES));
    default:
      notFound();
  }
}

function LoginRoute({ copy }: { copy: AppCopy }): React.ReactElement {
  return (
    <AuthPageShell
      panelTitle={copy.auth.login.panelTitle}
      panelDescription={copy.auth.login.panelDescription}
      panelItems={[
        {
          icon: PackageCheck,
          title: copy.auth.panelItems.ordersTitle,
          description: copy.auth.panelItems.ordersText,
        },
        {
          icon: Heart,
          title: copy.auth.panelItems.favoritesTitle,
          description: copy.auth.panelItems.favoritesText,
        },
        {
          icon: ShoppingBag,
          title: copy.auth.panelItems.fastBuyTitle,
          description: copy.auth.panelItems.fastBuyText,
        },
      ]}
    >
      <LoginForm />
    </AuthPageShell>
  );
}

function RegisterRoute({ copy }: { copy: AppCopy }): React.ReactElement {
  return (
    <AuthPageShell
      panelTitle={copy.auth.register.panelTitle}
      panelDescription={copy.auth.register.panelDescription}
      panelItems={[
        {
          icon: PackageCheck,
          title: copy.auth.panelItems.orderHistoryTitle,
          description: copy.auth.panelItems.orderHistoryText,
        },
        {
          icon: Heart,
          title: copy.auth.panelItems.favoritesTitle,
          description: copy.auth.panelItems.favoritesText,
        },
        {
          icon: LifeBuoy,
          title: copy.auth.panelItems.supportTitle,
          description: copy.auth.panelItems.supportText,
        },
      ]}
    >
      <RegisterForm />
    </AuthPageShell>
  );
}

function ResetPasswordRoute({ copy }: { copy: AppCopy }): React.ReactElement {
  return (
    <AuthPageShell
      panelTitle={copy.auth.reset.panelTitle}
      panelDescription={copy.auth.reset.panelDescription}
      panelItems={[
        {
          icon: MailCheck,
          title: copy.auth.panelItems.emailLinkTitle,
          description: copy.auth.panelItems.emailLinkText,
        },
        {
          icon: KeyRound,
          title: copy.auth.panelItems.newPasswordTitle,
          description: copy.auth.panelItems.newPasswordText,
        },
        {
          icon: ShieldCheck,
          title: copy.auth.panelItems.accountTitle,
          description: copy.auth.panelItems.accountText,
        },
      ]}
    >
      <PasswordResetScreen />
    </AuthPageShell>
  );
}

function VerifyAccountRoute({
  copy,
  locale,
}: {
  copy: AppCopy;
  locale: ActiveLocale;
}): React.ReactElement {
  return (
    <AuthPageShell
      panelTitle={copy.auth.verify.panelTitle}
      panelDescription={copy.auth.verify.panelDescription}
      panelItems={[
        {
          icon: MailCheck,
          title: copy.auth.panelItems.emailTitle,
          description: copy.auth.panelItems.emailText,
        },
        {
          icon: PackageCheck,
          title: copy.auth.panelItems.ordersTitle,
          description: copy.auth.panelItems.ordersTextShort,
        },
        {
          icon: Heart,
          title: copy.auth.panelItems.favoritesTitle,
          description: copy.auth.panelItems.favoritesAccountText,
        },
      ]}
    >
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-[8px] bg-[#FFF7D7] text-[#07152A]">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-[#07152A]">{copy.auth.verify.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#6B7685]">{copy.auth.verify.description}</p>
        <Button asChild className="mt-6 h-11 rounded-[7px] bg-[#FDC302] px-5 font-black text-[#07152A] hover:bg-[#F2B900]">
          <Link href={localizedPath(locale, ROUTES.LOGIN)}>{copy.auth.verify.backToLogin}</Link>
        </Button>
      </div>
    </AuthPageShell>
  );
}
