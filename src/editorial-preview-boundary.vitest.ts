import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

afterEach(() => vi.unstubAllEnvs());
it.each(['/editorial-preview', '/editorial-preview/example', '/en/editorial-preview/example', '/ka/editorial-preview'])('blocks the private reviewer before production streaming: %s', pathname => {
  vi.stubEnv('NODE_ENV', 'production');
  const response = middleware(new NextRequest(`https://trendingnow.ge${pathname}`));
  expect(response.status).toBe(404);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(response.headers.get('x-robots-tag')).toContain('noindex');
});
it('keeps local development review available', () => {
  vi.stubEnv('NODE_ENV', 'development');
  expect(middleware(new NextRequest('http://localhost:3014/editorial-preview')).status).toBe(200);
});
