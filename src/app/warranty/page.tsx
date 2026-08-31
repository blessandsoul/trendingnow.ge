import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('warranty');
}

export default function WarrantyPage() {
  return <InfoPageRoute pageKey="warranty" />;
}
