const SUPPORT_EMAIL = 'contact@ainow.ge';

export function buildSupportMailto(subject: string, bodyLines: readonly string[]): string {
  const query = new URLSearchParams({
    subject: subject.trim(),
    body: bodyLines.map((line) => line.trim()).filter(Boolean).join('\n'),
  });

  return `mailto:${SUPPORT_EMAIL}?${query.toString()}`;
}
