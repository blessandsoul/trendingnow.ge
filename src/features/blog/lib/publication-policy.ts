/** Draft presence on disk never authorizes exposing it as a published article.
 * Legacy documents without workflow metadata keep their existing behavior.
 */
export function isPublicBlogData(data: Record<string, unknown>): boolean {
  if (data.draft !== undefined && data.draft !== false) return false;
  if (data.status !== undefined && data.status !== 'published') return false;
  if (data.publicationStatus !== undefined && data.publicationStatus !== 'published') return false;
  if (data.reviewStatus !== undefined && data.reviewStatus !== 'approved') return false;
  if (data.holdReasons !== undefined && (!Array.isArray(data.holdReasons) || data.holdReasons.length > 0)) return false;
  return true;
}
