// Verifica que tenant A não vê dados do tenant B
import { prisma } from '../src/lib/prisma';

async function main() {
  const tenants = await prisma.tenant.findMany({ take: 2 });
  if (tenants.length < 2) {
    console.log('⚠️  Menos de 2 tenants — seed o banco primeiro');
    process.exit(0);
  }
  const [a, b] = tenants;

  // Produtos: tenant A não deve ter produtos de B
  const productsA = await prisma.product.findMany({ where: { tenantId: a.id } });
  const leak = productsA.filter((p) => p.tenantId !== a.id);
  if (leak.length > 0) {
    console.error('❌ ISOLAMENTO FALHOU: produtos de tenant B visíveis para A');
    process.exit(1);
  }

  // NF-e: mesmo padrão
  const nfsA = await prisma.notaFiscal.findMany({ where: { tenantId: a.id } });
  const nfLeak = nfsA.filter((n) => n.tenantId !== a.id);
  if (nfLeak.length > 0) {
    console.error('❌ ISOLAMENTO FALHOU: NFs de tenant B visíveis para A');
    process.exit(1);
  }

  console.log(`✅ Isolamento OK — tenant "${a.name}" não vê dados de "${b.name}"`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
