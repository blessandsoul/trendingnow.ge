'use client';

import type React from 'react';

import { useLocaleCopy } from '@/i18n/context';
import { APP_NAME } from '@/lib/constants/app.constants';

export const Footer = (): React.ReactElement => {
  const copy = useLocaleCopy();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto flex items-center justify-center px-4 py-6 md:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {year} {APP_NAME}. {copy.common.allRightsReserved}
        </p>
      </div>
    </footer>
  );
};
