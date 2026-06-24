import type { Marketplace } from '@/types/internal';

export type CsvMetricRow = {
  sku: string;
  marketplace: Marketplace;
  impressions: number;
  visits: number;
  unitsSold: number;
  revenue: number;
  searchPosition?: number;
  notes?: string;
};

const MARKETPLACE_ALIASES: Record<string, Marketplace> = {
  mercado_livre: 'mercado_livre',
  ml: 'mercado_livre',
  'mercado livre': 'mercado_livre',
  amazon: 'amazon',
  shopee: 'shopee',
  tiktok: 'tiktok',
  outros: 'outros',
  outro: 'outros',
};

const COLUMN_ALIASES: Record<string, keyof CsvMetricRow | 'skip'> = {
  sku: 'sku',
  codigo: 'sku',
  'codigo sku': 'sku',
  marketplace: 'marketplace',
  canal: 'marketplace',
  impressions: 'impressions',
  impressoes: 'impressions',
  impressões: 'impressions',
  visits: 'visits',
  visitas: 'visits',
  unitssold: 'unitsSold',
  unidades: 'unitsSold',
  units: 'unitsSold',
  vendas: 'unitsSold',
  revenue: 'revenue',
  receita: 'revenue',
  faturamento: 'revenue',
  searchposition: 'searchPosition',
  posicao: 'searchPosition',
  posição: 'searchPosition',
  posicao_busca: 'searchPosition',
  notes: 'notes',
  observacoes: 'notes',
  observações: 'notes',
  obs: 'notes',
};

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

function detectDelimiter(line: string): ',' | ';' {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

function parseCsvLine(line: string, delimiter: ',' | ';'): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function parseNumber(raw: string): number {
  const cleaned = raw.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseMarketplace(raw: string): Marketplace {
  const key = normalizeHeader(raw).replace(/\s+/g, ' ');
  return MARKETPLACE_ALIASES[key] ?? 'outros';
}

/** Parse CSV exportado do ML/Amazon ou planilha interna F5. */
export function parseMetricsCsv(text: string): {
  rows: CsvMetricRow[];
  errors: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV vazio ou sem linhas de dados'] };
  }

  const delimiter = detectDelimiter(lines[0]!);
  const headers = parseCsvLine(lines[0]!, delimiter).map(normalizeHeader);
  const columnMap = headers.map((h) => COLUMN_ALIASES[h.replace(/\s+/g, '')] ?? COLUMN_ALIASES[h] ?? null);

  if (!columnMap.includes('sku')) {
    return {
      rows: [],
      errors: ['Coluna obrigatória ausente: sku (ou codigo)'],
    };
  }

  const rows: CsvMetricRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!, delimiter);
    const draft: Partial<CsvMetricRow> = {
      marketplace: 'mercado_livre',
      impressions: 0,
      visits: 0,
      unitsSold: 0,
      revenue: 0,
    };

    columnMap.forEach((field, colIdx) => {
      if (!field || field === 'skip') return;
      const raw = cells[colIdx] ?? '';
      if (!raw) return;

      if (field === 'sku') draft.sku = raw.trim().toUpperCase();
      else if (field === 'marketplace') draft.marketplace = parseMarketplace(raw);
      else if (field === 'searchPosition') draft.searchPosition = parseNumber(raw);
      else if (field === 'notes') draft.notes = raw.trim();
      else if (field === 'impressions') draft.impressions = parseNumber(raw);
      else if (field === 'visits') draft.visits = parseNumber(raw);
      else if (field === 'unitsSold') draft.unitsSold = parseNumber(raw);
      else if (field === 'revenue') draft.revenue = parseNumber(raw);
    });

    if (!draft.sku) {
      errors.push(`Linha ${i + 1}: SKU vazio`);
      continue;
    }

    rows.push(draft as CsvMetricRow);
  }

  return { rows, errors };
}

export const METRICS_CSV_TEMPLATE = `sku,canal,impressoes,visitas,unidades,receita,posicao,observacoes
PET-RA-001,amazon,12400,890,42,8316.00,8,Semana atual
PET-SN-002,mercado_livre,3200,210,8,1440.00,22,Giro abaixo da meta
`;
