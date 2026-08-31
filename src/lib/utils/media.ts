import { env } from '@/lib/env';

const uploadPathPrefix = '/uploads/';

function getApiOrigin(): string {
  return new URL(env.NEXT_PUBLIC_API_BASE_URL).origin;
}

export function publicMediaUrl(src: string): string {
  if (!src.startsWith(uploadPathPrefix)) return src;
  return `${getApiOrigin()}${src}`;
}
