'use client';

import type React from 'react';
import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';

import { store } from '@/store';
import { AuthInitializer } from '@/features/auth/components/AuthInitializer';
import { AppToaster } from '@/components/common/AppToaster';
import { LocaleProvider } from '@/i18n/context';
import type { ActiveLocale } from '@/i18n/locales';

export function Providers({
  children,
  nonce,
  locale,
}: {
  children: React.ReactNode;
  // Per-request CSP nonce from middleware (via the root layout). Forwarded to
  // next-themes so its inline anti-FOUC script is allowed under 'strict-dynamic'.
  nonce?: string;
  locale: ActiveLocale;
}): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            retry: 1,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableColorScheme={false}
          nonce={nonce}
        >
          <LocaleProvider locale={locale}>
            <AuthInitializer>
              {children}
            </AuthInitializer>
            <AppToaster />
          </LocaleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
