import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';

/** One request-scoped server snapshot, passed unchanged through hydration. */
export const getDiscoverySnapshotTime = cache(async (): Promise<number> => {
  await headers();
  return Date.now();
});
