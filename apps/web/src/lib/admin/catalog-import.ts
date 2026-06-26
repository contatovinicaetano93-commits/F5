import type { Marketplace } from '@/types/internal';

export type CatalogCsvRow = {
  sku: string;
  name: string;
  category?: string;
  marketplace: Marketplace;
};

const MARKETPLACE_ALIASES: Record<string, Marketplace> = {
  mercado_livre: 'mercado_livre',
  ml: 'mercado_livre',
  amazon: 'amazon',
  shopee: 'shopee',
  tiktok: 'tiktok',
  outros: 'outros',
};

function splitCsvLine(line: string): string[] {
  return line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ''));
}

function parseMarketplace(raw: string): Marketplace | null {
  const key = raw.trim().toLowerCase();
  return MARKETPLACE_ALIASES[key] ?? null;
}

export function parseCatalogCsv(text: string): {
  rows: CatalogCsvRow[];
  errors: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV vazio ou sem linhas de dados'] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const skuIdx = header.findIndex((h) => h === 'sku' || h === 'codigo');
  const nameIdx = header.findIndex((h) => h === 'name' || h === 'nome');
  const categoryIdx = header.findIndex((h) => h === 'category' || h === 'categoria');
  const marketplaceIdx = header.findIndex(
    (h) => h === 'marketplace' || h === 'canal',
  );

  if (skuIdx === -1 || nameIdx === -1) {
    return { rows: [], errors: ['Cabeçalho deve incluir sku e name (ou nome)'] };
  }

  const rows: CatalogCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const sku = cols[skuIdx]?.trim();
    const name = cols[nameIdx]?.trim();
    if (!sku || !name) {
      errors.push(`Linha ${i + 1}: SKU e nome obrigatórios`);
      continue;
    }

    const marketplaceRaw =
      marketplaceIdx >= 0 ? cols[marketplaceIdx]?.trim() : 'mercado_livre';
    const marketplace = parseMarketplace(marketplaceRaw ?? 'mercado_livre');
    if (!marketplace) {
      errors.push(`Linha ${i + 1}: marketplace inválido (${marketplaceRaw})`);
      continue;
    }

    rows.push({
      sku,
      name,
      category: categoryIdx >= 0 ? cols[categoryIdx]?.trim() || undefined : undefined,
      marketplace,
    });
  }

  return { rows, errors };
}

export const CATALOG_CSV_TEMPLATE = `sku,name,category,marketplace
PET-001,Produto exemplo,Alimentação,mercado_livre
`;
