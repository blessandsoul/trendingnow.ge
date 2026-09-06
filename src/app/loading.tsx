import type React from 'react';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function Loading(): React.ReactElement {
  return (
    <div className="tn-page flex min-h-dvh items-center justify-center px-5">
      <div className="tn-commerce-card flex items-center gap-3 px-6 py-5 text-sm font-semibold text-[#526071]">
        <LoadingSpinner size="lg" />
        TrendingNow.ge
      </div>
    </div>
  );
}
