import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('aboutUs');
}

export default function AboutUsPage() {
  return <InfoPageRoute pageKey="aboutUs" />;
}
