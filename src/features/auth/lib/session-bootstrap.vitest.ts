import { expect, it } from 'vitest';
import { shouldBootstrapSession } from './session-bootstrap';

it.each(['/editorial-preview', '/editorial-preview/example', '/login', '/register', '/products', '/', '/saved', '/compare', '/editorial-preview-other'])('does not probe a guest session on %s', pathname => {
  expect(shouldBootstrapSession(pathname, false)).toBe(false);
});
it.each(['/dashboard', '/admin', '/profile', '/dashboard/orders'])('preserves account session hydration on %s', pathname => {
  expect(shouldBootstrapSession(pathname, false)).toBe(true);
});
it('refreshes an already known session on public routes', () => {
  expect(shouldBootstrapSession('/products', false, true)).toBe(true);
});
it('does not probe during logout', () => {
  expect(shouldBootstrapSession('/dashboard', true)).toBe(false);
});
