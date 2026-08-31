import 'server-only';

export function stripHtml(content: string): string {
  return content
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractFaqItems(content: string): { question: string; answer: string }[] {
  const faqItems: { question: string; answer: string }[] = [];
  const faqRegex = /<h3[^>]*>([^<]+\?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = faqRegex.exec(content)) !== null) {
    faqItems.push({
      question: match[1].replace(/<[^>]+>/g, '').trim(),
      answer: match[2].replace(/<[^>]+>/g, '').trim(),
    });
  }

  return faqItems;
}
