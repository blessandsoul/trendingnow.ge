import { ACTIVE_BLOG_LOCALES, DEFAULT_BLOG_LOCALE, localizedPath } from '@/features/blog/lib/locales';
import { getPosts } from '@/features/blog/lib/api';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/features/blog/lib/site';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    '> Continuum GE ტექნიკის ონლაინ მაღაზია, კატალოგი და ყიდვის გზამკვლევების ბლოგი.',
    '',
    '## ძირითადი გვერდები',
    `- მთავარი: ${SITE_URL}`,
    `- პროდუქტები: ${absoluteUrl('/products')}`,
    `- ბლოგი: ${absoluteUrl('/blog')}`,
    `- კონტაქტი: ${absoluteUrl('/contact')}`,
    '',
    '## აქტიური ბლოგის ენები',
    ...ACTIVE_BLOG_LOCALES.map((locale) => `- ${locale}: ${absoluteUrl(localizedPath(locale, '/blog'))}`),
    '',
    '## ბოლო ბლოგპოსტები',
  ];

  const posts = await getPosts(DEFAULT_BLOG_LOCALE);
  posts.slice(0, 20).forEach((post) => {
    lines.push(`- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.excerpt}`);
  });

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
