import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CompareToggle } from './CompareToggle';
import { SavedToggle } from './SavedToggle';
import { RETENTION_STORAGE_KEYS } from '../lib/retention-storage';

describe('guest retention controls', () => {
  beforeEach(() => window.localStorage.clear());

  it('hydrates saved state and broadcasts a cross-tab update', async () => {
    window.localStorage.setItem(RETENTION_STORAGE_KEYS.saved, JSON.stringify(['elite-6']));
    render(<SavedToggle productId="elite-6" productName="Coffee maker" />);
    const button = await screen.findByRole('button', { name: /შენახულიდან წაშლა/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');

    window.dispatchEvent(new StorageEvent('storage', {
      key: RETENTION_STORAGE_KEYS.saved,
      newValue: JSON.stringify([]),
    }));
    await waitFor(() => expect(screen.getByRole('button', { name: /შენახვა/i })).toHaveAttribute('aria-pressed', 'false'));
  });

  it('keeps compare entries in one category and caps the selection at three', async () => {
    render(<div><CompareToggle productId="elite-6" productName="elite-6" categoryKey="kitchen" comparisonKey="coffee" /><CompareToggle productId="elite-7" productName="elite-7" categoryKey="kitchen" comparisonKey="coffee" /><CompareToggle productId="pcshop-1" productName="pcshop-1" categoryKey="workspace" comparisonKey="mouse" /></div>);
    const buttons = await screen.findAllByRole('button', { name: /შედარებაში დამატება.*elite-6/i });
    const kitchen = buttons[0];
    await waitFor(() => expect(kitchen).toBeEnabled());
    fireEvent.click(kitchen);
    const second = screen.getByRole('button', { name: /შედარებაში დამატება.*elite-7/i });
    await waitFor(() => expect(second).toBeEnabled());
    fireEvent.click(second);
    await waitFor(() => expect(screen.getByRole('button', { name: /სხვადასხვა კატეგორიის/i })).toBeDisabled());
    expect(JSON.parse(window.localStorage.getItem(RETENTION_STORAGE_KEYS.compare) ?? '[]')).toEqual([
      { id: 'elite-6', categoryKey: 'kitchen', comparisonKey: 'coffee' },
      { id: 'elite-7', categoryKey: 'kitchen', comparisonKey: 'coffee' },
    ]);
  });
});
