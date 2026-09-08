'use client';

import type React from 'react';
import { Heart } from 'lucide-react';

import { useLocale } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { useSavedSelection } from '../hooks/useRetention';

export interface SavedToggleProps {
  productId: string;
  productName?: string;
  className?: string;
}

const labels = {
  ka: { add: 'შენახვა', remove: 'შენახულიდან წაშლა' },
  en: { add: 'Save product', remove: 'Remove from saved' },
  ru: { add: 'Сохранить', remove: 'Удалить из сохранённых' },
} as const;

/** A storage-only guest control. It never implies account sync or merchant state. */
export function SavedToggle({ productId, productName, className }: SavedToggleProps): React.ReactElement {
  const { ids, hydrated, toggleSaved } = useSavedSelection();
  const locale = useLocale();
  const saved = ids.includes(productId);
  const label = labels[locale];

  return (
    <button
      type="button"
      className={cn('grid size-11 place-items-center border border-black/20 bg-white/95 text-[#657080] transition-colors hover:bg-[#FFE622] hover:text-[#092BB4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4] disabled:cursor-wait disabled:opacity-60', saved && 'text-[#092BB4]', className)}
      aria-label={`${saved ? label.remove : label.add}${productName ? `: ${productName}` : ''}`}
      aria-pressed={saved}
      aria-busy={!hydrated}
      disabled={!hydrated}
      onClick={() => toggleSaved(productId)}
      title={saved ? label.remove : label.add}
    >
      <Heart className={cn('size-5', saved && 'fill-current')} aria-hidden="true" />
    </button>
  );
}
