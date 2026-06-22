import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateNFInput {
  userId: string;
  nfNumber: string;
  nfSeries: string;
  nfDate: Date;
  emitente: string;
  destinatario: string;
  valorTotal: number;
  valorBaseIcms: number;
  valorIcms: number;
  xmlContent: string;
  items: Array<{
    sku: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    marketplace?: string;
  }>;
}

@Injectable()
export class NfService {
  constructor(private prisma: PrismaService) {}

  async createNotaFiscal(input: CreateNFInput) {
    // Validar duplicação de NF
    const existing = await this.prisma.notaFiscal.findUnique({
      where: {
        nfNumber_nfSeries_emitente: {
          nfNumber: input.nfNumber,
          nfSeries: input.nfSeries,
          emitente: input.emitente,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Esta Nota Fiscal já foi processada');
    }

    const notaFiscal = await this.prisma.notaFiscal.create({
      data: {
        userId: input.userId,
        nfNumber: input.nfNumber,
        nfSeries: input.nfSeries,
        nfDate: input.nfDate,
        emitente: input.emitente,
        destinatario: input.destinatario,
        valorTotal: input.valorTotal,
        valorBaseIcms: input.valorBaseIcms,
        valorIcms: input.valorIcms,
        xmlContent: input.xmlContent,
        processedAt: new Date(),
        items: {
          create: input.items,
        },
      },
      include: {
        items: true,
      },
    });

    // Atualizar dashboard metrics após criar NF
    await this.updateDashboardMetrics(input.userId);

    return notaFiscal;
  }

  async getNotaFiscal(id: string, userId: string) {
    const nf = await this.prisma.notaFiscal.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!nf) {
      throw new NotFoundException('Nota Fiscal não encontrada');
    }

    if (nf.userId !== userId) {
      throw new BadRequestException('Sem permissão para acessar esta NF');
    }

    return nf;
  }

  async listNotasFiscais(userId: string, limit = 50, offset = 0) {
    const nfs = await this.prisma.notaFiscal.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { nfDate: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.notaFiscal.count({ where: { userId } });

    return {
      data: nfs,
      total,
      limit,
      offset,
    };
  }

  async updateDashboardMetrics(userId: string) {
    // Calcular totalizações do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const nfs = await this.prisma.notaFiscal.findMany({
      where: {
        userId,
        nfDate: {
          gte: startOfMonth,
        },
      },
      include: { items: true },
    });

    const totalVendasMes = nfs.reduce((sum, nf) => sum + Number(nf.valorTotal), 0);

    // Contabilizar marketplace distribution
    const marketplaceMap: Record<string, number> = {};
    nfs.forEach((nf) => {
      nf.items.forEach((item) => {
        const mp = item.marketplace || 'Não identificado';
        marketplaceMap[mp] = (marketplaceMap[mp] || 0) + Number(item.valorTotal);
      });
    });

    const totalByMarketplace = Object.values(marketplaceMap).reduce((sum, val) => sum + val, 0);

    // Atualizar ou criar metrics
    await this.prisma.dashboardMetrics.upsert({
      where: { userId },
      create: {
        userId,
        totalVendasMes: totalVendasMes.toString(),
        mercadoLivrePct:
          totalByMarketplace > 0
            ? ((marketplaceMap['Mercado Livre'] || 0) / totalByMarketplace * 100).toString()
            : '0',
        amazonPct:
          totalByMarketplace > 0
            ? ((marketplaceMap['Amazon'] || 0) / totalByMarketplace * 100).toString()
            : '0',
        shopeePct:
          totalByMarketplace > 0
            ? ((marketplaceMap['Shopee'] || 0) / totalByMarketplace * 100).toString()
            : '0',
      },
      update: {
        totalVendasMes: totalVendasMes.toString(),
        mercadoLivrePct:
          totalByMarketplace > 0
            ? ((marketplaceMap['Mercado Livre'] || 0) / totalByMarketplace * 100).toString()
            : '0',
        amazonPct:
          totalByMarketplace > 0
            ? ((marketplaceMap['Amazon'] || 0) / totalByMarketplace * 100).toString()
            : '0',
        shopeePct:
          totalByMarketplace > 0
            ? ((marketplaceMap['Shopee'] || 0) / totalByMarketplace * 100).toString()
            : '0',
        updatedAt: new Date(),
      },
    });
  }
}
