import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

describe('global page overflow', () => {
  it('clips horizontal overflow without creating a scroll container that breaks sticky children', () => {
    expect(globalsCss).toMatch(/html\s*\{[^}]*overflow-x:\s*clip;/);
    expect(globalsCss).toMatch(/body\s*\{[^}]*overflow-x:\s*clip;/);
  });
});
