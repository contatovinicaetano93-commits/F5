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
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL === '1'
    ) {
      console.error(
        '❌ Seed bloqueado em produção. Para dev local: ALLOW_DESTRUCTIVE_SEED=true pnpm db:seed',
      );
      process.exit(1);
    }
  }

  await prisma.insightNote.deleteMany();
  await prisma.productMetric.deleteMany();
  await prisma.product.deleteMany();
  await prisma.paymentSchedule.deleteMany();
  await prisma.dashboardMetrics.deleteMany();
  await prisma.salesItem.deleteMany();
  await prisma.notaFiscal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  await prisma.user.create({
    data: {
      email: 'operator@f5.internal',
      password: 'no-login',
      name: 'F5 Operador Sistema',
      role: 'operator',
    },
  });

  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'PET Piloto Nutri',
        segment: 'PET',
        scenario: 'AMAZON_1P',
        status: 'active',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'PET Piloto Extru',
        segment: 'PET',
        scenario: 'SOCIO_DIGITAL',
        status: 'active',
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

  const [nutri, extru, saude, papel] = tenants;

  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId: nutri.id,
        sku: 'PET-NP-001',
        name: 'Ração extrusada aves premium 900g',
        category: 'Alimentação',
        marketplace: 'amazon',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: nutri.id,
        sku: 'PET-NP-002',
        name: 'Snack natural aves 500g',
        category: 'Alimentação',
        marketplace: 'mercado_livre',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: nutri.id,
        sku: 'PET-NP-003',
        name: 'Suplemento vitamínico aves 250g',
        category: 'Suplementos',
        marketplace: 'mercado_livre',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: nutri.id,
        sku: 'PET-NP-004',
        name: 'Comedouro automático aves',
        category: 'Acessórios',
        marketplace: 'amazon',
      },
    }),
    prisma.product.create({
      data: {
        tenantId: extru.id,
        sku: 'PET-EX-020',
        name: 'Extrusado pequenos roedores 2kg',
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

  const [prodNutri, prodExtru] = products;
  const periodStart = weekStart();
  const periodEnd = new Date();

  await prisma.productMetric.createMany({
    data: [
      {
        tenantId: nutri.id,
        productId: prodNutri.id,
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
        tenantId: extru.id,
        productId: prodExtru.id,
        marketplace: 'mercado_livre',
        periodStart,
        periodEnd,
        impressions: 5600,
        visits: 380,
        unitsSold: 18,
        revenue: 3240,
        searchPosition: 14,
        conversionRate: 0.047,
        notes: 'Sócio digital — acompanhar split e giro conjunto',
      },
    ],
  });

  await prisma.insightNote.createMany({
    data: [
      {
        tenantId: extru.id,
        productId: prodExtru.id,
        title: 'Giro estável na semana',
        body: 'Conversão estável vs semana anterior. Revisar fotos e descrição para subir posição na busca.',
        visibleToClient: true,
        weekOf: periodStart,
      },
      {
        tenantId: nutri.id,
        productId: prodNutri.id,
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
      tenantId: nutri.id,
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
            sku: 'PET-NP-001',
            descricao: 'Ração extrusada aves premium 900g',
            quantidade: 3,
            valorUnitario: 198,
            valorTotal: 594,
            marketplace: 'amazon',
          },
        ],
      },
    },
  });

  await prisma.paymentSchedule.create({
    data: {
      tenantId: nutri.id,
      marketplace: 'amazon',
      dataRecebimento: new Date(nfDate.getTime() + 60 * 86400000),
      valor: 4280.5,
      status: 'pending',
    },
  });

  /** Senha placeholder — criar o mesmo email/senha no Supabase Auth (Authentication → Users). */
  const PILOT_CLIENT_PASSWORD = 'F5-Piloto-Dev2026!';

  const clientViewers = [
    {
      email: 'piloto-a@f5.internal',
      name: 'Portal — PET Piloto Nutri',
      tenantId: nutri.id,
      tenantName: nutri.name,
    },
    {
      email: 'piloto-b@f5.internal',
      name: 'Portal — PET Piloto Extru',
      tenantId: extru.id,
      tenantName: extru.name,
    },
    {
      email: 'piloto-saude@f5.internal',
      name: 'Portal — Indústria Saúde',
      tenantId: saude.id,
      tenantName: saude.name,
    },
    {
      email: 'piloto-papel@f5.internal',
      name: 'Portal — Indústria Papel',
      tenantId: papel.id,
      tenantName: papel.name,
    },
  ] as const;

  await prisma.user.createMany({
    data: clientViewers.map((viewer) => ({
      email: viewer.email,
      password: 'supabase-auth',
      name: viewer.name,
      role: 'client_viewer' as const,
      tenantId: viewer.tenantId,
    })),
  });

  await prisma.dashboardMetrics.create({
    data: {
      tenantId: nutri.id,
      totalVendasMes: 8316 + 4280.5,
      pagamentosReceber: 4280.5,
      mercadoLivrePct: 0,
      amazonPct: 100,
      shopeePct: 0,
    },
  });

  await prisma.dashboardMetrics.create({
    data: {
      tenantId: extru.id,
      totalVendasMes: 3240,
      pagamentosReceber: 0,
      mercadoLivrePct: 100,
      amazonPct: 0,
      shopeePct: 0,
    },
  });

  await prisma.insightNote.create({
    data: {
      tenantId: nutri.id,
      productId: prodNutri.id,
      title: 'Posição estável na Amazon',
      body: 'SKU PET-NP-001 mantém top 10 na busca principal. Manter estoque e monitorar sazonalidade.',
      visibleToClient: true,
      weekOf: periodStart,
    },
  });

  console.log(`✅ Seed: ${tenants.length} tenants, ${products.length} products`);
  console.log('   P0 PET: PET Piloto Nutri (AMAZON_1P), PET Piloto Extru (SOCIO_DIGITAL)');
  console.log('');
  console.log('👤 Client viewers (role client_viewer → tenantId no Prisma):');
  console.log(`   Senha dev (Supabase Auth): ${PILOT_CLIENT_PASSWORD}`);
  console.log('   Crie cada email em Supabase → Authentication → Users (Auto confirm):');
  for (const viewer of clientViewers) {
    console.log(`   • ${viewer.email} → ${viewer.tenantName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
