import type React from 'react';
import type { Metadata } from 'next';

import { FavoritesDashboard } from '@/features/storefront/components/FavoritesDashboard';
import { getRequestCopy } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return copy.metadata.dashboard;
}

export default function DashboardFavoritesPage(): React.ReactElement {
  return <FavoritesDashboard />;
}
