import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const bible = fs.readFileSync(path.join(projectRoot, 'docs', 'BUYER_EXPERIENCE_BIBLE.md'), 'utf8');
const implementation = [
  'src/features/storefront/components/BuyerDecisionPassport.tsx',
  'src/features/storefront/components/BuyerNeedFinder.tsx',
  'src/features/storefront/components/ProductComparisonLedger.tsx',
  'src/features/storefront/components/OrderSuccessPage.tsx',
]
  .map((relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'))
  .join('\n');

describe('canonical buyer experience bible', () => {
  it('keeps exactly 20 stable buyer-pain contracts', () => {
    const ids = [...bible.matchAll(/^### (TN-BX-\d{2}):/gm)].map((match) => match[1]);

    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    expect(ids).toEqual(Array.from({ length: 20 }, (_, index) => `TN-BX-${String(index + 1).padStart(2, '0')}`));
  });

  it('defines a UI response, truth boundary, dependency, and acceptance for every pain', () => {
    const sections = bible.split(/^### TN-BX-\d{2}:/gm).slice(1);

    for (const section of sections) {
      expect(section).toContain('- UI response:');
      expect(section).toContain('- Truth boundary:');
      expect(section).toContain('- Operational dependency:');
      expect(section).toContain('- Acceptance:');
    }
  });

  it('maps every new pain to a rendered buyer surface', () => {
    for (let number = 11; number <= 20; number += 1) {
      expect(implementation).toContain(`TN-BX-${number}`);
    }
  });

  it('keeps unsupported marketplace claims in the banned-claims gate', () => {
    expect(bible).toContain('`Best price`');
    expect(bible).toContain('`Guaranteed compatibility`');
    expect(bible).toContain('`Free returns`');
    expect(bible).toContain('A support response window without measured operations');
  });
});
