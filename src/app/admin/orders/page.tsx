import type React from 'react';
import type { Metadata } from 'next';

import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Orders - Admin',
};

export default function AdminOrdersPage(): React.ReactElement {
  return <AdminDashboard />;
}
