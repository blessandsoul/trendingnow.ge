import { describe, expect, it } from 'vitest';
import { isPublicBlogData } from './publication-policy';

describe('public blog admission boundary', () => {
  it('preserves existing published documents and reviewed releases', () => {
    expect(isPublicBlogData({title: 'Legacy'})).toBe(true);
    expect(isPublicBlogData({draft:false,status:'published',reviewStatus:'approved',holdReasons:[]})).toBe(true);
  });
  it.each([
    {draft:true}, {draft:'false'}, {status:'draft'}, {status:'DRAFTED_HOLD'},
    {publicationStatus:'scheduled'}, {reviewStatus:'pending'}, {reviewStatus:'DRAFTED_HOLD'},
    {holdReasons:['sources']}, {holdReasons:'unreviewed'},
  ])('blocks unreviewed or held material: %j', data => {
    expect(isPublicBlogData(data)).toBe(false);
  });
});
