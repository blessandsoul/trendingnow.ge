'use client';

import type React from 'react';
import { useState } from 'react';
import { PackageSearch } from 'lucide-react';

import { SafeImage } from '@/components/common/SafeImage';

/**
 * Renders the exact source product image without cropping. If a source becomes
 * unavailable, retain the cobalt frame and product placeholder instead of a
 * broken image or a lookalike asset.
 */
export function DiscoveryProductImage({
  src,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: {
  src: string | null;
  alt: string;
  sizes?: string;
}): React.ReactElement {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <div className="absolute inset-3 grid place-items-center overflow-hidden bg-white"><PackageSearch className="size-20 text-[#092BB4]" strokeWidth={1} aria-hidden="true" /></div>;
  }

  return (
    <div className="absolute inset-3 overflow-hidden bg-white">
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized
        className="object-contain p-2 sm:p-3"
        onError={() => setFailedSrc(src)}
      />
    </div>
  );
}
