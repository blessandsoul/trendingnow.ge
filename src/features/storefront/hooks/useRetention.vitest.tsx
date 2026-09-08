import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCompareSelection, useSavedSelection } from './useRetention';
import { RETENTION_STORAGE_KEYS } from '../lib/retention-storage';

function RetentionHarness() {
  const saved = useSavedSelection();
  const compare = useCompareSelection();

  return (
    <div>
      <output data-testid="saved">{saved.ids.join(',')}</output>
      <output data-testid="compare">{compare.ids.join(',')}</output>
      <output data-testid="saved-mode">{saved.storageMode}</output>
      <output data-testid="compare-mode">{compare.storageMode}</output>
    </div>
  );
}

describe('useRetention storage events', () => {
  beforeEach(() => window.localStorage.clear());

  it('sanitizes malformed saved events without throwing', async () => {
    render(<RetentionHarness />);

    window.dispatchEvent(new StorageEvent('storage', {
      key: RETENTION_STORAGE_KEYS.saved,
      newValue: JSON.stringify([' elite-6 ', 42, null, { id: 'not-an-id' }, '']),
    }));
    await waitFor(() => expect(screen.getByTestId('saved')).toHaveTextContent('elite-6'));

    window.dispatchEvent(new StorageEvent('storage', {
      key: RETENTION_STORAGE_KEYS.saved,
      newValue: '{broken',
    }));
    await waitFor(() => expect(screen.getByTestId('saved')).toHaveTextContent(''));
    expect(screen.getByTestId('saved-mode')).toHaveTextContent('persistent');
  });

  it('refreshes both collections when another tab clears storage', async () => {
    window.localStorage.setItem(RETENTION_STORAGE_KEYS.saved, JSON.stringify(['elite-6']));
    window.localStorage.setItem(RETENTION_STORAGE_KEYS.compare, JSON.stringify([
      { id: 'elite-6', categoryKey: 'kitchen', comparisonKey: 'coffee' },
    ]));
    render(<RetentionHarness />);

    await waitFor(() => {
      expect(screen.getByTestId('saved')).toHaveTextContent('elite-6');
      expect(screen.getByTestId('compare')).toHaveTextContent('elite-6');
    });

    window.localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null }));

    await waitFor(() => {
      expect(screen.getByTestId('saved')).toHaveTextContent('');
      expect(screen.getByTestId('compare')).toHaveTextContent('');
    });
    expect(screen.getByTestId('saved-mode')).toHaveTextContent('persistent');
    expect(screen.getByTestId('compare-mode')).toHaveTextContent('persistent');
  });
});
