import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('corporateOffer');
}

export default function CorporateOfferPage() {
  return <InfoPageRoute pageKey="corporateOffer" />;
}
