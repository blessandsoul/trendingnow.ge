'use client';

import type React from 'react';
import { useCallback } from 'react';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

import { useLocaleCopy } from '@/i18n/context';
import { cn } from '@/lib/utils';

export function ThemeToggle(): React.ReactElement {
  const copy = useLocaleCopy();
  const { theme, setTheme } = useTheme();

  const selectLight = useCallback((): void => {
    setTheme('light');
  }, [setTheme]);

  const selectDark = useCallback((): void => {
    setTheme('dark');
  }, [setTheme]);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {copy.common.appearance}
      </p>
      <div className="flex gap-2 rounded-xl border border-border/50 bg-muted/50 p-1.5 transition-none">
        <button
          type="button"
          onClick={selectLight}
          aria-label={copy.common.switchToLightMode}
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-200 active:scale-[0.97]',
            theme !== 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground md:hover:text-foreground',
          )}
        >
          <Sun className="h-4 w-4" />
          {copy.common.lightMode}
        </button>
        <button
          type="button"
          onClick={selectDark}
          aria-label={copy.common.switchToDarkMode}
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-200 active:scale-[0.97]',
            theme === 'dark'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground md:hover:text-foreground',
          )}
        >
          <Moon className="h-4 w-4" />
          {copy.common.darkMode}
        </button>
      </div>
    </div>
  );
}
