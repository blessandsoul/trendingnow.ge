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
  it('keeps the supplied PNG archived and uses the approved live-text Bold Discovery wordmark', () => {
    const componentPath = path.join(
      process.cwd(),
      'src/features/storefront/components/TrendingNowWordmark.tsx',
    );
    const componentSource = fs.readFileSync(componentPath, 'utf8');
    const markPath = path.join(
      process.cwd(),
      'public/storefront/trendingnow/logo-mark-user-v1.png',
    );
    const mark = fs.readFileSync(markPath);

    expect(componentSource).toContain('/storefront/trendingnow/logo-mark-user-v1.png');
    expect(componentSource).toContain('Trending');
    expect(componentSource).toContain('Now');
    expect(componentSource).toContain('.ge');
    expect(componentSource).not.toContain('logo-v2.png');
    expect(componentSource).toContain('data-logo-version="bold-discovery"');
    expect(componentSource).toContain('Discovery_Anton');
    expect(mark.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(mark.readUInt32BE(16)).toBe(1254);
    expect(mark.readUInt32BE(20)).toBe(1254);
    expect(mark[25]).toBe(6);
  });

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

  it('keeps commerce typography and accents inside the current hierarchy', () => {
    const bannedTokens = [
      'font-black',
      'font-extrabold',
      '#8C5CF6',
      '#F8F5FF',
      '#E8E0F8',
      '#24183E',
      '#4A194C',
      '124 58 237',
      '#6D3AE8',
      '#5B2DB6',
      '#F7F2FF',
      '#D9C7FF',
      '#DCCEFF',
      '#BFA4FF',
    ];
    const sourceRoot = path.join(process.cwd(), 'src');
    const violations: string[] = [];

    for (const relativeRoot of roots) {
      for (const filePath of activeUiFiles(path.join(sourceRoot, relativeRoot))) {
        const source = fs.readFileSync(filePath, 'utf8');
        for (const token of bannedTokens) {
          // The owner explicitly selected heavy Georgian display typography for
          // Bold Discovery. Preserve the original commerce guard everywhere else.
          if (path.basename(filePath) === 'BoldDiscoveryHome.tsx'
            && (token === 'font-black' || token === 'font-extrabold')) continue;
          if (source.toLowerCase().includes(token.toLowerCase())) {
            violations.push(`${path.relative(process.cwd(), filePath)}: ${token}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
