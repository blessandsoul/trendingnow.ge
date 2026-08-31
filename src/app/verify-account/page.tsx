import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, MailCheck, PackageCheck } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { localizedPath } from '@/i18n/locales';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { ROUTES } from '@/lib/constants/routes';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return buildPrivateMetadata(copy.metadata.verifyAccount);
}

export default async function VerifyAccountPage(): Promise<React.ReactElement> {
  const copy = await getRequestCopy();
  const locale = await getRequestLocale();

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
        <span className="tn-soft-icon mx-auto grid size-16 place-items-center rounded-[16px]">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] text-[#11141B]">{copy.auth.verify.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#69717E]">
          {copy.auth.verify.description}
        </p>
        <Button asChild className="tn-primary-action mt-6 h-12 px-6 font-black">
          <Link href={localizedPath(locale, ROUTES.LOGIN)}>{copy.auth.verify.backToLogin}</Link>
        </Button>
      </div>
    </AuthPageShell>
  );
}
