'use client';

import type React from 'react';
import { Suspense, useMemo } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type AppCopy } from '@/i18n/copy';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { normalizeAppRedirectPath } from '../lib/redirects';
import { useAuth } from '../hooks/useAuth';

function createLoginSchema(copy: AppCopy) {
  return z.object({
  email: z.string().min(1, copy.auth.validation.emailRequired).email(copy.auth.validation.emailInvalid),
  password: z.string().min(1, copy.auth.validation.passwordRequired),
  });
}

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

const fieldClass =
  'tn-field h-12 px-4 text-[#101010] placeholder:text-[#8B93A1]';

const LoginFormInner = (): React.ReactElement => {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { login, isLoggingIn } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const redirectTo = normalizeAppRedirectPath(from);
  const loginSchema = useMemo(() => createLoginSchema(copy), [copy]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData): void => {
    login(data, redirectTo ?? ROUTES.DASHBOARD_FAVORITES);
  };

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#101010]">{copy.auth.login.title}</h1>
        <p className="text-sm leading-6 text-[#69717E]">
          {copy.auth.login.description}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-[#101010]">{copy.auth.fields.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder={copy.auth.fields.emailPlaceholder}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
            className={cn(fieldClass, errors.email && 'border-destructive bg-white')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-semibold text-[#101010]">{copy.auth.fields.password}</Label>
          <Input
            id="password"
            type="password"
            placeholder={copy.auth.fields.passwordPlaceholder}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
            className={cn(fieldClass, errors.password && 'border-destructive bg-white')}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="tn-primary-action h-12 w-full font-semibold"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {copy.auth.login.submitting}
            </>
          ) : (
            copy.auth.login.submit
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link
          href={localizeHref(ROUTES.RESET_PASSWORD)}
          className="font-semibold text-[#061E81] transition-colors hover:text-[#092BB4]"
        >
          {copy.auth.login.forgotPassword}
        </Link>
      </div>

      <p className="text-center text-sm text-[#69717E]">
        {copy.auth.login.noAccount}{' '}
        <Link
          href={localizeHref(ROUTES.REGISTER)}
          className="font-semibold text-[#061E81] transition-colors hover:text-[#092BB4]"
        >
          {copy.auth.login.register}
        </Link>
      </p>
    </div>
  );
};

export const LoginForm = (): React.ReactElement => {
  return (
    <Suspense fallback={<div className="h-[340px] animate-pulse rounded-[16px] bg-[#F1F2F6]" />}>
      <LoginFormInner />
    </Suspense>
  );
};
