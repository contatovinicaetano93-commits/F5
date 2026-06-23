import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  await prisma.insightNote.deleteMany();
  await prisma.productMetric.deleteMany();
  await prisma.product.deleteMany();
  await prisma.paymentSchedule.deleteMany();
  await prisma.dashboardMetrics.deleteMany();
  await prisma.salesItem.deleteMany();
  await prisma.notaFiscal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'Indústria Pet — Piloto A',
        segment: 'PET',
        scenario: 'AMAZON_1P',
        status: 'active',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Indústria Pet — Piloto B',
        segment: 'PET',
        scenario: 'BRACO_ONLINE',
        status: 'trial',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Indústria Saúde — Piloto',
        segment: 'SAUDE',
        scenario: 'BRACO_ONLINE',
        status: 'active',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Indústria Papel — Piloto',
        segment: 'PAPEL',
        scenario: 'BRACO_ONLINE',
        status: 'active',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Ferramentas — Prospect',
        segment: 'PARAFUSO',
        scenario: 'BRACO_ONLINE',
        status: 'inactive',
      },
    }),
  ]);

  const [petA, petB, saude, papel] = tenants;

  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId: petA.id,
        sku: 'PET-RA-001',
        name: 'Ração premium aves 1kg',
        category: 'Alimentação',
        marketplace: 'amazon',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: petA.id,
        sku: 'PET-SN-002',
        name: 'Snack natural pet 500g',
        category: 'Alimentação',
        marketplace: 'mercado_livre',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: petB.id,
        sku: 'PET-EX-010',
        name: 'Extrusado pequenos animais 2kg',
        category: 'Alimentação',
        marketplace: 'mercado_livre',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: saude.id,
        sku: 'SAU-EPI-001',
        name: 'Kit EPI descartável',
        category: 'EPI',
        marketplace: 'mercado_livre',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: papel.id,
        sku: 'PAP-RES-100',
        name: 'Resma A4 75g 500fl',
        category: 'Papelaria',
        marketplace: 'mercado_livre',
      },
    }),
  ]);

  const [prodPetA1, , prodPetB1] = products;
  const periodStart = weekStart();
  const periodEnd = new Date();

  await prisma.productMetric.createMany({
    data: [
      {
        tenantId: petA.id,
        productId: prodPetA1.id,
        marketplace: 'amazon',
        periodStart,
        periodEnd,
        impressions: 12400,
        visits: 890,
        unitsSold: 42,
        revenue: 8316,
        searchPosition: 8,
        conversionRate: 0.047,
      },
      {
        tenantId: petB.id,
        productId: prodPetB1.id,
        marketplace: 'mercado_livre',
        periodStart,
        periodEnd,
        impressions: 3200,
        visits: 210,
        unitsSold: 8,
        revenue: 1440,
        searchPosition: 22,
        conversionRate: 0.038,
        notes: 'Giro abaixo da meta — revisar preço e fotos',
      },
    ],
  });

  await prisma.insightNote.createMany({
    data: [
      {
        tenantId: petB.id,
        productId: prodPetB1.id,
        title: 'Giro baixo na semana',
        body: 'Conversão caiu 12% vs semana anterior. Concorrência na primeira página com preço 8% menor. Sugestão: ajustar título + testar preço promocional.',
        visibleToClient: true,
        weekOf: periodStart,
      },
      {
        tenantId: petA.id,
        productId: prodPetA1.id,
        title: 'Posição estável Amazon',
        body: 'SKU mantém top 10 na busca principal. Manter estoque e monitorar sazonalidade.',
        visibleToClient: false,
        weekOf: periodStart,
      },
    ],
  });

  const operator = await prisma.user.create({
    data: {
      email: 'ops@f5.internal',
      password: 'hashed_password_stub',
      name: 'Operador F5',
      role: 'operator',
    },
  });

  const nfDate = new Date(Date.now() - 2 * 86400000);
  await prisma.notaFiscal.create({
    data: {
      userId: operator.id,
      tenantId: petA.id,
      nfNumber: '000142',
      nfSeries: '1',
      nfDate,
      emitente: '00.000.000/0001-00',
      destinatario: '00.000.000/0002-00',
      valorTotal: 4280.5,
      valorBaseIcms: 3500,
      valorIcms: 630,
      xmlContent: '<xml>seed</xml>',
      processedAt: new Date(),
      items: {
        create: [
          {
            sku: 'PET-RA-001',
            descricao: 'Ração premium aves 1kg',
            quantidade: 3,
            valorUnitario: 198,
            valorTotal: 594,
            marketplace: 'amazon',
          },
        ],
      },
    },
  });

  console.log(`✅ Seed: ${tenants.length} tenants, ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
