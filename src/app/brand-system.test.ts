import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const roots = ['app', 'components', 'features', 'i18n', 'styles'];
const extensions = new Set(['.css', '.ts', '.tsx']);

function activeUiFiles(root: string): string[] {
  const out: string[] = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const filePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...activeUiFiles(filePath));
      continue;
    }
    if (!extensions.has(path.extname(entry.name))) continue;
    if (entry.name.includes('.disabled-') || entry.name === 'brand-system.test.ts') continue;
    out.push(filePath);
  }

  return out;
}

describe('TrendingNow visual system', () => {
  it('keeps active UI free of the legacy Continuum skin', () => {
    const legacyTokens = [
      'Continuum GE',
      '#FDC302',
      '#F2B900',
      '#FFF7D7',
      '#FFF8D7',
      '#F6D98B',
      '#8A6500',
      '#8A6A00',
      '#C89300',
      '#FFE8AA',
      '#FFF3BF',
      '#FFE0A3',
      '#FFF9E6',
    ];
    const sourceRoot = path.join(process.cwd(), 'src');
    const violations: string[] = [];

    for (const relativeRoot of roots) {
      for (const filePath of activeUiFiles(path.join(sourceRoot, relativeRoot))) {
        const source = fs.readFileSync(filePath, 'utf8');
        for (const token of legacyTokens) {
          if (source.toLowerCase().includes(token.toLowerCase())) {
            violations.push(`${path.relative(process.cwd(), filePath)}: ${token}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
