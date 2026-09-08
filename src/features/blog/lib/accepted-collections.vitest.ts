import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDiscoveryItem } from '@/features/storefront/lib/discovery-pilot';
import {
  computeAcceptedCollectionHash,
  computeManualAdmissionReceiptHash,
  computeManualReleaseBundleHash,
  computeManualReleaseReceiptHash,
  getAcceptedCollections,
  MANUAL_OWNER_ADMISSION_MODE,
  MANUAL_OWNER_REVIEW_STATUS,
  parseAcceptedCollections,
  type AcceptedCollectionRecord,
  type ManualReleaseReceipt,
} from './accepted-collections';

let temporaryDirectory: string | undefined;

afterEach(() => {
  vi.unstubAllEnvs();
  if (temporaryDirectory) fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  temporaryDirectory = undefined;
});

function writeOverride(value: unknown): string {
  temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'trendingnow-accepted-'));
  const filePath = path.join(temporaryDirectory, 'accepted.json');
  fs.writeFileSync(filePath, typeof value === 'string' ? value : JSON.stringify(value), 'utf8');
  return filePath;
}

function validRecord(overrides: Partial<AcceptedCollectionRecord> = {}): AcceptedCollectionRecord {
  const product = getDiscoveryItem('find-pcshop-1');
  if (!product) throw new Error('fixture product missing');

  const payload = {
    slug: 'workspace-choice',
    title: 'სამუშაო სივრცის ზუსტი არჩევანი',
    excerpt: 'ერთი კონკრეტული არჩევანი სამუშაო მაგიდისთვის.',
    bodyMarkdown: '## რატომ ეს მოდელი\n\nშეზღუდვები წყაროს მიხედვით.',
    category: 'სამუშაო სივრცე',
    tags: ['სამუშაო'],
    productIDs: [product.id],
    sourceURLs: [product.productUrl],
    sourceDate: '2026-09-08',
    disclosure: 'სარედაქციო ბმული; მარაგი და საბოლოო პირობები გადაამოწმე გამყიდველთან.',
    translations: undefined,
  };
  const hash = computeAcceptedCollectionHash(payload);
  return {
    schemaVersion: 1,
    status: 'READY',
    reviewStatus: 'accepted',
    reviewedAt: '2026-09-08T12:00:00.000Z',
    contentHash: hash,
    reviewedHash: hash,
    ...payload,
    ...overrides,
  };
}

function manualRecord(): AcceptedCollectionRecord {
  const automatic = validRecord();
  const withoutAutomaticReceipt = { ...automatic, reviewedHash: undefined };
  const record = {
    ...withoutAutomaticReceipt,
    status: 'OWNER_AUTHORIZED' as const,
    reviewStatus: MANUAL_OWNER_REVIEW_STATUS,
    reviewedAt: '2026-09-08T13:41:13.683Z',
  };
  const manualAdmission = {
    schemaVersion: 1 as const,
    mode: MANUAL_OWNER_ADMISSION_MODE,
    approvedAt: record.reviewedAt,
    approvedBy: 'owner',
    approvalReason: 'Bounded owner-authorized manual admission for a test fixture.',
    automaticGateStatus: 'HOLD' as const,
    pendingAutomaticGates: ['contentSafety:PENDING'],
    sourceArticleSha256: 'b'.repeat(64),
    selectionRowSha256: 'b'.repeat(64),
    contentHash: '',
    receiptHash: '',
  };
  const contentHash = computeAcceptedCollectionHash(record);
  manualAdmission.contentHash = contentHash;
  manualAdmission.receiptHash = computeManualAdmissionReceiptHash(manualAdmission);
  return { ...record, contentHash, manualAdmission };
}

function manualBundle(record = manualRecord()): { schemaVersion: 1; manualReceipt: ManualReleaseReceipt; collections: AcceptedCollectionRecord[] } {
  const collections = [record];
  const receiptWithoutHash: Omit<ManualReleaseReceipt, 'receiptHash'> = {
    schemaVersion: 1,
    mode: MANUAL_OWNER_ADMISSION_MODE,
    approvedAt: record.reviewedAt,
    approvedBy: 'owner',
    decision: 'publish_selected_collections',
    selection: {
      path: 'selection.json',
      sha256: 'c'.repeat(64),
      selectedCount: 1,
      preservedCount: 1,
      supportingCount: 0,
      selectedSlugs: [record.slug],
    },
    sourceSnapshot: {
      path: 'source-register.json',
      sha256: 'd'.repeat(64),
      sourceDate: record.sourceDate,
    },
    automaticGates: {
      status: 'HOLD',
      evidencePath: 'gate-status.json',
      evidenceSha256: 'e'.repeat(64),
      pending: [{ name: 'contentSafety', status: 'PENDING' }],
    },
    expectedCollectionCount: 1,
    collectionSlugs: [record.slug],
    bundleHash: computeManualReleaseBundleHash(collections),
  };
  return {
    schemaVersion: 1,
    manualReceipt: {
      ...receiptWithoutHash,
      receiptHash: computeManualReleaseReceiptHash(receiptWithoutHash),
    },
    collections,
  };
}

describe('accepted curated collection admission', () => {
  it('accepts a hash-bound record without translations and keeps the same hash when undefined is omitted', () => {
    const record = validRecord();
    const omittedTranslations = { ...record } as Partial<AcceptedCollectionRecord>;
    delete omittedTranslations.translations;

    expect(computeAcceptedCollectionHash(record)).toBe(computeAcceptedCollectionHash(omittedTranslations as AcceptedCollectionRecord));
    expect(parseAcceptedCollections([omittedTranslations])).toHaveLength(1);
  });

  it('rejects a changed body when the reviewed hash is not regenerated', () => {
    const record = validRecord({ bodyMarkdown: '## შეცვლილი ტექსტი' });
    expect(parseAcceptedCollections([record])).toEqual([]);
  });

  it('keeps valid records in a mixed file while dropping HOLD and unknown-product records', () => {
    const ready = validRecord();
    const hold = { ...ready, slug: 'held-choice', status: 'HOLD' };
    const unknown = { ...ready, slug: 'unknown-choice', productIDs: ['missing-product'] };

    expect(parseAcceptedCollections([hold, unknown, ready])).toEqual([ready]);
    expect(parseAcceptedCollections({ schemaVersion: 1, collections: [hold, ready] })).toEqual([ready]);
  });

  it('requires every exact product source URL to be present in the reviewed source list', () => {
    const record = validRecord({ sourceURLs: ['https://example.com/other-source'] });
    expect(parseAcceptedCollections([record])).toEqual([]);
  });

  it('uses only bundled data in production, even when an absolute override is set', async () => {
    const filePath = writeOverride([validRecord()]);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('TRENDINGNOW_ACCEPTED_COLLECTION_FILE', filePath);

    const collections = await getAcceptedCollections();
    expect(collections).toHaveLength(35);
    expect(collections[0]?.slug).toBe('buyer-decision-log-20260907');
  });

  it('loads a valid override only in development and keeps HOLD out of public collections', async () => {
    const ready = validRecord();
    const hold = { ...ready, slug: 'held-choice', status: 'HOLD' };
    const filePath = writeOverride([hold, ready]);
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('TRENDINGNOW_ACCEPTED_COLLECTION_FILE', filePath);

    await expect(getAcceptedCollections()).resolves.toHaveLength(1);
    await expect(getAcceptedCollections()).resolves.toMatchObject([{ slug: ready.slug }]);
  });

  it('fails closed on a malformed development override instead of falling back silently', async () => {
    const filePath = writeOverride('{"collections":');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('TRENDINGNOW_ACCEPTED_COLLECTION_FILE', filePath);

    await expect(getAcceptedCollections()).resolves.toEqual([]);
  });

  it('accepts an explicit owner manual receipt while preserving the HOLD automatic-gate status', () => {
    const bundle = manualBundle();

    expect(parseAcceptedCollections(bundle)).toEqual(bundle.collections);
    expect(bundle.manualReceipt.automaticGates.status).toBe('HOLD');
    expect(bundle.collections[0].status).toBe('OWNER_AUTHORIZED');
    expect(bundle.collections[0].reviewStatus).toBe(MANUAL_OWNER_REVIEW_STATUS);
  });

  it('rejects a manual record without a valid top-level receipt', () => {
    const bundle = manualBundle();

    expect(parseAcceptedCollections(bundle.collections)).toEqual([]);
    expect(parseAcceptedCollections({ schemaVersion: 1, collections: bundle.collections })).toEqual([]);
  });

  it('rejects a tampered manual body, per-record receipt, or bundle receipt', () => {
    const bundle = manualBundle();
    const bodyTampered = { ...bundle, collections: [{ ...bundle.collections[0], bodyMarkdown: 'tampered' }] };
    const recordReceiptTampered = {
      ...bundle,
      collections: [{ ...bundle.collections[0], manualAdmission: { ...bundle.collections[0].manualAdmission!, receiptHash: 'f'.repeat(64) } }],
    };
    const bundleReceiptTampered = { ...bundle, manualReceipt: { ...bundle.manualReceipt, bundleHash: 'f'.repeat(64) } };

    expect(parseAcceptedCollections(bodyTampered)).toEqual([]);
    expect(parseAcceptedCollections(recordReceiptTampered)).toEqual([]);
    expect(parseAcceptedCollections(bundleReceiptTampered)).toEqual([]);
  });

  it('does not treat READY or automatic accepted as a manual admission', () => {
    const bundle = manualBundle();
    const wrongStatus = { ...bundle, collections: [{ ...bundle.collections[0], status: 'READY' as const }] };
    const wrongReview = { ...bundle, collections: [{ ...bundle.collections[0], reviewStatus: 'accepted' as const }] };

    expect(parseAcceptedCollections(wrongStatus)).toEqual([]);
    expect(parseAcceptedCollections(wrongReview)).toEqual([]);
  });
});
