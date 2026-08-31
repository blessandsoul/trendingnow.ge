import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('paymentMethods');
}

export default function PaymentMethodsPage() {
  return <InfoPageRoute pageKey="paymentMethods" />;
}
