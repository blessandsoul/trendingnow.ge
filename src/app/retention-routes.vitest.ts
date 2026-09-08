import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(path.join(process.cwd(), 'src/app/[locale]/[[...segments]]/page.tsx'), 'utf8');

describe('guest retention localized routes', () => {
  it('routes saved and compare through the same locale catch-all', () => {
    expect(source).toContain("segments[0] === 'saved'");
    expect(source).toContain("segments[0] === 'compare'");
    expect(source).toContain('<SavedCollectionPage />');
    expect(source).toContain('<CompareCollectionPage />');
  });
});
