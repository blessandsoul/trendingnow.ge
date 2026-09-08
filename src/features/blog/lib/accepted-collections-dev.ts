import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

/**
 * Development-only filesystem adapter. Keep this out of the production
 * loader's static import graph: accepted public content is bundled JSON.
 * Invalid or missing overrides return undefined so callers fail closed.
 */
export function readDevelopmentAcceptedOverride(filePath: string): unknown | undefined {
  if (!path.isAbsolute(filePath) || !fs.existsSync(filePath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  } catch {
    return undefined;
  }
}
