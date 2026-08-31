export function formatGel(value: number): string {
  return `${value.toLocaleString('ka-GE')} ₾`;
}

export function toStorefrontUppercase(value: string): string {
  return value.toLocaleUpperCase('ka-GE');
}

/** Strips tags + decodes common entities without any DOM dependency (SSR-safe). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
