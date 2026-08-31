import { describe, expect, it } from 'vitest';

import robots from './robots';

describe('robots', () => {
  it('allows public crawling, protects private areas, and declares the sitemap', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/'],
      },
      sitemap: 'https://trendingnow.ge/sitemap.xml',
    });
  });
});
