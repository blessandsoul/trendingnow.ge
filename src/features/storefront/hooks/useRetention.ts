'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  idsFromCompareEntries,
  parseStoredIds,
  parseStoredCompareEntries,
  readCompareEntries,
  readSavedIds,
  RETENTION_EVENT,
  RETENTION_STORAGE_KEYS,
  getRetentionStorageMode,
  type CompareEntry,
  writeCompareEntries,
  writeSavedIds,
  type RetentionStorageMode,
} from '../lib/retention-storage';

type RetentionKind = 'saved' | 'compare';

function readIdsFromEvent(kind: RetentionKind, event: StorageEvent): string[] | null {
  if (event.key !== RETENTION_STORAGE_KEYS[kind]) return null;
  if (kind === 'saved') {
    return parseStoredIds(event.newValue);
  }
  return idsFromCompareEntries(parseStoredCompareEntries(event.newValue));
}

export function useSavedSelection() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageMode, setStorageMode] = useState<RetentionStorageMode>('persistent');

  useEffect(() => {
    const refresh = (): void => {
      setIds(readSavedIds());
      setStorageMode(getRetentionStorageMode('saved'));
      setHydrated(true);
    };
    const onStorage = (event: StorageEvent): void => {
      if (event.key === null) {
        refresh();
        return;
      }
      if (event.key !== RETENTION_STORAGE_KEYS.saved) return;
      try {
        setIds(readIdsFromEvent('saved', event) ?? []);
        setStorageMode(getRetentionStorageMode('saved'));
      } catch {
        setIds([]);
      }
    };
    const onRetentionChange = (event: Event): void => {
      if ((event as CustomEvent<{ kind?: RetentionKind }>).detail?.kind === 'saved') refresh();
    };

    refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(RETENTION_EVENT, onRetentionChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(RETENTION_EVENT, onRetentionChange);
    };
  }, []);

  const toggleSaved = useCallback((id: string): boolean => {
    const next = ids.includes(id) ? ids.filter((value) => value !== id) : [id, ...ids];
    setIds(writeSavedIds(next));
    setStorageMode(getRetentionStorageMode('saved'));
    return next.includes(id);
  }, [ids]);

  const removeSaved = useCallback((id: string): void => {
    setIds(writeSavedIds(ids.filter((value) => value !== id)));
    setStorageMode(getRetentionStorageMode('saved'));
  }, [ids]);

  const restoreSaved = useCallback((id: string): void => {
    if (!ids.includes(id)) { setIds(writeSavedIds([id, ...ids])); setStorageMode(getRetentionStorageMode('saved')); }
  }, [ids]);

  const clearSaved = useCallback((): void => {
    setIds(writeSavedIds([]));
    setStorageMode(getRetentionStorageMode('saved'));
  }, []);

  return { ids, hydrated, storageMode, toggleSaved, removeSaved, restoreSaved, clearSaved };
}

export function useCompareSelection() {
  const [entries, setEntries] = useState<CompareEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageMode, setStorageMode] = useState<RetentionStorageMode>('persistent');

  useEffect(() => {
    const refresh = (): void => {
      setEntries(readCompareEntries());
      setStorageMode(getRetentionStorageMode('compare'));
      setHydrated(true);
    };
    const onStorage = (event: StorageEvent): void => {
      if (event.key === null) {
        refresh();
        return;
      }
      if (event.key !== RETENTION_STORAGE_KEYS.compare) return;
      setEntries(parseStoredCompareEntries(event.newValue));
      setStorageMode(getRetentionStorageMode('compare'));
    };
    const onRetentionChange = (event: Event): void => {
      if ((event as CustomEvent<{ kind?: RetentionKind }>).detail?.kind === 'compare') refresh();
    };

    refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(RETENTION_EVENT, onRetentionChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(RETENTION_EVENT, onRetentionChange);
    };
  }, []);

  const toggleCompare = useCallback((entry: CompareEntry): 'added' | 'removed' | 'different-category' | 'different-type' | 'full' => {
    const existing = entries.find((candidate) => candidate.id === entry.id);
    if (existing) {
      setEntries(writeCompareEntries(entries.filter((candidate) => candidate.id !== entry.id)));
      setStorageMode(getRetentionStorageMode('compare'));
      return 'removed';
    }
    if (entries.length >= 3) return 'full';
    if (!entry.comparisonKey) return 'different-type';
    if (entries.length > 0 && entries.some((candidate) => !candidate.categoryKey || !entry.categoryKey || candidate.categoryKey !== entry.categoryKey)) {
      return 'different-category';
    }
    if (entries.length > 0 && entries.some((candidate) => !candidate.comparisonKey || candidate.comparisonKey !== entry.comparisonKey)) {
      return 'different-type';
    }
    setEntries(writeCompareEntries([...entries, entry]));
    setStorageMode(getRetentionStorageMode('compare'));
    return 'added';
  }, [entries]);

  const removeCompare = useCallback((id: string): void => {
    setEntries(writeCompareEntries(entries.filter((entry) => entry.id !== id)));
    setStorageMode(getRetentionStorageMode('compare'));
  }, [entries]);

  const clearCompare = useCallback((): void => {
    setEntries(writeCompareEntries([]));
    setStorageMode(getRetentionStorageMode('compare'));
  }, []);

  return {
    entries,
    ids: idsFromCompareEntries(entries),
    hydrated,
    storageMode,
    toggleCompare,
    removeCompare,
    clearCompare,
  };
}
