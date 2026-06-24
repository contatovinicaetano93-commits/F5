/**
 * Testes unitários leves (sem vitest) — parser NF-e + CSV.
 * Uso: pnpm test:unit
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNfXml } from '../src/lib/nf/parser.ts';
import { parseMetricsCsv } from '../src/lib/metrics/csv-import.ts';
import { formatBRL, formatPct } from '@f5/core';

const __dirname = dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;

function assert(name: string, cond: boolean) {
  if (cond) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
}

async function main() {
  const xml = readFileSync(
    resolve(__dirname, '../public/fixtures/sample-nfe.xml'),
    'utf8',
  );
  const nf = await parseNfXml(xml);
  assert('parseNfXml — número NF', nf.nfNumber === '000143');
  assert('parseNfXml — itens', nf.items.length >= 1);
  assert('parseNfXml — valor total', nf.valorTotal > 0);

  const csv = readFileSync(
    resolve(__dirname, '../public/fixtures/metrics-sample.csv'),
    'utf8',
  );
  const { rows, errors } = parseMetricsCsv(csv);
  assert('parseMetricsCsv — linhas', rows.length >= 4);
  assert('parseMetricsCsv — sem erros fatais', errors.length === 0);

  assert('formatBRL', formatBRL(1234.5).includes('1.234'));
  assert('formatPct', formatPct(0.125) === '12.5%');

  console.log(`\n${passed}/${passed + failed} passed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
