import 'server-only';

import crypto from 'node:crypto';
import { z } from 'zod';

import bundledAcceptedCollections from '../data/accepted-collections.json';
import { addCuratedHeadingIds, curatedProductFromDiscoveryId, type CuratedCollectionContent, type CuratedCollectionProduct } from './curated-content';
import { renderEditorialMarkdown } from './editorial-drafts';
import type { BlogLocale } from './locales';

/**
 * Public curated content is intentionally a separate admission path from
 * legacy MDX. The producer must freeze the text and product mapping first,
 * then record the exact content hash in both fields below.
 */
export const ACCEPTED_COLLECTION_SCHEMA_VERSION = 1 as const;
export const MANUAL_ADMISSION_SCHEMA_VERSION = 1 as const;
export const MANUAL_RELEASE_RECEIPT_SCHEMA_VERSION = 1 as const;
export const MANUAL_OWNER_REVIEW_STATUS = 'owner_manual' as const;
export const MANUAL_OWNER_ADMISSION_MODE = 'owner_authorized_manual' as const;

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const httpsUrl = z.string().url().refine((value) => value.startsWith('https://'));

const localizedContentSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  bodyMarkdown: z.string().min(1),
});

const manualAdmissionSchema = z.object({
  schemaVersion: z.literal(MANUAL_ADMISSION_SCHEMA_VERSION),
  mode: z.literal(MANUAL_OWNER_ADMISSION_MODE),
  approvedAt: z.iso.datetime(),
  approvedBy: z.string().min(1),
  approvalReason: z.string().min(1),
  automaticGateStatus: z.literal('HOLD'),
  pendingAutomaticGates: z.array(z.string().min(1)).min(1),
  sourceArticleSha256: sha256,
  selectionRowSha256: sha256,
  contentHash: sha256,
  receiptHash: sha256,
}).strict();

const manualReleaseReceiptSchema = z.object({
  schemaVersion: z.literal(MANUAL_RELEASE_RECEIPT_SCHEMA_VERSION),
  mode: z.literal(MANUAL_OWNER_ADMISSION_MODE),
  approvedAt: z.iso.datetime(),
  approvedBy: z.string().min(1),
  decision: z.literal('publish_selected_collections'),
  selection: z.object({
    path: z.string().min(1),
    sha256,
    selectedCount: z.number().int().positive(),
    preservedCount: z.number().int().positive(),
    supportingCount: z.number().int().nonnegative(),
    selectedSlugs: z.array(slug).min(1),
  }).strict(),
  sourceSnapshot: z.object({
    path: z.string().min(1),
    sha256,
    sourceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).strict(),
  automaticGates: z.object({
    status: z.literal('HOLD'),
    evidencePath: z.string().min(1),
    evidenceSha256: sha256,
    pending: z.array(z.object({
      name: z.string().min(1),
      status: z.string().min(1),
    }).strict()).min(1),
  }).strict(),
  expectedCollectionCount: z.number().int().positive(),
  collectionSlugs: z.array(slug).min(1),
  bundleHash: sha256,
  receiptHash: sha256,
}).strict();

/** Input contract supplied by the content/admission worker. */
export const acceptedCollectionSchema = z.object({
  schemaVersion: z.literal(ACCEPTED_COLLECTION_SCHEMA_VERSION),
  slug,
  status: z.union([z.literal('READY'), z.literal('OWNER_AUTHORIZED')]),
  reviewStatus: z.union([z.literal('accepted'), z.literal(MANUAL_OWNER_REVIEW_STATUS)]),
  reviewedAt: z.iso.datetime(),
  /** SHA-256 of the canonical payload below at the time of review. */
  contentHash: sha256,
  /** Independent review receipt binds automatic acceptance to the same payload. */
  reviewedHash: sha256.optional(),
  /** Manual owner admission is explicit and never inferred from READY alone. */
  manualAdmission: manualAdmissionSchema.optional(),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).max(24),
  productIDs: z.array(z.string().min(1)).min(1),
  sourceURLs: z.array(httpsUrl).min(1),
  sourceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  disclosure: z.string().min(1),
  translations: z.object({
    ka: localizedContentSchema.optional(),
    en: localizedContentSchema.optional(),
    ru: localizedContentSchema.optional(),
  }).optional(),
}).strict();

export type AcceptedCollectionRecord = z.infer<typeof acceptedCollectionSchema>;
export type ManualAdmission = z.infer<typeof manualAdmissionSchema>;
export type ManualReleaseReceipt = z.infer<typeof manualReleaseReceiptSchema>;

export type AcceptedCollectionProduct = CuratedCollectionProduct;

export type AcceptedCollection = Omit<AcceptedCollectionRecord, keyof CuratedCollectionContent> & CuratedCollectionContent;

const acceptedFileSchema = z.union([
  z.array(z.unknown()),
  z.object({
    schemaVersion: z.literal(ACCEPTED_COLLECTION_SCHEMA_VERSION),
    collections: z.array(z.unknown()),
    manualReceipt: manualReleaseReceiptSchema.optional(),
  }).strict(),
]);

export type AcceptedCollectionHashPayload = Pick<AcceptedCollectionRecord,
  'slug' | 'title' | 'excerpt' | 'bodyMarkdown' | 'category' | 'tags' |
  'productIDs' | 'sourceURLs' | 'sourceDate' | 'disclosure' | 'translations'>;

export type ManualAdmissionHashPayload = Omit<ManualAdmission, 'receiptHash'>;
export type ManualReleaseReceiptHashPayload = Omit<ManualReleaseReceipt, 'receiptHash'>;

/**
 * Keep hash construction explicit and stable. Do not include review metadata:
 * changing a timestamp must not silently change the reviewed content itself.
 */
export function canonicalAcceptedCollectionPayload(
  value: AcceptedCollectionHashPayload,
): AcceptedCollectionHashPayload {
  return {
    slug: value.slug,
    title: value.title,
    excerpt: value.excerpt,
    bodyMarkdown: value.bodyMarkdown,
    category: value.category,
    tags: value.tags,
    productIDs: value.productIDs,
    sourceURLs: value.sourceURLs,
    sourceDate: value.sourceDate,
    disclosure: value.disclosure,
    translations: value.translations,
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().flatMap((key) => {
      const entry = (value as Record<string, unknown>)[key];
      return entry === undefined ? [] : [`${JSON.stringify(key)}:${stableJson(entry)}`];
    }).join(',')}}`;
  }
  return value === undefined ? 'null' : JSON.stringify(value);
}

export function computeAcceptedCollectionHash(value: AcceptedCollectionHashPayload): string {
  return crypto
    .createHash('sha256')
    .update(stableJson(canonicalAcceptedCollectionPayload(value)), 'utf8')
    .digest('hex');
}

export function computeManualAdmissionReceiptHash(value: ManualAdmissionHashPayload | ManualAdmission): string {
  const payload = { ...value, receiptHash: undefined };
  return crypto
    .createHash('sha256')
    .update(stableJson(payload), 'utf8')
    .digest('hex');
}

function canonicalManualReleaseReceiptPayload(value: ManualReleaseReceiptHashPayload | ManualReleaseReceipt): ManualReleaseReceiptHashPayload {
  return {
    schemaVersion: value.schemaVersion,
    mode: value.mode,
    approvedAt: value.approvedAt,
    approvedBy: value.approvedBy,
    decision: value.decision,
    selection: value.selection,
    sourceSnapshot: value.sourceSnapshot,
    automaticGates: value.automaticGates,
    expectedCollectionCount: value.expectedCollectionCount,
    collectionSlugs: value.collectionSlugs,
    bundleHash: value.bundleHash,
  };
}

export function computeManualReleaseReceiptHash(value: ManualReleaseReceiptHashPayload | ManualReleaseReceipt): string {
  return crypto
    .createHash('sha256')
    .update(stableJson(canonicalManualReleaseReceiptPayload(value)), 'utf8')
    .digest('hex');
}

export function computeManualReleaseBundleHash(records: AcceptedCollectionRecord[]): string {
  return crypto
    .createHash('sha256')
    .update(stableJson(records.map((record) => ({
      slug: record.slug,
      contentHash: record.contentHash,
      manualAdmissionReceiptHash: record.manualAdmission?.receiptHash ?? null,
      sourceArticleSha256: record.manualAdmission?.sourceArticleSha256 ?? null,
    }))), 'utf8')
    .digest('hex');
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.href.replace(/\/$/, '');
  } catch {
    return value;
  }
}

function exactProducts(record: AcceptedCollectionRecord): AcceptedCollectionProduct[] | null {
  const productIDs = new Set(record.productIDs);
  if (productIDs.size !== record.productIDs.length) return null;

  const sourceURLs = new Set(record.sourceURLs.map(normalizeUrl));
  const products = record.productIDs.map((id) => curatedProductFromDiscoveryId(id));
  if (products.some((item) => !item || !sourceURLs.has(normalizeUrl(item.productUrl)))) {
    return null;
  }
  return products as AcceptedCollectionProduct[];
}

function parseAcceptedRecord(value: unknown): AcceptedCollectionRecord | null {
  const parsed = acceptedCollectionSchema.safeParse(value);
  if (!parsed.success) return null;
  const record = parsed.data;
  if (record.reviewStatus === 'accepted') {
    if (record.status !== 'READY' || record.manualAdmission || !record.reviewedHash || record.contentHash !== record.reviewedHash) return null;
  } else {
    const manual = record.manualAdmission;
    if (record.status !== 'OWNER_AUTHORIZED' || !manual || record.reviewedHash || manual.approvedAt !== record.reviewedAt) return null;
    if (manual.contentHash !== record.contentHash) return null;
    if (manual.sourceArticleSha256 !== manual.selectionRowSha256) return null;
    if (computeManualAdmissionReceiptHash(manual) !== manual.receiptHash) return null;
  }
  if (computeAcceptedCollectionHash(record) !== record.contentHash) return null;
  if (!exactProducts(record)) return null;
  return record;
}

function sameStrings(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hasValidManualReleaseReceipt(
  records: AcceptedCollectionRecord[],
  receipt: ManualReleaseReceipt | undefined,
): boolean {
  if (!receipt || computeManualReleaseReceiptHash(receipt) !== receipt.receiptHash) return false;
  const slugs = records.map((record) => record.slug);
  if (receipt.expectedCollectionCount !== records.length) return false;
  if (!sameStrings(receipt.collectionSlugs, slugs)) return false;
  if (receipt.selection.selectedCount !== records.length) return false;
  if (!sameStrings(receipt.selection.selectedSlugs, slugs)) return false;
  if (receipt.selection.selectedCount + receipt.selection.supportingCount !== receipt.selection.preservedCount) return false;
  if (receipt.sourceSnapshot.sourceDate !== records[0]?.sourceDate) return false;
  if (records.some((record) => {
    const manual = record.manualAdmission;
    return record.reviewStatus !== MANUAL_OWNER_REVIEW_STATUS
      || !manual
      || manual.mode !== receipt.mode
      || manual.approvedAt !== receipt.approvedAt
      || manual.approvedBy !== receipt.approvedBy
      || record.sourceDate !== receipt.sourceSnapshot.sourceDate;
  })) return false;
  return computeManualReleaseBundleHash(records) === receipt.bundleHash;
}

/** Pure parser used by the loader and admission-boundary tests. */
export function parseAcceptedCollections(value: unknown): AcceptedCollectionRecord[] {
  const parsed = acceptedFileSchema.safeParse(value);
  if (!parsed.success) return [];
  const values = Array.isArray(parsed.data) ? parsed.data : parsed.data.collections;
  const manualReceipt = Array.isArray(parsed.data) ? undefined : parsed.data.manualReceipt;
  const seen = new Set<string>();
  const records = values.flatMap((value) => {
    const record = parseAcceptedRecord(value);
    if (!record || seen.has(record.slug)) return [];
    seen.add(record.slug);
    return [record];
  });
  const hasManualRecords = records.some((record) => record.reviewStatus === MANUAL_OWNER_REVIEW_STATUS);
  if (hasManualRecords && !hasValidManualReleaseReceipt(records, manualReceipt)) return [];
  return records;
}

async function readAcceptedRecords(): Promise<AcceptedCollectionRecord[]> {
  // Production must remain a static-data path. The optional filesystem
  // override is loaded only by the development-only adapter below, so Next's
  // standalone trace cannot expand to the whole workspace.
  if (process.env.NODE_ENV === 'development' && process.env.TRENDINGNOW_ACCEPTED_COLLECTION_FILE) {
    const { readDevelopmentAcceptedOverride } = await import('./accepted-collections-dev');
    const override = readDevelopmentAcceptedOverride(process.env.TRENDINGNOW_ACCEPTED_COLLECTION_FILE);
    return override === undefined ? [] : parseAcceptedCollections(override);
  }
  return parseAcceptedCollections(bundledAcceptedCollections);
}

function localizedRecord(record: AcceptedCollectionRecord, locale: BlogLocale): Pick<AcceptedCollectionRecord, 'title' | 'excerpt' | 'bodyMarkdown'> & { isFallback: boolean } {
  const translation = record.translations?.[locale];
  if (translation) return { ...translation, isFallback: false };
  return {
    title: record.title,
    excerpt: record.excerpt,
    bodyMarkdown: record.bodyMarkdown,
    isFallback: locale !== 'ka',
  };
}

function toAcceptedCollection(record: AcceptedCollectionRecord, locale: BlogLocale): AcceptedCollection | null {
  const products = exactProducts(record);
  if (!products) return null;
  const localized = localizedRecord(record, locale);
  return {
    ...record,
    ...localized,
    locale,
    isFallback: localized.isFallback,
    products,
    renderedBody: addCuratedHeadingIds(renderEditorialMarkdown(localized.bodyMarkdown)),
  };
}

export async function getAcceptedCollections(locale: BlogLocale = 'ka'): Promise<AcceptedCollection[]> {
  return (await readAcceptedRecords()).flatMap((record) => {
    const collection = toAcceptedCollection(record, locale);
    return collection ? [collection] : [];
  });
}

export async function getAcceptedCollectionBySlug(
  slugValue: string,
  locale: BlogLocale = 'ka',
): Promise<AcceptedCollection | undefined> {
  const record = (await readAcceptedRecords()).find((candidate) => candidate.slug === slugValue);
  return record ? (toAcceptedCollection(record, locale) ?? undefined) : undefined;
}

export async function getAcceptedCollectionLocales(slugValue: string): Promise<BlogLocale[]> {
  const record = (await readAcceptedRecords()).find((candidate) => candidate.slug === slugValue);
  if (!record) return [];
  return (['ka', 'en', 'ru'] as BlogLocale[]).filter((locale) => locale === 'ka' || Boolean(record.translations?.[locale]));
}
