/**
 * Onboard idempotente de tenant piloto.
 * Uso: pnpm onboard:tenant -- --name "PET Piloto Nutri" --segment PET
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

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

loadEnvFile(resolve(__dirname, '../../../services/api/.env'));

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const name = arg('--name') ?? 'PET Piloto Nutri';
  const segment = (arg('--segment') ?? 'PET') as 'PET' | 'SAUDE' | 'PAPEL' | 'PARAFUSO';
  const scenario = arg('--scenario') ?? 'AMAZON_1P';

  const prisma = new PrismaClient();
  try {
    let tenant = await prisma.tenant.findFirst({ where: { name } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name, segment, scenario, status: 'active' },
      });
      console.log(`✅ Tenant criado: ${tenant.id}`);
    } else {
      console.log(`ℹ️  Tenant existente: ${tenant.id}`);
    }

    const skuCount = await prisma.product.count({ where: { tenantId: tenant.id } });
    console.log(`   SKUs: ${skuCount}`);
    console.log(`\nPróximo: pnpm db:seed:pilot · criar user Supabase · pnpm gate1:validate`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
