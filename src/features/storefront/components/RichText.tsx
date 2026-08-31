import type React from 'react';

import { cn } from '@/lib/utils';
import { publicMediaUrl } from '@/lib/utils/media';

const HTML_TAG_PATTERN = /<[a-z][^>]*>/i;
const PRODUCT_IMAGE_SRC_PATTERN = /^\/uploads\/storefront\/product\/[\p{L}\p{N}][\p{L}\p{N}._-]*\.webp$/u;

export type RichTextResponsiveMode = 'auto' | 'phone';

function withPublicProductImageUrls(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\ssrc=(?:"([^"]*)"|'([^']*)')/i);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? '';
    if (!PRODUCT_IMAGE_SRC_PATTERN.test(src)) return '';
    return tag.replace(/\ssrc=(?:"[^"]*"|'[^']*')/i, ` src="${publicMediaUrl(src)}"`);
  });
}

/**
 * Renders admin-authored product copy. HTML content is sanitized server-side
 * on write, so the storefront receives trusted markup; legacy plain-text
 * values are rendered as React-escaped paragraphs and stay XSS-safe.
 * Prose palette mirrors features/blog/components/BlogPost.tsx via theme tokens.
 */
export function RichText({
  html,
  className,
  responsiveMode = 'auto',
}: {
  html: string;
  className?: string;
  responsiveMode?: RichTextResponsiveMode;
}): React.ReactElement {
  const phoneLayout = responsiveMode === 'phone';
  if (HTML_TAG_PATTERN.test(html)) {
    const displayHtml = withPublicProductImageUrls(html);
    return (
      <div
        className={cn(
          'prose max-w-none',
          phoneLayout ? 'text-sm leading-6' : 'text-sm leading-7 sm:text-base',
          'prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground',
          phoneLayout
            ? 'prose-h2:mb-3 prose-h2:mt-6 prose-h2:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-h3:text-base prose-p:mb-3 prose-p:leading-6'
            : 'prose-h2:mb-3 prose-h2:mt-7 prose-h2:text-xl prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-lg prose-p:mb-4 prose-p:leading-7',
          'prose-p:text-muted-foreground',
          'prose-a:font-bold prose-a:text-info prose-a:no-underline hover:prose-a:underline',
          'prose-li:text-muted-foreground prose-li:marker:text-warning',
          'prose-strong:font-black prose-strong:text-foreground',
          '[&_img]:my-5 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl',
          '[&_img[data-align=left]]:mr-auto [&_img[data-align=center]]:mx-auto [&_img[data-align=right]]:ml-auto',
          '[&_[data-description-image-row]]:my-5 [&_[data-description-image-row]]:grid [&_[data-description-image-row]]:gap-3',
          phoneLayout ? '[&_[data-description-image-row]]:grid-cols-1' : 'sm:[&_[data-description-image-row]]:grid-cols-2',
          '[&_[data-description-image-row]_img]:my-0 [&_[data-description-image-row]_img]:w-full [&_[data-description-image-row]_img]:max-w-none',
          '[&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    );
  }

  const paragraphs = html
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return (
    <div className={cn('grid gap-4 text-sm text-muted-foreground', phoneLayout ? 'leading-6' : 'leading-7 sm:text-base', className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
      ))}
    </div>
  );
}
