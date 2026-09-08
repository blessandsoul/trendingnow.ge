import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { Marked } from 'marked';

export const editorialDraftSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1), excerpt: z.string().min(1), bodyMarkdown: z.string().min(1),
  category: z.string().min(1), tags: z.array(z.string()),
  sourceURLs: z.array(z.string().url().refine(value => value.startsWith('https://'))),
  productIDs: z.array(z.string()), reviewStatus: z.string().min(1), holdReasons: z.array(z.string()),
  commercialBrief: z.object({
    buyerDecision: z.string().min(1), primaryProductID: z.string().min(1),
    format: z.string().min(1), alternativeProductIDs: z.array(z.string()),
    choiceReason: z.string().min(1), intentOverlapRisk: z.string().min(1),
  }).optional(),
});
export type EditorialDraft = z.infer<typeof editorialDraftSchema>;
export type EditorialDraftSummary = Omit<EditorialDraft, 'bodyMarkdown'> & { wordCount: number };

/** Development-only filesystem review. No route/Host header can enable it in production. */
export function getEditorialDrafts(): EditorialDraft[] {
  if (process.env.NODE_ENV !== 'development') return [];
  const configured = process.env.TRENDINGNOW_EDITORIAL_DRAFT_DIR;
  if (!configured || !path.isAbsolute(configured)) return [];
  const directory = path.join(configured, 'articles');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter(name => /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name)).flatMap(name => {
    try {
      const parsed = editorialDraftSchema.safeParse(JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')));
      if (!parsed.success || `${parsed.data.slug}.json` !== name) return [];
      return [parsed.data];
    } catch { return []; }
  }).sort((a,b) => a.slug.localeCompare(b.slug));
}

export function draftSummary({ bodyMarkdown, ...draft }: EditorialDraft): EditorialDraftSummary {
  return { ...draft, wordCount: bodyMarkdown.split(/\s+/u).filter(Boolean).length };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

const safeMarkdown = new Marked({
  gfm: true,
  renderer: {
    heading({ depth, tokens }) {
      const level = Math.max(2, depth);
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>`;
    },
    html({ text }) { return escapeHtml(text); },
    image() { return ''; },
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!/^(https:\/\/|\/(?!\/)|#)/i.test(href) || /[\u0000-\u0020\\]/.test(href)) return text;
      // Canonical draft links must stay in the local preview, not visit unreleased production routes.
      if (href.startsWith('https://trendingnow.ge/')) {
        const ownUrl = new URL(href);
        if (!ownUrl.pathname.startsWith('//')) href = `${ownUrl.pathname}${ownUrl.search}${ownUrl.hash}`;
      }
      return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${text}</a>`;
    },
  },
});

export function renderEditorialMarkdown(markdown: string): string {
  return safeMarkdown.parse(markdown, { async: false });
}
