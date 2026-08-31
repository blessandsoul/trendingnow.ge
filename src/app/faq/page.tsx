import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('faq');
}

export default function FaqPage() {
  return <InfoPageRoute pageKey="faq" />;
}
