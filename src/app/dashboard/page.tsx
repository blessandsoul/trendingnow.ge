import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getRequestCopy } from '@/i18n/server';
import { ROUTES } from '@/lib/constants/routes';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return copy.metadata.dashboard;
}

export default function DashboardPage(): never {
  redirect(ROUTES.DASHBOARD_FAVORITES);
}
