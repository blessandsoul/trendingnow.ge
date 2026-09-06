import type React from 'react';
import Link from 'next/link';

import { getBlogCopy } from '../lib/copy';
import type { BlogLocale } from '../lib/locales';

interface ProductTarget {
  query: string;
  match: string[];
}

const PRODUCT_TARGETS: ProductTarget[] = [
  { query: 'headphones audio', match: ['audio', 'headphone', 'earbud', 'sound', 'speaker', 'აუდიო', 'ყურსასმენ', 'науш', 'аудио'] },
  { query: 'charger adapter power bank', match: ['charger', 'adapter', 'power', 'battery', 'დამტენ', 'ბატარეა', 'заряд', 'адаптер'] },
  { query: 'phone accessories case', match: ['phone', 'iphone', 'case', 'mobile', 'ტელეფონ', 'აქსესუარ', 'чехол', 'телефон'] },
  { query: 'smart watch', match: ['watch', 'wearable', 'smartwatch', 'საათი', 'часы'] },
  { query: 'projector', match: ['projector', 'cinema', 'projection', 'პროექტორ', 'проектор'] },
  { query: 'personal care', match: ['care', 'shaver', 'beauty', 'grooming', 'მოვლა', 'საპარს', 'уход'] },
];

function targetForTags(tags: string[]): ProductTarget {
  const haystack = tags.map((tag) => tag.toLowerCase());
  return PRODUCT_TARGETS.find((target) =>
    target.match.some((matcher) => haystack.some((tag) => tag.includes(matcher))),
  ) ?? { query: '', match: [] };
}

interface ProductCrossLinkProps {
  tags: string[];
  locale: BlogLocale;
}

export function ProductCrossLink({ tags, locale }: ProductCrossLinkProps): React.ReactElement {
  const copy = getBlogCopy(locale);
  const target = targetForTags(tags);
  const href = target.query ? `/products?search=${encodeURIComponent(target.query)}` : '/products';

  return (
    <aside className="tn-dark-panel my-10 p-6 shadow-[0_14px_38px_rgba(17,20,27,0.14)] md:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFE622]">{copy.productCtaEyebrow}</p>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-white">{copy.productCtaTitle}</h2>
          <p className="text-sm leading-6 text-white/70">{copy.productCtaBody}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={href} className="inline-flex min-h-11 items-center rounded-[12px] bg-[#092BB4] px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-[#061E81] active:scale-[0.96]">
            {copy.productCtaButton}
          </Link>
          <Link href="/products" className="inline-flex min-h-11 items-center rounded-[12px] border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20">
            {copy.productCtaSecondary}
          </Link>
        </div>
      </div>
    </aside>
  );
}
