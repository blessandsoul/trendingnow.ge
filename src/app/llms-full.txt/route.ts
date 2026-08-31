import { getPostBySlug, getPosts } from '@/features/blog/lib/api';
import { DEFAULT_BLOG_LOCALE, localizedPath } from '@/features/blog/lib/locales';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/features/blog/lib/site';
import { stripHtml } from '@/features/blog/lib/structured-data';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `ვებსაიტი: ${SITE_URL}`,
    `პროდუქტები: ${absoluteUrl('/products')}`,
    `ბლოგი: ${absoluteUrl('/blog')}`,
    '',
    'TrendingNow.ge აქვეყნებს პრაქტიკულ გზამკვლევებსა და შედარებებს ტრენდული პროდუქტების მყიდველებისთვის.',
    '',
  ];

  const locale = DEFAULT_BLOG_LOCALE;
  const posts = await getPosts(locale);

  for (const post of posts.slice(0, 30)) {
    const fullPost = await getPostBySlug(post.slug, locale);
    lines.push(`## ${post.title}`);
    lines.push(`ბმული: ${absoluteUrl(localizedPath(locale, `/blog/${post.slug}`))}`);
    lines.push(`თარიღი: ${post.date}`);
    lines.push(`თემები: ${post.tags.join(', ')}`);
    lines.push('');
    lines.push(stripHtml(fullPost?.content || post.excerpt));
    lines.push('');
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
