#!/usr/bin/env node

/**
 * Build the bounded owner-authorized TrendingNow collection bundle.
 *
 * This script copies the selected frozen article fields without changing the
 * source drafts. It refuses a changed selection, changed article bytes,
 * non-HOLD source drafts, missing exact products, or a missing automatic gate
 * receipt. The resulting JSON is static input for the public loader; it does
 * not push, deploy, or claim that the automatic gates passed.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(scriptDirectory, '..');
const defaultPackageDirectory = path.resolve(
  scriptDirectory,
  '../../../AGENT/agents/seo-autocontent/content/trendingnow-release-50-20260908',
);
const defaultOutputPath = path.join(clientDirectory, 'src/features/blog/data/accepted-collections.json');
const disclosure = 'სარედაქციო ბმული. ეს არ არის ფასიანი განთავსება ან დადასტურებული პარტნიორობა. ფასი, მარაგი, მიწოდება, გარანტია და დაბრუნება გადაამოწმე გამყიდველთან.';
const approvalReason = 'მფლობელმა დაუშვა შეზღუდული ხელით გამოქვეყნება; ავტომატური SEO, ქართული, უსაფრთხოების, მოთხოვნის, გამოსახულების უფლებებისა და production gates კვლავ HOLD-ად რჩება.';
const manualAdmissionMode = 'owner_authorized_manual';
const manualReviewStatus = 'owner_manual';
const manualStatus = 'OWNER_AUTHORIZED';

function usage() {
  console.error('Usage: node scripts/build-manual-accepted-collections.mjs --approved-at <ISO timestamp> [--package-dir <path>] [--output <path>] [--approved-by <name>] [--check-only]');
  process.exitCode = 2;
}

function readArgs(argv) {
  const options = { packageDirectory: defaultPackageDirectory, outputPath: defaultOutputPath, approvedBy: 'owner', checkOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check-only') options.checkOnly = true;
    else if (arg === '--package-dir') options.packageDirectory = path.resolve(argv[++index] ?? '');
    else if (arg === '--output') options.outputPath = path.resolve(argv[++index] ?? '');
    else if (arg === '--approved-at') options.approvedAt = argv[++index];
    else if (arg === '--approved-by') options.approvedBy = argv[++index];
    else if (arg === '--help' || arg === '-h') return usage();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.approvedAt) throw new Error('--approved-at is required so the owner receipt remains reproducible and auditable.');
  if (Number.isNaN(Date.parse(options.approvedAt))) throw new Error(`Invalid --approved-at timestamp: ${options.approvedAt}`);
  if (!options.approvedBy) throw new Error('--approved-by must not be empty.');
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256Bytes(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().flatMap((key) => {
      const entry = value[key];
      return entry === undefined ? [] : [`${JSON.stringify(key)}:${stableJson(entry)}`];
    }).join(',')}}`;
  }
  return value === undefined ? 'null' : JSON.stringify(value);
}

function digest(value) {
  return crypto.createHash('sha256').update(stableJson(value), 'utf8').digest('hex');
}

function contentPayload(record) {
  return {
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    bodyMarkdown: record.bodyMarkdown,
    category: record.category,
    tags: record.tags,
    productIDs: record.productIDs,
    sourceURLs: record.sourceURLs,
    sourceDate: record.sourceDate,
    disclosure: record.disclosure,
    translations: record.translations,
  };
}

function contentHash(record) {
  return digest(contentPayload(record));
}

function manualAdmissionHash(admission) {
  const { receiptHash: _receiptHash, ...payload } = admission;
  return digest(payload);
}

function bundleHash(records) {
  return digest(records.map((record) => ({
    slug: record.slug,
    contentHash: record.contentHash,
    manualAdmissionReceiptHash: record.manualAdmission?.receiptHash ?? null,
    sourceArticleSha256: record.manualAdmission?.sourceArticleSha256 ?? null,
  })));
}

function receiptHash(receipt) {
  const { receiptHash: _receiptHash, ...payload } = receipt;
  return digest(payload);
}

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing required file: ${filePath}`);
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function relativeEvidencePath(packageDirectory, filePath) {
  const workspaceDirectory = path.resolve(packageDirectory, '../../../../..');
  return path.relative(workspaceDirectory, filePath).replaceAll(path.sep, '/');
}

function buildBundle(options) {
  const packageDirectory = options.packageDirectory;
  const selectionPath = path.join(packageDirectory, 'checks/release-selection-20260908.json');
  const gateStatusPath = path.join(packageDirectory, 'checks/gate-status.json');
  const sourceRegisterPath = path.join(packageDirectory, 'sources/source-register-20260907.json');
  const discoveryPath = path.join(clientDirectory, 'src/features/storefront/data/discovery-pilot.json');
  [selectionPath, gateStatusPath, sourceRegisterPath, discoveryPath].forEach(requireFile);

  const selection = readJson(selectionPath);
  const gateStatus = readJson(gateStatusPath);
  const sourceRegister = readJson(sourceRegisterPath);
  const discovery = readJson(discoveryPath);
  const discoveryById = new Map(discovery.map((item) => [item.id, item]));

  ensure(selection.schema === 'editorial-consolidation/1.0', `Unexpected selection schema: ${selection.schema}`);
  ensure(selection.status === 'PASS_TRACEABILITY_ONLY', `Selection is not traceability-only PASS: ${selection.status}`);
  ensure(selection.counts?.stored === 50, `Expected 50 preserved selection rows, got ${selection.counts?.stored}`);
  ensure(selection.counts?.standaloneReviewCandidates === 35, `Expected 35 selected rows, got ${selection.counts?.standaloneReviewCandidates}`);
  ensure(selection.counts?.merged === 15, `Expected 15 supporting rows, got ${selection.counts?.merged}`);
  ensure(gateStatus.status === 'DRAFTED_HOLD', `Automatic gate package is not HOLD: ${gateStatus.status}`);
  ensure(/^\d{4}-\d{2}-\d{2}$/.test(sourceRegister.sourceCheckedAt), `Unexpected source register date: ${sourceRegister.sourceCheckedAt}`);

  const rows = selection.rows.filter((row) => row.standaloneReleaseCandidate === true);
  ensure(rows.length === 35, `Expected exactly 35 standalone rows, got ${rows.length}`);
  const selectedSlugs = rows.map((row) => row.slug);
  ensure(new Set(selectedSlugs).size === selectedSlugs.length, 'Selection contains duplicate standalone slugs.');

  const pendingGates = Object.entries(gateStatus.gates ?? {})
    .filter(([, gate]) => !String(gate.status).startsWith('PASS'))
    .map(([name, gate]) => ({ name, status: String(gate.status) }));
  ensure(pendingGates.length > 0, 'Automatic gate receipt unexpectedly contains no pending gates.');

  const sourceDate = sourceRegister.sourceCheckedAt;
  const collections = rows.map((row) => {
    const articlePath = path.join(packageDirectory, row.file);
    requireFile(articlePath);
    const articleBytesHash = sha256Bytes(articlePath);
    ensure(articleBytesHash === String(row.sha256).toLowerCase(), `${row.slug}: article bytes do not match selection hash.`);
    const article = readJson(articlePath);
    ensure(article.slug === row.slug, `${row.slug}: article slug mismatch.`);
    ensure(article.reviewStatus === 'DRAFTED_HOLD', `${row.slug}: source draft is not DRAFTED_HOLD.`);
    ensure(row.publicationAccepted === false, `${row.slug}: selection row is already marked accepted.`);
    ensure(Array.isArray(article.productIDs) && article.productIDs.length > 0, `${row.slug}: missing exact product IDs.`);
    ensure(Array.isArray(article.sourceURLs) && article.sourceURLs.length > 0, `${row.slug}: missing source URLs.`);
    for (const productId of article.productIDs) {
      const product = discoveryById.get(productId);
      ensure(product?.status === 'reviewed' && product?.match === 'exact', `${row.slug}: product ${productId} is not an exact reviewed offer.`);
      const sourceUrls = article.sourceURLs.map((url) => new URL(url));
      const normalizedProductUrl = new URL(product.productUrl);
      normalizedProductUrl.hash = '';
      const found = sourceUrls.some((sourceUrl) => {
        sourceUrl.hash = '';
        return sourceUrl.href.replace(/\/$/, '') === normalizedProductUrl.href.replace(/\/$/, '');
      });
      ensure(found, `${row.slug}: source URL missing for exact product ${productId}.`);
    }

    const record = {
      schemaVersion: 1,
      slug: article.slug,
      status: manualStatus,
      reviewStatus: manualReviewStatus,
      reviewedAt: options.approvedAt,
      title: article.title,
      excerpt: article.excerpt,
      bodyMarkdown: article.bodyMarkdown,
      category: article.category,
      tags: article.tags,
      productIDs: article.productIDs,
      sourceURLs: article.sourceURLs,
      sourceDate,
      disclosure,
    };
    record.contentHash = contentHash(record);
    record.manualAdmission = {
      schemaVersion: 1,
      mode: manualAdmissionMode,
      approvedAt: options.approvedAt,
      approvedBy: options.approvedBy,
      approvalReason,
      automaticGateStatus: 'HOLD',
      pendingAutomaticGates: pendingGates.map((gate) => `${gate.name}:${gate.status}`),
      sourceArticleSha256: articleBytesHash,
      selectionRowSha256: String(row.sha256).toLowerCase(),
      contentHash: record.contentHash,
    };
    record.manualAdmission.receiptHash = manualAdmissionHash(record.manualAdmission);
    return record;
  });

  const selectionEvidence = {
    path: relativeEvidencePath(packageDirectory, selectionPath),
    sha256: sha256Bytes(selectionPath),
    selectedCount: rows.length,
    preservedCount: selection.counts.stored,
    supportingCount: selection.counts.merged,
    selectedSlugs,
  };
  const sourceEvidence = {
    path: relativeEvidencePath(packageDirectory, sourceRegisterPath),
    sha256: sha256Bytes(sourceRegisterPath),
    sourceDate,
  };
  const automaticGates = {
    status: 'HOLD',
    evidencePath: relativeEvidencePath(packageDirectory, gateStatusPath),
    evidenceSha256: sha256Bytes(gateStatusPath),
    pending: pendingGates,
  };
  const manualReceipt = {
    schemaVersion: 1,
    mode: manualAdmissionMode,
    approvedAt: options.approvedAt,
    approvedBy: options.approvedBy,
    decision: 'publish_selected_collections',
    selection: selectionEvidence,
    sourceSnapshot: sourceEvidence,
    automaticGates,
    expectedCollectionCount: collections.length,
    collectionSlugs: selectedSlugs,
    bundleHash: bundleHash(collections),
  };
  manualReceipt.receiptHash = receiptHash(manualReceipt);

  return {
    schemaVersion: 1,
    manualReceipt,
    collections,
  };
}

try {
  const options = readArgs(process.argv.slice(2));
  const bundle = buildBundle(options);
  const output = `${JSON.stringify(bundle, null, 2)}\n`;
  if (!options.checkOnly) {
    fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
    fs.writeFileSync(options.outputPath, output, 'utf8');
  }
  console.log(JSON.stringify({
    status: 'PASS',
    mode: manualAdmissionMode,
    approvedAt: bundle.manualReceipt.approvedAt,
    collections: bundle.collections.length,
    output: options.checkOnly ? null : options.outputPath,
    bundleHash: bundle.manualReceipt.bundleHash,
    receiptHash: bundle.manualReceipt.receiptHash,
    automaticGates: bundle.manualReceipt.automaticGates.pending,
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
