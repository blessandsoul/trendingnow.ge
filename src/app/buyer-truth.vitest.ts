import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const sourceRoot = path.resolve(process.cwd(), 'src');
const publicCopyFiles = [
  'i18n/copy/ka.ts',
  'i18n/copy/ru.ts',
  'i18n/copy/en.ts',
  'features/storefront/components/StorefrontFooter.tsx',
  'features/storefront/components/AiImageMark.tsx',
  'features/storefront/components/BuyerDecisionPassport.tsx',
  'features/storefront/components/BuyerNeedFinder.tsx',
  'features/storefront/components/ProductCard.tsx',
  'features/storefront/components/ProductComparisonLedger.tsx',
  'features/storefront/components/ProductDetailStorefront.tsx',
  'features/storefront/components/CartStorefront.tsx',
];

const source = publicCopyFiles
  .map((relativePath) => fs.readFileSync(path.join(sourceRoot, relativePath), 'utf8'))
  .join('\n');

describe('buyer truth contract', () => {
  it('keeps confirmation-before-payment language on the main buying surfaces', () => {
    expect(source).toContain('გადახდამდე დაგიდასტურებთ');
    expect(source).toContain('Доступно под заказ');
    expect(source).toContain('Available to order');
  });

  it('does not publish unsupported fast-delivery or free-return promises', () => {
    expect(source).not.toContain('თბილისში 24 საათში');
    expect(source).not.toContain('Доставка 1-2 дня');
    expect(source).not.toContain('Delivery in 1-2 days');
    expect(source).not.toContain('უფასო დაბრუნება');
    expect(source).not.toContain('Бесплатный возврат');
    expect(source).not.toContain('Free returns');
  });

  it('marks AI product photos with a compact icon instead of repeated visible disclosure copy', () => {
    expect(source).toContain('role="img"');
    expect(source.match(/<AiImageMark/g)).toHaveLength(2);
    expect(source).not.toContain('AI ვიზუალი');
    expect(source).not.toContain('AI ვიზუალიზაცია');
  });
});
