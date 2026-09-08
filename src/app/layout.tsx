import { headers } from 'next/headers';
import type { Metadata, Viewport } from 'next';
import type React from 'react';

import { Providers } from './providers';
import { getRequestCopy, getRequestLocale } from '@/i18n/server';
import { publisherJsonLd, SITE_URL } from '@/lib/seo/metadata';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();

  return {
    title: copy.metadata.root.title,
    description: copy.metadata.root.description,
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: [{ url: '/storefront/bold-discovery/favicon.svg', type: 'image/svg+xml' }],
      shortcut: '/storefront/bold-discovery/favicon.svg',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  // Read the per-request nonce set by middleware. next-themes injects an inline
  // anti-FOUC <script> via dangerouslySetInnerHTML that Next does NOT auto-nonce,
  // so under our 'strict-dynamic' CSP it must be passed the nonce explicitly or
  // the browser refuses it (causing a flash / hydration mismatch).
  const requestHeaders = await headers();
  const nonce = requestHeaders.get('x-nonce') ?? undefined;
  const locale = await getRequestLocale();

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script
          nonce={nonce}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(publisherJsonLd) }}
        />
        <Providers nonce={nonce} locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
