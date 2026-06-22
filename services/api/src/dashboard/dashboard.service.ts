import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    // Obter metrics do usuário
    const metrics = await this.prisma.dashboardMetrics.findUnique({
      where: { userId },
    });

    if (!metrics) {
      return this.getEmptyDashboard();
    }

    // Calcular variações (mês passado vs este mês)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const thisMonthNFs = await this.prisma.notaFiscal.findMany({
      where: {
        userId,
        nfDate: { gte: startOfMonth },
      },
    });

    const lastMonthNFs = await this.prisma.notaFiscal.findMany({
      where: {
        userId,
        nfDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const thisMonthTotal = thisMonthNFs.reduce((sum, nf) => sum + Number(nf.valorTotal), 0);
    const lastMonthTotal = lastMonthNFs.reduce((sum, nf) => sum + Number(nf.valorTotal), 0);

    const vendaVariacao =
      lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Placeholder para custos operacionais (será integrado com marketplace APIs)
    const custosOperacionais = thisMonthTotal * 0.17; // ~15% comissão + 2% logística média
    const custoVariacao = -5; // Placeholder

    // Estoque total (agregado dos items)
    const totalEstoque = await this.prisma.salesItem.aggregate({
      _sum: {
        quantidade: true,
      },
      where: {
        notaFiscal: {
          userId,
          nfDate: { gte: startOfMonth },
        },
      },
    });

    const estoqueQuantidade = Number(totalEstoque._sum.quantidade || 0);

    // Pagamentos a receber (será integrado com schedule de recebimento)
    const pagamentosReceber = Math.round(thisMonthTotal * 0.7); // Simulação: 70% ainda a receber

    return {
      kpis: {
        vendas: {
          valor: thisMonthTotal,
          variacao: vendaVariacao,
          label: 'Vendas Este Mês',
        },
        custos: {
          valor: custosOperacionais,
          variacao: custoVariacao,
          label: 'Custos Operacionais',
        },
        estoque: {
          valor: estoqueQuantidade,
          variacao: 45, // Placeholder
          label: 'Estoque Total',
        },
        pagamentos: {
          valor: pagamentosReceber,
          variacao: -5000, // Placeholder em R$
          label: 'Pagamentos a Receber',
        },
      },
      marketplaceDistribution: {
        mercadoLivre: Number(metrics.mercadoLivrePct || 0),
        amazon: Number(metrics.amazonPct || 0),
        shopee: Number(metrics.shopeePct || 0),
      },
      period: {
        startDate: startOfMonth,
        endDate: new Date(),
      },
    };
  }

  async getRecentSales(userId: string, limit = 10) {
    const nfs = await this.prisma.notaFiscal.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { nfDate: 'desc' },
      take: limit,
    });

    return nfs.map((nf) => ({
      id: nf.id,
      nfNumber: `${nf.nfSeries}/${nf.nfNumber}`,
      date: nf.nfDate,
      marketplace: nf.items?.[0]?.marketplace || 'Não identificado',
      valor: Number(nf.valorTotal),
      status: 'Processada',
    }));
  }

  private getEmptyDashboard() {
    return {
      kpis: {
        vendas: { valor: 0, variacao: 0, label: 'Vendas Este Mês' },
        custos: { valor: 0, variacao: 0, label: 'Custos Operacionais' },
        estoque: { valor: 0, variacao: 0, label: 'Estoque Total' },
        pagamentos: { valor: 0, variacao: 0, label: 'Pagamentos a Receber' },
      },
      marketplaceDistribution: {
        mercadoLivre: 0,
        amazon: 0,
        shopee: 0,
      },
      period: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(),
      },
    };
  }
}
