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
    <aside className="my-10 rounded-[8px] border border-[#DFE6EF] bg-[#FAFBFC] p-6 md:p-8">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#8B96A5]">{copy.productCtaEyebrow}</p>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="mb-2 text-xl font-black tracking-tight text-[#07152A]">{copy.productCtaTitle}</h2>
          <p className="text-sm leading-6 text-[#526071]">{copy.productCtaBody}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={href} className="rounded-[7px] bg-[#FDC302] px-5 py-2.5 text-sm font-black text-[#07152A] transition-colors hover:bg-[#F2B900]">
            {copy.productCtaButton}
          </Link>
          <Link href="/products" className="rounded-[7px] border border-[#DFE6EF] bg-white px-5 py-2.5 text-sm font-bold text-[#07152A] transition-colors hover:border-[#C89300]">
            {copy.productCtaSecondary}
          </Link>
        </div>
      </div>
    </aside>
  );
}
