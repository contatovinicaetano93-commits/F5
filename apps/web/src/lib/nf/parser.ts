/**
 * Parser NF-e SEFAZ (XML) — compartilhado web/API
 */

import { parseStringPromise } from 'xml2js';
import type { Marketplace } from '@/types/internal';

export interface ParsedNFItem {
  sku: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ParsedNF {
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

export async function parseNfXml(xmlContent: string): Promise<ParsedNF> {
  const parsed = await parseStringPromise(xmlContent);
  return extractNFData(parsed);
}

function extractNFData(xmlObj: Record<string, unknown>): ParsedNF {
  const root = xmlObj as {
    NFe?: { infNFe?: unknown[] };
    nfe?: { infNFe?: unknown[] };
    nfeProc?: { NFe?: { infNFe?: unknown[] }[] };
  };

  const nfe =
    root.NFe?.infNFe?.[0] ??
    root.nfe?.infNFe?.[0] ??
    root.nfeProc?.NFe?.[0]?.infNFe?.[0];

  if (!nfe || typeof nfe !== 'object') {
    throw new Error('Formato de NF-e não reconhecido');
  }

  const n = nfe as Record<string, unknown[] | undefined>;
  const ide = n.ide?.[0] as Record<string, string[]> | undefined;
  const emit = n.emit?.[0] as Record<string, string[]> | undefined;
  const dest = n.dest?.[0] as Record<string, string[]> | undefined;
  const total = (n.total?.[0] as Record<string, unknown[]>)?.ICMSTot?.[0] as
    | Record<string, string[]>
    | undefined;
  const det = (n.det as unknown[]) ?? [];

  if (!ide || !emit || !total) {
    throw new Error('Campos obrigatórios da NF-e não encontrados');
  }

  const nfNumber = ide.nNF?.[0] ?? ide.cNF?.[0] ?? 'N/A';
  const nfSeries = ide.serie?.[0] ?? '1';
  const dateRaw = ide.dhEmi?.[0] ?? ide.dEmi?.[0];
  if (!dateRaw) {
    throw new Error('Data de emissão da NF-e não encontrada no XML');
  }
  const nfDate = new Date(dateRaw);
  if (Number.isNaN(nfDate.getTime())) {
    throw new Error('Data de emissão da NF-e inválida no XML');
  }

  const emitente = emit.CNPJ?.[0] ?? emit.CPF?.[0] ?? 'N/A';
  const destinatario = dest?.CNPJ?.[0] ?? dest?.CPF?.[0] ?? 'Consumidor Final';

  const valorTotal = parseFloat(total.vNF?.[0] ?? '0');
  const valorBaseIcms = parseFloat(total.vBC?.[0] ?? '0');
  const valorIcms = parseFloat(total.vICMS?.[0] ?? '0');

  const items = extractItems(det);

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

function extractItems(detArray: unknown[]): ParsedNFItem[] {
  if (!Array.isArray(detArray)) return [];

  return detArray
    .map((det) => {
      const prod = (det as { prod?: Record<string, string[]>[] })?.prod?.[0];
      if (!prod) return null;

      return {
        sku: prod.cProd?.[0] ?? 'N/A',
        descricao: prod.xProd?.[0] ?? 'Produto sem descrição',
        quantidade: parseFloat(prod.qCom?.[0] ?? '0'),
        valorUnitario: parseFloat(prod.vUnCom?.[0] ?? '0'),
        valorTotal: parseFloat(prod.vProd?.[0] ?? prod.vItem?.[0] ?? '0'),
      };
    })
    .filter((item): item is ParsedNFItem => item !== null);
}

export function detectMarketplaceFromXml(xmlContent: string): Marketplace | null {
  return detectMarketplaceFromText(xmlContent);
}

export function detectMarketplaceFromText(text: string): Marketplace | null {
  const lower = text.toLowerCase();
  if (lower.includes('mercado livre') || lower.includes('mercado_livre')) {
    return 'mercado_livre';
  }
  if (lower.includes('amazon')) return 'amazon';
  if (lower.includes('shopee')) return 'shopee';
  if (lower.includes('tiktok')) return 'tiktok';
  return null;
}
