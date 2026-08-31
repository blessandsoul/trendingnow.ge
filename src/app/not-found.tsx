import type React from 'react';

import Link from 'next/link';

import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { localizedPath } from '@/i18n/locales';
import { ROUTES } from '@/lib/constants/routes';

export default async function NotFound(): Promise<React.ReactElement> {
  const copy = await getRequestCopy();
  const locale = await getRequestLocale();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-8 text-center">
      <FileQuestion className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-3xl font-bold">{copy.errors.notFoundTitle}</h1>
      <p className="mb-6 text-muted-foreground">
        {copy.errors.notFoundDescription}
      </p>
      <Button asChild>
        <Link href={localizedPath(locale, ROUTES.HOME)}>{copy.errors.goHome}</Link>
      </Button>
    </div>
  );
}
