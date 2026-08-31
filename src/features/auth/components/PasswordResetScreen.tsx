'use client';

import type React from 'react';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { useForgotPassword, useResetPassword } from '../hooks/usePasswordReset';

const fieldClass =
  'tn-field h-12 px-4 text-[#11141B] placeholder:text-[#8B93A1]';

function PasswordResetInner(): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { forgotPassword, isPending: isSending } = useForgotPassword();
  const { resetPassword, isPending: isResetting } = useResetPassword();

  if (token) {
    return (
      <form
        className="w-full space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          resetPassword({ token, newPassword });
        }}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-[-0.035em] text-[#11141B]">{copy.auth.reset.newPasswordTitle}</h1>
          <p className="text-sm leading-6 text-[#69717E]">
            {copy.auth.reset.newPasswordDescription}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="font-bold text-[#11141B]">{copy.auth.fields.newPassword}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder={copy.auth.fields.passwordMinPlaceholder}
            autoComplete="new-password"
            required
            className={fieldClass}
          />
        </div>
        <Button
          type="submit"
          className="tn-primary-action h-12 w-full font-black transition active:translate-y-px"
          disabled={isResetting || newPassword.length < 8}
        >
          {isResetting && <Loader2 className="size-4 animate-spin" />}
          {copy.auth.reset.changePassword}
        </Button>
      </form>
    );
  }

  return (
    <form
      className="w-full space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        forgotPassword(email);
      }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.035em] text-[#11141B]">{copy.auth.reset.requestTitle}</h1>
        <p className="text-sm leading-6 text-[#69717E]">
          {copy.auth.reset.requestDescription}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="font-bold text-[#11141B]">{copy.auth.fields.email}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.auth.fields.emailPlaceholder}
          autoComplete="email"
          required
          className={fieldClass}
        />
      </div>
      <Button
        type="submit"
        className="tn-primary-action h-12 w-full font-black transition active:translate-y-px"
        disabled={isSending}
      >
        {isSending && <Loader2 className="size-4 animate-spin" />}
        {copy.auth.reset.sendLink}
      </Button>
      <p className="text-center text-sm text-[#69717E]">
        {copy.auth.reset.remembered}{' '}
        <Link href={localizeHref(ROUTES.LOGIN)} className="font-bold text-[#6D3AE8] hover:text-[#FF4057]">
          {copy.auth.reset.login}
        </Link>
      </p>
    </form>
  );
}

export function PasswordResetScreen(): React.ReactElement {
  return (
    <Suspense fallback={<div className="h-[260px] animate-pulse rounded-[16px] bg-[#F1F2F6]" />}>
      <PasswordResetInner />
    </Suspense>
  );
}
