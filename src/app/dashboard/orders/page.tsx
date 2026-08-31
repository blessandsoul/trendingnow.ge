import type React from 'react';
import type { Metadata } from 'next';

import { OrdersDashboard } from '@/features/storefront/components/OrdersDashboard';
import { getRequestCopy } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getRequestCopy();
  return copy.metadata.dashboard;
}

export default function DashboardOrdersPage(): React.ReactElement {
  return <OrdersDashboard />;
}
