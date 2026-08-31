'use client';

import type React from 'react';
import Link from 'next/link';
import { Heart, Loader2, LogOut, PackageCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLocaleCopy, useLocalizedPath } from '@/i18n/context';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';

interface DashboardTabsProps {
  active: 'favorites' | 'orders';
  className?: string;
}

export function DashboardTabs({ active, className }: DashboardTabsProps): React.ReactElement {
  const copy = useLocaleCopy();
  const localizeHref = useLocalizedPath();
  const { logout, isLoggingOut } = useAuth();
  const tabs = [
    { key: 'favorites' as const, label: copy.dashboard.favorites.title, href: ROUTES.DASHBOARD_FAVORITES, icon: Heart },
    { key: 'orders' as const, label: copy.dashboard.orders.title, href: ROUTES.DASHBOARD_ORDERS, icon: PackageCheck },
  ];

  return (
    <nav
      aria-label={copy.common.dashboard}
      className={cn('grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 rounded-[8px] border border-[#DFE6EF] bg-white p-2 shadow-[0_8px_24px_rgba(8,21,42,0.04)] sm:flex sm:flex-wrap', className)}
    >
      {tabs.map(({ key, label, href, icon: Icon }) => {
        const isActive = active === key;

        return (
          <Link
            key={key}
            href={localizeHref(href)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[7px] px-2 text-xs font-black leading-tight transition-colors sm:flex-none sm:gap-2 sm:px-4 sm:text-sm',
              isActive
                ? 'bg-[#07152A] text-white'
                : 'text-[#526071] hover:bg-[#F7F9FB] hover:text-[#07152A]',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{label}</span>
          </Link>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-[7px] border-[#DFE6EF] bg-white text-[#07152A] hover:bg-[#FFF5F5] hover:text-[#B42318] sm:ml-auto"
        disabled={isLoggingOut}
        onClick={() => void logout()}
        aria-label={copy.common.signOut}
        title={copy.common.signOut}
      >
        {isLoggingOut ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
      </Button>
    </nav>
  );
}
