import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('environment validation', () => {
  it('uses the public API hostname when a production build argument is empty', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');

    const { env } = await import('./env');

    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe('https://api.trendingnow.ge/api/v1');
  });

  it('uses the site URL default when Docker supplies an empty build argument', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8080/api/v1');
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'TrendingNow.ge');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');

    const { env } = await import('./env');

    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://trendingnow.ge');
  });
});
