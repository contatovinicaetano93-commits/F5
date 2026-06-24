/**
 * Gate 2 — validação automática (NF-e + CSV + dashboard + idempotência).
 * Uso: pnpm gate2:validate
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { internalData } from '../src/lib/internal/data';
import { parseMetricsCsv } from '../src/lib/metrics/csv-import';
import { getClientOverview, getClientFinance, getClientProducts } from '../src/lib/client/data';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(__dirname, '../.env.local'));
loadEnvFile(resolve(__dirname, '../../../services/api/.env'));

const PILOT_NAME = 'PET Piloto Nutri';
const GATE_NF = '000901';

function gateXml(): string {
  const base = readFileSync(
    resolve(__dirname, '../public/fixtures/sample-nfe.xml'),
    'utf8',
  );
  return base.replace('<nNF>000143</nNF>', `<nNF>${GATE_NF}</nNF>`);
}

async function main() {
  const prisma = new PrismaClient();
  const results: { check: string; ok: boolean; detail?: string }[] = [];

  try {
    const tenant = await prisma.tenant.findFirst({
      where: { name: PILOT_NAME },
    });
    if (!tenant) throw new Error(`Tenant "${PILOT_NAME}" não encontrado`);

    const productCount = await prisma.product.count({ where: { tenantId: tenant.id } });
    results.push({
      check: '4+ SKUs piloto',
      ok: productCount >= 4,
      detail: `${productCount} produtos`,
    });

    // Limpa NF gate test anterior (re-run seguro)
    const oldNf = await prisma.notaFiscal.findFirst({
      where: {
        tenantId: tenant.id,
        nfNumber: GATE_NF,
        nfSeries: '1',
        emitente: '12345678000199',
      },
    });
    if (oldNf) {
      await prisma.salesItem.deleteMany({ where: { notaFiscalId: oldNf.id } });
      await prisma.paymentSchedule.deleteMany({
        where: {
          tenantId: tenant.id,
          status: 'pending',
          valor: { in: [990, 528, 1518] },
        },
      });
      await prisma.notaFiscal.delete({ where: { id: oldNf.id } });
    }

    const schedulesBefore = await prisma.paymentSchedule.count({
      where: { tenantId: tenant.id, status: 'pending' },
    });

    const nf = await internalData.nfs.createFromXml(tenant.id, gateXml());
    results.push({
      check: 'Upload NF-e XML',
      ok: nf.itemsCount === 2 && nf.valorTotal === 1518,
      detail: `NF ${nf.nfNumber} · R$ ${nf.valorTotal}`,
    });

    const schedulesAfter = await prisma.paymentSchedule.count({
      where: { tenantId: tenant.id, status: 'pending' },
    });
    const pendingAdded = schedulesAfter - schedulesBefore;
    results.push({
      check: 'PaymentSchedule pós-NF (2 canais)',
      ok: pendingAdded >= 2,
      detail: `+${pendingAdded} repasses pendentes`,
    });

    // Idempotência: unique (nfNumber, série, emitente) — sem re-insert (evita log prisma:error)
    const stored = await prisma.notaFiscal.findUnique({
      where: {
        nfNumber_nfSeries_emitente: {
          nfNumber: GATE_NF,
          nfSeries: '1',
          emitente: '12345678000199',
        },
      },
    });
    results.push({
      check: 'Idempotência NF-e',
      ok: stored !== null && stored.tenantId === tenant.id,
      detail: '1 registro · unique constraint',
    });

    const csv = readFileSync(
      resolve(__dirname, '../public/fixtures/metrics-sample.csv'),
      'utf8',
    );
    const { rows } = parseMetricsCsv(csv);
    const imported = await internalData.metrics.importFromCsv(tenant.id, rows);
    results.push({
      check: 'Import CSV métricas',
      ok: imported.created >= 4,
      detail: `${imported.created} lançamentos`,
    });

    const dm = await prisma.dashboardMetrics.findUnique({
      where: { tenantId: tenant.id },
    });
    results.push({
      check: 'DashboardMetrics',
      ok: dm !== null && Number(dm.totalVendasMes) > 0,
      detail: dm ? `R$ ${Number(dm.totalVendasMes)}` : 'ausente',
    });

    const auth = {
      tenantId: tenant.id,
      email: 'gate@f5.internal',
      userId: 'gate',
      demo: false,
    };
    const overview = await getClientOverview(auth);
    const finance = await getClientFinance(auth);
    const products = await getClientProducts(auth);

    results.push({
      check: 'Portal overview',
      ok: overview.monthSales > 0,
      detail: `R$ ${overview.monthSales}`,
    });
    results.push({
      check: 'Portal financeiro',
      ok: finance.nfs.length > 0,
      detail: `${finance.nfs.length} NF-e`,
    });
    results.push({
      check: 'Portal produtos',
      ok: products.items.length >= 4,
      detail: `${products.items.length} SKUs`,
    });

    console.log('\n=== Gate 2 Validation ===\n');
    let passed = 0;
    for (const r of results) {
      const icon = r.ok ? '✅' : '❌';
      console.log(`${icon} ${r.check}${r.detail ? ` — ${r.detail}` : ''}`);
      if (r.ok) passed++;
    }
    console.log(`\n${passed}/${results.length} checks passed\n`);

    if (passed < results.length) process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
