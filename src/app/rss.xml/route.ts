import { getPosts } from '@/features/blog/lib/api';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/features/blog/lib/site';
import { stripHtml } from '@/features/blog/lib/structured-data';
import { DEFAULT_BLOG_LOCALE } from '@/features/blog/lib/locales';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  const posts = await getPosts(DEFAULT_BLOG_LOCALE);
  const items = posts.slice(0, 50).map((post) => {
    const url = absoluteUrl(`/blog/${post.slug}`);

    return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${escapeXml(url)}</link>
        <guid>${escapeXml(url)}</guid>
        <description>${escapeXml(post.excerpt)}</description>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <author>${escapeXml(post.author.name)}</author>
        ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}
        <content:encoded><![CDATA[${stripHtml(post.content || post.excerpt)}]]></content:encoded>
      </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>${escapeXml(`${SITE_NAME} ბლოგი`)}</title>
        <link>${escapeXml(SITE_URL)}</link>
        <description>${escapeXml('TrendingNow.ge-ის ყიდვის გზამკვლევები, ტრენდული პროდუქტები და პრაქტიკული შედარებები.')}</description>
        <language>${DEFAULT_BLOG_LOCALE}</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
