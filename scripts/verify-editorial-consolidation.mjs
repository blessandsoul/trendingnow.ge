/** Frozen-copy consolidation audit. Does not grant publication permission. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [root, ...flags] = process.argv.slice(2);
if (!root || !path.isAbsolute(root)) throw Error('Absolute package path required');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const hash = relative => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const baseline = 'versions/before-overlap-resolution-20260908';
const originalMatrix = read(`${baseline}/ownership-review-matrix.json`);
const merged = originalMatrix.rows.filter(r => r.ownership === 'SUPPORTING_ONLY' && r.ownerSlug !== r.slug);
const corrected = originalMatrix.rows.filter(r => r.ownership === 'SUPPORTING_ONLY' && r.ownerSlug === r.slug);
const errors = [];
const articles = new Map(originalMatrix.rows.map(r => [r.slug, read(r.file)]));
const sourceReceipt = read('checks/source-conflict-resolution-20260908.json');
const overlapReceipt = read('checks/overlap-resolution-20260908.json');
const equalHash = (a,b) => String(a).toLowerCase() === String(b).toLowerCase();
const check = (condition, message) => { if (!condition) errors.push(message); };
check(articles.size === 50, 'Expected 50 original identities');
check(merged.length === 15 && corrected.length === 1, 'Expected 15 merges and one self-owner correction');
check(overlapReceipt.rows.length === 16 && new Set(overlapReceipt.rows.map(r => r.sourceSlug)).size === 16, 'Expected sixteen unique reviewed overlap rows');
for (const proof of overlapReceipt.rows) {
  const mapped = originalMatrix.rows.find(r => r.slug === proof.sourceSlug);
  check(mapped?.ownerSlug === proof.ownerSlug, `${proof.sourceSlug}: changed owner mapping`);
  const ownerFile = `articles/${proof.ownerSlug}.json`;
  check(equalHash(hash(ownerFile), proof.ownerAfterSha256), `${proof.sourceSlug}: stale owner hash`);
  check(equalHash(hash(`${baseline}/${ownerFile}`), proof.ownerBeforeSha256), `${proof.sourceSlug}: owner baseline hash mismatch`);
  check(equalHash(hash(proof.sourceDraftRetention.path), proof.sourceDraftRetention.currentFileSha256), `${proof.sourceSlug}: stale retained source hash`);
  check(equalHash(hash(proof.sourceDraftRetention.immutableBaselinePath), proof.sourceDraftRetention.baselineFileSha256), `${proof.sourceSlug}: source baseline hash mismatch`);
  check(proof.integration.ownerAnchors.length > 0, `${proof.sourceSlug}: no integration anchor`);
  for (const anchor of proof.integration.ownerAnchors) {
    const body = articles.get(proof.ownerSlug)?.bodyMarkdown ?? '';
    check(body.includes(anchor.exactQuote) && body.includes(anchor.heading), `${proof.sourceSlug}: owner coverage anchor missing`);
  }
}
for (const row of merged) {
  check(equalHash(hash(row.file), hash(`${baseline}/${row.file}`)), `${row.slug}: supporting original changed`);
  check(articles.has(row.ownerSlug), `${row.slug}: owner missing`);
  check(!merged.some(r => r.slug === row.ownerSlug), `${row.slug}: owner is excluded too`);
  check(!equalHash(hash(row.file), hash(`articles/${row.ownerSlug}.json`)), `${row.slug}: owner is identical copy`);
}
for (const change of [...sourceReceipt.articleChanges, ...(sourceReceipt.additionalArticleChanges ?? [])]) {
  const body = articles.get(change.slug)?.bodyMarkdown ?? '';
  check(equalHash(hash(change.path), change.afterSnapshot.sha256), `${change.slug}: stale source receipt`);
  check(equalHash(hash(change.beforeSnapshot.path), change.beforeSnapshot.sha256), `${change.slug}: baseline receipt mismatch`);
  for (const anchor of change.afterExactClaims) check(body.includes(anchor), `${change.slug}: source anchor missing`);
  check(!/(?:78\s*W|87\s*W|573\s*გ|0[.,]69|4[.,]35\s*A)/i.test(body), `${change.slug}: disputed numeric claim remains`);
}
const travel = sourceReceipt.travelMergeProof;
check(equalHash(hash(travel.sourcePath), travel.sourceSha256), 'Travel baseline mismatch');
check(articles.get('workspace-powerbank-laptop-check').bodyMarkdown.includes(travel.retainedAnchor), 'Travel anchor not in designated owner');
// Independent semantic review is recorded separately; these checks establish lineage only.
const rows = originalMatrix.rows.map(row => {
  const article = articles.get(row.slug);
  const isMerged = merged.some(r => r.slug === row.slug);
  const isCorrected = corrected.some(r => r.slug === row.slug);
  const isSource = sourceReceipt.articleChanges.some(r => r.slug === row.slug);
  return {
    slug: row.slug, file: row.file, sha256: hash(row.file),
    ownerSlug: row.ownerSlug,
    disposition: isMerged ? 'MERGED_INTO_OWNER' : 'STANDALONE_REVIEW_CANDIDATE',
    ownership: isMerged ? 'MERGED_INTO_OWNER' : isCorrected ? 'CANONICAL_OWNER' : isSource ? 'SOURCE_CAUTION_OWNER' : row.ownership,
    standaloneReleaseCandidate: !isMerged,
    publicationAccepted: false,
    correction: isCorrected ? 'Self-reference was incorrectly classified as supporting-only.' : undefined,
    sourceCopyIssue: isSource ? 'UNSUPPORTED_ASSERTIONS_REMOVED_IDENTITY_STILL_UNKNOWN' : undefined,
    bodyChangedFromBaseline: article.bodyMarkdown !== read(`${baseline}/${row.file}`).bodyMarkdown,
  };
});
for (const row of rows.filter(r => r.standaloneReleaseCandidate)) {
  check(!/(?:78\s*W|87\s*W|573\s*გ|0[.,]69|4[.,]35\s*A)/i.test(articles.get(row.slug).bodyMarkdown), `${row.slug}: propagated disputed Anker claim remains`);
}
const report = {
  schema: 'editorial-consolidation/1.0', generatedAt: new Date().toISOString(),
  status: errors.length ? 'FAIL' : 'PASS_TRACEABILITY_ONLY', errors,
  counts: { stored: rows.length, merged: merged.length, corrected: corrected.length,
    standaloneReviewCandidates: rows.filter(r => r.standaloneReleaseCandidate).length,
    sourceCopyCorrections: sourceReceipt.articleChanges.length, accepted: 0, published: 0 },
  evidence: {
    originalMatrix: { path: `${baseline}/ownership-review-matrix.json`, sha256: hash(`${baseline}/ownership-review-matrix.json`) },
    overlap: { path: 'checks/overlap-resolution-20260908.json', sha256: hash('checks/overlap-resolution-20260908.json'), schema: overlapReceipt.schema ?? overlapReceipt.schema_version },
    sources: { path: 'checks/source-conflict-resolution-20260908.json', sha256: hash('checks/source-conflict-resolution-20260908.json') },
  },
  boundary: 'Selection for subsequent editorial admission only. Original drafts remain. No canonical, redirect, noindex, production loader, or publication change. Identity uncertainties remain unknown.',
  rows,
};
if (flags.includes('--write') && !errors.length) {
  fs.writeFileSync(path.join(root,'checks/release-selection-20260908.json'), `${JSON.stringify(report,null,2)}\n`);
  const matrix = { ...originalMatrix, schema_version: '4.0-consolidated-review-selection', generatedAt: report.generatedAt,
    classificationNote: report.boundary, counts: report.counts,
    rows: originalMatrix.rows.map(row => {
      const selection = rows.find(r => r.slug === row.slug);
      const article = articles.get(row.slug);
      return { ...row, ownership: selection.ownership, finalSha256: selection.sha256,
        productIDs: article.productIDs, sourceURLs: article.sourceURLs,
        buyerJob: article.commercialBrief?.buyerDecision ?? row.buyerJob,
        exactAnchors: article.bodyMarkdown.split(/\n\s*\n/).filter(p => !p.startsWith('#')).slice(0,2).map(quote => ({description:'Current body excerpt; traceability only',quote})),
        disposition: selection.disposition, standaloneReleaseCandidate: selection.standaloneReleaseCandidate,
        priorOwnership: row.ownership, status: 'DRAFTED_HOLD' };
    }),
  };
  fs.writeFileSync(path.join(root,'checks/ownership-review-matrix.json'), `${JSON.stringify(matrix,null,2)}\n`);
}
console.log(JSON.stringify({status:report.status,counts:report.counts,errors},null,2));
process.exitCode = errors.length ? 1 : 0;
