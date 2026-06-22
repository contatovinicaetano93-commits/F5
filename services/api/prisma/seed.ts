import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpar dados anteriores (ordem importa por foreign keys)
  await prisma.paymentSchedule.deleteMany({});
  await prisma.dashboardMetrics.deleteMany({});
  await prisma.salesItem.deleteMany({});
  await prisma.notaFiscal.deleteMany({});
  await prisma.user.deleteMany({});

  // Criar usuário de teste
  const user = await prisma.user.create({
    data: {
      email: 'teste@f5.com',
      password: 'hashed_password_here', // Em produção, seria bcrypt
      name: 'Indústria Teste',
      role: 'user',
    },
  });

  console.log('✅ Usuário criado:', user.email);

  // Criar notas fiscais de teste (últimos 10 dias)
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const nfDate = new Date(now);
    nfDate.setDate(nfDate.getDate() - i);

    const notaFiscal = await prisma.notaFiscal.create({
      data: {
        userId: user.id,
        nfNumber: String(1000 + i),
        nfSeries: '1',
        nfDate,
        emitente: '12.345.678/0001-90',
        destinatario: '98.765.432/0001-10',
        valorTotal: 10000 + i * 1000,
        valorBaseIcms: 8000 + i * 800,
        valorIcms: 1600 + i * 160,
        xmlContent: '<xml>fake content</xml>',
        processedAt: new Date(),
        items: {
          create: [
            {
              sku: `SKU-${i}-1`,
              descricao: 'Produto A',
              quantidade: 100,
              valorUnitario: 50,
              valorTotal: 5000,
              marketplace: 'Mercado Livre',
            },
            {
              sku: `SKU-${i}-2`,
              descricao: 'Produto B',
              quantidade: 50,
              valorUnitario: 100,
              valorTotal: 5000,
              marketplace: 'Amazon',
            },
          ],
        },
      },
      include: { items: true },
    });

    console.log(`✅ NF criada: ${notaFiscal.nfNumber}`);
  }

  // Criar metrics
  await prisma.dashboardMetrics.create({
    data: {
      userId: user.id,
      totalVendasMes: 50000,
      totalCustos: 8500,
      mercadoLivrePct: 60,
      amazonPct: 25,
      shopeePct: 15,
    },
  });

  console.log('✅ Metrics criadas');

  // Criar schedule de pagamentos
  for (let i = 1; i <= 3; i++) {
    const payDate = new Date(now);
    payDate.setDate(payDate.getDate() + i * 15);

    await prisma.paymentSchedule.create({
      data: {
        userId: user.id,
        marketplace: ['Mercado Livre', 'Amazon', 'Shopee'][i - 1],
        dataRecebimento: payDate,
        valor: 10000 + i * 5000,
        status: 'pending',
      },
    });
  }

  console.log('✅ Schedule de pagamentos criado');
  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
