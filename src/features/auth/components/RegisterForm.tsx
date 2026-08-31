'use client';

import type React from 'react';
import { useMemo } from 'react';

import Link from 'next/link';
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
import { useAuth } from '../hooks/useAuth';

function createRegisterSchema(copy: AppCopy) {
  return z
    .object({
    firstName: z.string().min(1, copy.auth.validation.firstNameRequired).max(50, copy.auth.validation.firstNameTooLong),
    lastName: z.string().min(1, copy.auth.validation.lastNameRequired).max(50, copy.auth.validation.lastNameTooLong),
    email: z.string().min(1, copy.auth.validation.emailRequired).email(copy.auth.validation.emailInvalid),
    password: z
      .string()
      .min(8, copy.auth.validation.passwordMin)
      .regex(/[A-Z]/, copy.auth.validation.passwordUppercase)
      .regex(/[a-z]/, copy.auth.validation.passwordLowercase)
      .regex(/[0-9]/, copy.auth.validation.passwordNumber),
    confirmPassword: z.string().min(1, copy.auth.validation.confirmPasswordRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: copy.auth.validation.passwordsMismatch,
    path: ['confirmPassword'],
  });
}

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

const fieldClass =
  'tn-field h-12 px-4 text-[#11141B] placeholder:text-[#8B93A1]';

export const RegisterForm = (): React.ReactElement => {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { register: registerUser, isRegistering } = useAuth();
  const registerSchema = useMemo(() => createRegisterSchema(copy), [copy]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData): void => {
    registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.035em] text-[#11141B]">{copy.auth.register.title}</h1>
        <p className="text-sm leading-6 text-[#69717E]">
          {copy.auth.register.description}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-bold text-[#11141B]">{copy.auth.fields.firstName}</Label>
            <Input
              id="firstName"
              placeholder={copy.auth.fields.firstNamePlaceholder}
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              {...register('firstName')}
              className={cn(fieldClass, errors.firstName && 'border-destructive bg-white')}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-bold text-[#11141B]">{copy.auth.fields.lastName}</Label>
            <Input
              id="lastName"
              placeholder={copy.auth.fields.lastNamePlaceholder}
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              {...register('lastName')}
              className={cn(fieldClass, errors.lastName && 'border-destructive bg-white')}
            />
            {errors.lastName && (
              <p id="lastName-error" className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-bold text-[#11141B]">{copy.auth.fields.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder={copy.auth.fields.emailPlaceholder}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            {...register('email')}
            className={cn(fieldClass, errors.email && 'border-destructive bg-white')}
          />
          {errors.email && (
            <p id="reg-email-error" className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-bold text-[#11141B]">{copy.auth.fields.password}</Label>
          <Input
            id="password"
            type="password"
            placeholder={copy.auth.fields.passwordMinPlaceholder}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'reg-password-error' : undefined}
            {...register('password')}
            className={cn(fieldClass, errors.password && 'border-destructive bg-white')}
          />
          {errors.password && (
            <p id="reg-password-error" className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-bold text-[#11141B]">{copy.auth.fields.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={copy.auth.fields.confirmPasswordPlaceholder}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
            className={cn(fieldClass, errors.confirmPassword && 'border-destructive bg-white')}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="tn-primary-action h-12 w-full font-black transition active:translate-y-px"
          disabled={isRegistering}
        >
          {isRegistering ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {copy.auth.register.submitting}
            </>
          ) : (
            copy.auth.register.submit
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[#69717E]">
        {copy.auth.register.hasAccount}{' '}
        <Link
          href={localizeHref(ROUTES.LOGIN)}
          className="font-bold text-[#6D3AE8] transition-colors active:text-[#FF4057] md:hover:text-[#FF4057]"
        >
          {copy.auth.register.login}
        </Link>
      </p>
    </div>
  );
};
