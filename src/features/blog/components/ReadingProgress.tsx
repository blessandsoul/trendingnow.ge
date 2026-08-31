'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

export function ReadingProgress(): React.ReactElement {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = (): void => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[60] h-[3px] bg-linear-to-r from-[#FDC302] via-[#174A98] to-[#07152A] transition-[width] duration-150 ease-out"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
