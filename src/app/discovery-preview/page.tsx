import type { Metadata } from 'next';
import { DiscoveryPilot } from '@/features/storefront/components/DiscoveryPilot';
import { getDiscoverySnapshotTime } from '@/features/storefront/lib/discovery-clock';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Discovery pilot | TrendingNow.ge', robots: { index: false, follow: false } };

export default async function DiscoveryPreviewPage() {
  return <DiscoveryPilot now={await getDiscoverySnapshotTime()} />;
}
