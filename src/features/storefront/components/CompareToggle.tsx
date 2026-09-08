'use client';

import type React from 'react';
import { GitCompareArrows } from 'lucide-react';

import { useLocale } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { useCompareSelection } from '../hooks/useRetention';

export interface CompareToggleProps {
  productId: string;
  categoryKey: string;
  comparisonKey: string;
  productName?: string;
  className?: string;
}

const labels = {
  ka: { add: 'შედარებაში დამატება', remove: 'შედარებიდან წაშლა', full: 'შედარება უკვე სამ ნივთს შეიცავს', different: 'სხვადასხვა კატეგორიის ნივთებს ვერ შევადარებთ' },
  en: { add: 'Add to compare', remove: 'Remove from compare', full: 'Compare already has three items', different: 'Items from different categories cannot be compared' },
  ru: { add: 'Добавить к сравнению', remove: 'Убрать из сравнения', full: 'В сравнении уже три товара', different: 'Товары из разных категорий нельзя сравнить' },
} as const;

/** Comparison is intentionally constrained to one category and at most three exact IDs. */
export function CompareToggle({ productId, categoryKey, comparisonKey, productName, className }: CompareToggleProps): React.ReactElement {
  const { entries, hydrated, toggleCompare } = useCompareSelection();
  const locale = useLocale();
  const selected = entries.some((entry) => entry.id === productId);
  const label = labels[locale];
  const blockedByCategory = !selected && entries.length > 0 && entries.some((entry) => !entry.categoryKey || entry.categoryKey !== categoryKey);
  const blockedByType = !selected && (!comparisonKey || (entries.length > 0 && entries.some((entry) => !entry.comparisonKey || entry.comparisonKey !== comparisonKey)));
  const blockedByLimit = !selected && entries.length >= 3;
  const ariaLabel = selected ? label.remove : blockedByCategory ? label.different : blockedByType ? label.different : blockedByLimit ? label.full : label.add;

  return (
    <button
      type="button"
      className={cn('grid size-11 place-items-center border border-black/20 bg-white/95 text-[#657080] transition-colors hover:bg-[#FFE622] hover:text-[#092BB4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#092BB4] disabled:cursor-not-allowed disabled:opacity-50', selected && 'bg-[#FFE622] text-[#092BB4]', className)}
      aria-label={`${ariaLabel}${productName ? `: ${productName}` : ''}`}
      aria-pressed={selected}
      aria-busy={!hydrated}
      disabled={!hydrated || blockedByCategory || blockedByType || blockedByLimit}
      onClick={() => toggleCompare({ id: productId, categoryKey, comparisonKey })}
      title={ariaLabel}
    >
      <GitCompareArrows className="size-5" aria-hidden="true" />
    </button>
  );
}
