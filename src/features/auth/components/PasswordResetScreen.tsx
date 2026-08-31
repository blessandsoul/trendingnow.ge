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
  'h-11 rounded-[7px] border-[#D7DFEA] bg-[#FAFBFC] text-[#07152A] placeholder:text-[#8B96A5] focus-visible:ring-[#FDC302]/45';

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
          <h1 className="text-2xl font-black tracking-tight text-[#07152A]">{copy.auth.reset.newPasswordTitle}</h1>
          <p className="text-sm leading-6 text-[#6B7685]">
            {copy.auth.reset.newPasswordDescription}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-[#07152A]">{copy.auth.fields.newPassword}</Label>
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
          className="h-11 w-full rounded-[7px] bg-[#FDC302] font-black text-[#07152A] shadow-[0_10px_24px_rgba(253,195,2,0.2)] transition duration-150 active:translate-y-px md:hover:bg-[#F2B900]"
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
        <h1 className="text-2xl font-black tracking-tight text-[#07152A]">{copy.auth.reset.requestTitle}</h1>
        <p className="text-sm leading-6 text-[#6B7685]">
          {copy.auth.reset.requestDescription}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#07152A]">{copy.auth.fields.email}</Label>
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
        className="h-11 w-full rounded-[7px] bg-[#FDC302] font-black text-[#07152A] shadow-[0_10px_24px_rgba(253,195,2,0.2)] transition duration-150 active:translate-y-px md:hover:bg-[#F2B900]"
        disabled={isSending}
      >
        {isSending && <Loader2 className="size-4 animate-spin" />}
        {copy.auth.reset.sendLink}
      </Button>
      <p className="text-center text-sm text-[#6B7685]">
        {copy.auth.reset.remembered}{' '}
        <Link href={localizeHref(ROUTES.LOGIN)} className="font-bold text-[#8A6A00] hover:text-[#07152A]">
          {copy.auth.reset.login}
        </Link>
      </p>
    </form>
  );
}

export function PasswordResetScreen(): React.ReactElement {
  return (
    <Suspense fallback={<div className="h-[260px] animate-pulse rounded-[8px] bg-[#F4F6F8]" />}>
      <PasswordResetInner />
    </Suspense>
  );
}
