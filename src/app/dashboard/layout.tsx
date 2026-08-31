import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return children;
}
