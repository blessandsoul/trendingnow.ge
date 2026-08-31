import type { Metadata } from 'next';

import { buildInfoPageMetadata, InfoPageRoute } from '@/features/storefront/pages/InfoPageRoute';

export function generateMetadata(): Promise<Metadata> {
  return buildInfoPageMetadata('contact');
}

export default function ContactPage() {
  return <InfoPageRoute pageKey="contact" />;
}
