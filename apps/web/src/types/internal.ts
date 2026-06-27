export type TenantSegment = 'PET' | 'SAUDE' | 'PAPEL' | 'PARAFUSO';

export type OperatingScenario =
  | 'BRACO_ONLINE'
  | 'SOCIO_DIGITAL'
  | 'COMPRAR_REVENDER'
  | 'AMAZON_1P';

export type Marketplace =
  | 'mercado_livre'
  | 'amazon'
  | 'shopee'
  | 'tiktok'
  | 'outros';

export interface InternalTenant {
  id: string;
  name: string;
  cnpj?: string;
  segment: TenantSegment;
  scenario: OperatingScenario;
  status: 'active' | 'inactive' | 'trial';
  createdAt: string;
  updatedAt: string;
}

export interface InternalProduct {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  marketplace: Marketplace;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMetric {
  id: string;
  tenantId: string;
  productId: string;
  marketplace: Marketplace;
  periodStart: string;
  periodEnd: string;
  impressions: number;
  visits: number;
  unitsSold: number;
  revenue: number;
  searchPosition?: number;
  conversionRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsightNote {
  id: string;
  tenantId: string;
  productId?: string | null;
  title: string;
  body: string;
  visibleToClient: boolean;
  weekOf?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NfRecord {
  id: string;
  tenantId: string;
  nfNumber: string;
  nfSeries: string;
  nfDate: string;
  valorTotal: number;
  itemsCount: number;
  status: 'processed' | 'pending';
  uploadedAt: string;
  marketplace?: Marketplace;
}

export const SEGMENT_LABELS: Record<TenantSegment, string> = {
  PET: 'Pet',
  SAUDE: 'Saúde',
  PAPEL: 'Papel',
  PARAFUSO: 'Ferramentas',
};

export const SCENARIO_LABELS: Record<OperatingScenario, string> = {
  BRACO_ONLINE: 'Braço do online',
  SOCIO_DIGITAL: 'Sócio digital',
  COMPRAR_REVENDER: 'Comprar e revender',
  AMAZON_1P: 'Amazon 1P',
};

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  mercado_livre: 'Mercado Livre',
  amazon: 'Amazon',
  shopee: 'Shopee',
  tiktok: 'TikTok Shop',
  outros: 'Outros',
};
