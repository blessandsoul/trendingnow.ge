import { beforeEach, describe, expect, it } from 'vitest';

import {
  parseStoredCompareEntries,
  parseStoredIds,
  readSavedIds,
  RETENTION_STORAGE_KEYS,
  writeSavedIds,
} from './retention-storage';

describe('guest retention storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('normalizes exact IDs, removes duplicates, and ignores malformed values', () => {
    expect(parseStoredIds(JSON.stringify([' elite-6 ', 'elite-6', 42, null, '']))).toEqual(['elite-6']);
    expect(parseStoredIds('{broken')).toEqual([]);
    expect(parseStoredIds(JSON.stringify({ id: 'elite-6' }))).toEqual([]);
    expect(parseStoredCompareEntries(JSON.stringify([{ id: 'elite-6', categoryKey: 'kitchen' }, 'elite-7', {}]))).toEqual([
      { id: 'elite-6', categoryKey: 'kitchen', comparisonKey: '' },
      { id: 'elite-7', categoryKey: '', comparisonKey: '' },
    ]);
  });

  it('clears a malformed browser value without throwing', () => {
    window.localStorage.setItem(RETENTION_STORAGE_KEYS.saved, '{broken');
    expect(readSavedIds()).toEqual([]);
    expect(window.localStorage.getItem(RETENTION_STORAGE_KEYS.saved)).toBeNull();
  });

  it('writes only exact saved IDs and remains usable when localStorage writes fail', () => {
    expect(writeSavedIds(['elite-6', 'elite-6', ' pcshop-1 '])).toEqual(['elite-6', 'pcshop-1']);

    const originalSetItem = window.localStorage.setItem;
    Object.defineProperty(window.localStorage, 'setItem', { value: () => { throw new Error('quota'); } });
    expect(writeSavedIds(['elite-7'])).toEqual(['elite-7']);
    expect(readSavedIds()).toEqual(['elite-7']);
    Object.defineProperty(window.localStorage, 'setItem', { value: originalSetItem });
  });
});
