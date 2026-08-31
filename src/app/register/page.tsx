import type { Metadata } from 'next';
import type React from 'react';
import { Heart, LifeBuoy, PackageCheck } from 'lucide-react';

import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { getRequestCopy } from '@/i18n/server';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return buildPrivateMetadata(copy.metadata.register);
}

export default async function RegisterPage(): Promise<React.ReactElement> {
  const copy = await getRequestCopy();

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
