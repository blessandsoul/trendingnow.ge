import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

describe('global page overflow', () => {
  it('wraps long text instead of relying on clipping to hide it', () => {
    expect(globalsCss).toMatch(/body\s*\{[^}]*overflow-wrap:\s*anywhere;/);
    expect(globalsCss).toContain(':where(h1, h2, h3, h4, h5, h6, p, li, dt, dd, label)');
  });
  it('clips horizontal overflow without creating a scroll container that breaks sticky children', () => {
    expect(globalsCss).toMatch(/html\s*\{[^}]*overflow-x:\s*clip;/);
    expect(globalsCss).toMatch(/body\s*\{[^}]*overflow-x:\s*clip;/);
  });
});
