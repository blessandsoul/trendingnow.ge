export type CompareEntry = {
  id: string;
  categoryKey: string;
  comparisonKey: string;
};

export const RETENTION_STORAGE_KEYS = {
  saved: 'trendingnow:saved-products:v1',
  compare: 'trendingnow:compare-products:v1',
} as const;

export const RETENTION_EVENT = 'trendingnow:retention-change';

type RetentionKind = keyof typeof RETENTION_STORAGE_KEYS;
export type RetentionStorageMode = 'persistent' | 'session';

const memoryState: Record<RetentionKind, string | null> = {
  saved: null,
  compare: null,
};
const fallbackOnly: Record<RetentionKind, boolean> = { saved: false, compare: false };

function normalizedId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return id ? id : null;
}

export function parseStoredIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map(normalizedId).filter((id): id is string => Boolean(id)))];
  } catch {
    return [];
  }
}

export function parseStoredCompareEntries(raw: string | null): CompareEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const entries = parsed.flatMap((value): CompareEntry[] => {
      if (typeof value === 'string') {
        const id = normalizedId(value);
        return id ? [{ id, categoryKey: '', comparisonKey: '' }] : [];
      }
      if (!value || typeof value !== 'object') return [];
      const record = value as { id?: unknown; categoryKey?: unknown };
      const id = normalizedId(record.id);
      const categoryKey = normalizedId(record.categoryKey) ?? '';
      const comparisonKey = normalizedId((record as { comparisonKey?: unknown }).comparisonKey) ?? '';
      return id ? [{ id, categoryKey, comparisonKey }] : [];
    });

    const seen = new Set<string>();
    return entries.filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  } catch {
    return [];
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getRetentionStorageMode(kind: RetentionKind): RetentionStorageMode {
  return getBrowserStorage() && !fallbackOnly[kind] ? 'persistent' : 'session';
}

function readRaw(kind: RetentionKind): string | null {
  const storage = getBrowserStorage();
  if (!storage || fallbackOnly[kind]) return memoryState[kind];
  try {
    const value = storage.getItem(RETENTION_STORAGE_KEYS[kind]);
    memoryState[kind] = value;
    return value;
  } catch {
    return memoryState[kind];
  }
}

function writeRaw(kind: RetentionKind, value: string | null): boolean {
  memoryState[kind] = value;
  const storage = getBrowserStorage();
  if (!storage) return false;
  try {
    if (value === null) storage.removeItem(RETENTION_STORAGE_KEYS[kind]);
    else storage.setItem(RETENTION_STORAGE_KEYS[kind], value);
    fallbackOnly[kind] = false;
    return true;
  } catch {
    fallbackOnly[kind] = true;
    return false;
  }
}

function clearMalformed(kind: RetentionKind, raw: string | null, parsedLength: number): void {
  if (!raw) return;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || (value.length > 0 && parsedLength === 0)) {
      writeRaw(kind, null);
    }
  } catch {
    writeRaw(kind, null);
  }
}

export function readSavedIds(): string[] {
  const raw = readRaw('saved');
  const ids = parseStoredIds(raw);
  clearMalformed('saved', raw, ids.length);
  return ids;
}

export function readCompareEntries(): CompareEntry[] {
  const raw = readRaw('compare');
  const entries = parseStoredCompareEntries(raw);
  clearMalformed('compare', raw, entries.length);
  return entries;
}

function notify(kind: RetentionKind): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RETENTION_EVENT, { detail: { kind } }));
}

export function writeSavedIds(ids: readonly string[]): string[] {
  const normalized = [...new Set(ids.map(normalizedId).filter((id): id is string => Boolean(id)))];
  writeRaw('saved', JSON.stringify(normalized));
  notify('saved');
  return normalized;
}

export function writeCompareEntries(entries: readonly CompareEntry[]): CompareEntry[] {
  const seen = new Set<string>();
  const normalized = entries.flatMap((entry): CompareEntry[] => {
    const id = normalizedId(entry.id);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ id, categoryKey: normalizedId(entry.categoryKey) ?? '', comparisonKey: normalizedId(entry.comparisonKey) ?? '' }];
  });
  writeRaw('compare', JSON.stringify(normalized));
  notify('compare');
  return normalized;
}

export function idsFromCompareEntries(entries: readonly CompareEntry[]): string[] {
  return entries.map((entry) => entry.id);
}
