'use client';

import type React from 'react';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocaleCopy } from '@/i18n/context';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  const copy = useLocaleCopy();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h2 className="mb-2 text-2xl font-bold">{copy.errors.globalTitle}</h2>
      <p className="mb-4 text-muted-foreground">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : copy.errors.globalDescription}
      </p>
      <Button onClick={reset}>{copy.errors.retry}</Button>
    </div>
  );
}
