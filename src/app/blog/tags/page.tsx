import type { Metadata } from 'next';
import type React from 'react';

import { DEFAULT_BLOG_LOCALE } from '@/features/blog/lib/locales';
import { buildTagsIndexMetadata } from '@/features/blog/lib/metadata';
import { TagsIndexPage } from '@/features/blog/pages/TagsIndexPage';

export const metadata: Metadata = buildTagsIndexMetadata(DEFAULT_BLOG_LOCALE);

export default function Page(): React.ReactElement {
  return <TagsIndexPage locale={DEFAULT_BLOG_LOCALE} />;
}
