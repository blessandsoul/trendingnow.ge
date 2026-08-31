import type { Metadata } from 'next';
import type React from 'react';
import { Heart, PackageCheck, ShoppingBag } from 'lucide-react';

import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getRequestCopy } from '@/i18n/server';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return buildPrivateMetadata(copy.metadata.login);
}

export default async function LoginPage(): Promise<React.ReactElement> {
  const copy = await getRequestCopy();

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
