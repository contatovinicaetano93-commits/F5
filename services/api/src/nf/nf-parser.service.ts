import { Injectable, BadRequestException } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';

interface ParsedNF {
  nfNumber: string;
  nfSeries: string;
  nfDate: Date;
  emitente: string;
  destinatario: string;
  valorTotal: number;
  valorBaseIcms: number;
  valorIcms: number;
  items: ParsedNFItem[];
}

interface ParsedNFItem {
  sku: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

@Injectable()
export class NfParserService {
  async parseXml(xmlContent: string): Promise<ParsedNF> {
    try {
      const parsed = await parseStringPromise(xmlContent);
      return this.extractNFData(parsed);
    } catch (error) {
      throw new BadRequestException(`Erro ao fazer parse do XML: ${error.message}`);
    }
  }

  private extractNFData(xmlObj: any): ParsedNF {
    // Estrutura padrão NF-e SEFAZ Brasil
    // Root pode ser NFe, nfeProc ou nfe conforme versão
    const nfe = xmlObj.NFe?.infNFe?.[0] || xmlObj.nfe?.infNFe?.[0] || xmlObj.nfeProc?.NFe?.[0]?.infNFe?.[0];

    if (!nfe) {
      throw new BadRequestException('Formato de NF-e não reconhecido');
    }

    const ide = nfe.ide?.[0];
    const emit = nfe.emit?.[0];
    const dest = nfe.dest?.[0];
    const total = nfe.total?.[0]?.ICMSTot?.[0];
    const det = nfe.det || [];

    if (!ide || !emit || !total) {
      throw new BadRequestException('Campos obrigatórios da NF-e não encontrados');
    }

    const nfNumber = ide.cNF?.[0] || 'N/A';
    const nfSeries = ide.serie?.[0] || '1';
    const nfDate = this.parseNFDate(ide.dhEmi?.[0] || ide.dEmi?.[0]);

    const emitente = emit.CNPJ?.[0] || emit.CPF?.[0] || 'N/A';
    const destinatario = dest?.CNPJ?.[0] || dest?.CPF?.[0] || 'Consumidor Final';

    const valorTotal = parseFloat(total.vNF?.[0] || '0');
    const valorBaseIcms = parseFloat(total.vBC?.[0] || '0');
    const valorIcms = parseFloat(total.vICMS?.[0] || '0');

    const items = this.extractItems(det);

    return {
      nfNumber,
      nfSeries,
      nfDate,
      emitente,
      destinatario,
      valorTotal,
      valorBaseIcms,
      valorIcms,
      items,
    };
  }

  private parseNFDate(dateStr: string): Date {
    // Formato: 2026-06-22T10:30:00-03:00 ou 2026-06-22
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }

  private extractItems(detArray: any[]): ParsedNFItem[] {
    if (!detArray || !Array.isArray(detArray)) {
      return [];
    }

    return detArray
      .map((det) => {
        const prod = det.prod?.[0];
        if (!prod) return null;

        return {
          sku: prod.cProd?.[0] || 'N/A',
          descricao: prod.xProd?.[0] || 'Produto sem descrição',
          quantidade: parseFloat(prod.qCom?.[0] || '0'),
          valorUnitario: parseFloat(prod.vUnCom?.[0] || '0'),
          valorTotal: parseFloat(prod.vItem?.[0] || '0'),
        };
      })
      .filter((item) => item !== null);
  }

  // Detectar marketplace do XML (se houver informação)
  detectMarketplace(xmlContent: string): string | null {
    const lower = xmlContent.toLowerCase();

    if (lower.includes('mercado livre')) return 'Mercado Livre';
    if (lower.includes('amazon')) return 'Amazon';
    if (lower.includes('shopee')) return 'Shopee';
    if (lower.includes('tiktok')) return 'TikTok Shop';

    return null;
  }
}
