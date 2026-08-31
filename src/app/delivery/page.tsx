import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('delivery');
}

export default function DeliveryPage() {
  return <InfoPageRoute pageKey="delivery" />;
}
