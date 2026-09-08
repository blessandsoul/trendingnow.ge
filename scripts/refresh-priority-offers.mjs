import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED_PILOT_ROW_COUNT,
  refreshOffers,
  summarizeFailures,
} from './offer-refresh-lib.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(scriptDir, '..');
const defaultCatalogPath = path.join(clientDir, 'src', 'features', 'storefront', 'data', 'discovery-pilot.json');

function usage() {
  return [
    'Usage: node scripts/refresh-priority-offers.mjs --output <new-absolute-directory>',
    '',
    'Reads discovery-pilot.json and performs read-only public GET requests.',
    'The output directory must be an absolute path that does not already exist.',
    'No catalog, React, or existing refresh script is written.',
    '',
    'Options:',
    '  --output <path>       Required new absolute output directory.',
    '  --catalog <path>      Optional absolute catalog path (read-only).',
    '  --timeout-ms <n>      Per-request timeout, default 25000.',
    '  --help                Show this help.',
  ].join('\n');
}

export function parseArgs(argv) {
  const args = { output: null, catalog: defaultCatalogPath, timeoutMs: 25_000 };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') return { help: true };
    if (argument === '--output' || argument === '--catalog' || argument === '--timeout-ms') {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a value.`);
      if (argument === '--output') args.output = value;
      if (argument === '--catalog') args.catalog = value;
      if (argument === '--timeout-ms') args.timeoutMs = Number(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (!args.output) throw new Error('--output is required.');
  if (!path.isAbsolute(args.output)) throw new Error('--output must be an absolute path.');
  if (fs.existsSync(args.output)) throw new Error(`Refusing to overwrite existing output path: ${args.output}`);
  if (!path.isAbsolute(args.catalog)) throw new Error('--catalog must be an absolute path.');
  if (!Number.isInteger(args.timeoutMs) || args.timeoutMs < 1) throw new Error('--timeout-ms must be a positive integer.');
  return args;
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog)) throw new Error('discovery-pilot.json must contain an array.');
  if (catalog.length !== EXPECTED_PILOT_ROW_COUNT) throw new Error(`Expected exactly ${EXPECTED_PILOT_ROW_COUNT} pilot rows; found ${catalog.length}.`);
  const ids = new Set();
  for (const item of catalog) {
    if (!item || typeof item !== 'object' || !item.id || !item.merchantSku || !item.productUrl) throw new Error('Every pilot row must have id, merchantSku, and productUrl.');
    if (ids.has(item.id)) throw new Error(`Duplicate pilot id: ${item.id}`);
    ids.add(item.id);
  }
  return catalog;
}

async function writeJson(filePath, value) {
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function run(argv = process.argv.slice(2), { fetchImpl = globalThis.fetch, now = () => new Date() } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    console.log(usage());
    return { help: true };
  }
  const catalog = validateCatalog(JSON.parse(await fsp.readFile(args.catalog, 'utf8')));
  const receipt = await refreshOffers(catalog, {
    fetchImpl,
    timeoutMs: args.timeoutMs,
    maxConcurrency: 3,
    now,
    expectedRowCount: EXPECTED_PILOT_ROW_COUNT,
  });

  // The directory is created only after all public GETs finish and only after the
  // caller supplied a new absolute path. This is the only filesystem write.
  await fsp.mkdir(args.output);
  await writeJson(path.join(args.output, 'receipt.json'), receipt);
  await writeJson(path.join(args.output, 'proposed-updates.json'), receipt.proposedUpdatesJSON);
  const summary = {
    output: args.output,
    receipt: path.join(args.output, 'receipt.json'),
    proposedUpdates: path.join(args.output, 'proposed-updates.json'),
    requestedRowCount: receipt.requestedRowCount,
    validatedRowCount: receipt.validatedRowCount,
    validated18RowCount: receipt.validated18RowCount,
    rejectedRowCount: receipt.rejectedRowCount,
    failures: summarizeFailures(receipt),
    catalogWrites: 0,
    stockVerification: 'UNKNOWN',
  };
  console.log(JSON.stringify(summary, null, 2));
  if (receipt.validatedRowCount !== EXPECTED_PILOT_ROW_COUNT) process.exitCode = 2;
  return { args, catalog, receipt, summary };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
