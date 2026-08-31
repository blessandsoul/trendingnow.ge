import { z } from 'zod';

function blankAsUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value;
}

// Every required field MUST have a .default() so the dev fallback
// (envSchema.parse({})) can produce valid defaults when env vars are missing in
// development. Genuinely optional integrations (e.g. Sentry) use .optional()
// instead — unset means "disabled", and the build must pass with them absent.
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_API_BASE_URL must be a valid URL')
    .default('http://localhost:8080/api/v1'),
  NEXT_PUBLIC_APP_NAME: z.string().default('My App'),
  NEXT_PUBLIC_SITE_URL: z
    .preprocess(
      blankAsUndefined,
      z.string()
        .url('NEXT_PUBLIC_SITE_URL must be a valid URL')
        .default('https://trendingnow.ge'),
    ),

  // --- Error Tracking (Optional, Sentry) ---
  // Inert without a DSN: instrumentation only inits Sentry when this is set.
  // Optional so `next build` passes with it unset. Never hardcode a DSN.
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  // Fraction of transactions sampled for browser performance tracing (0..1).
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
});

function validateEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  });

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(`\n❌ Invalid environment variables:\n${formatted}\n`);

    // In production, fail hard. In development, warn but continue with defaults.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
  }

  return result.success ? result.data : envSchema.parse({});
}

export const env = validateEnv();
