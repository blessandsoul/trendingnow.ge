import type { Metadata } from 'next';
import type React from 'react';
import { KeyRound, MailCheck, ShieldCheck } from 'lucide-react';

import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { PasswordResetScreen } from '@/features/auth/components/PasswordResetScreen';
import { getRequestCopy } from '@/i18n/server';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return buildPrivateMetadata(copy.metadata.resetPassword);
}

export default async function ResetPasswordPage(): Promise<React.ReactElement> {
  const copy = await getRequestCopy();

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
