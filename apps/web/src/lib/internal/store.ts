import {
  type InternalTenant,
  type InternalProduct,
  type ProductMetric,
  type InsightNote,
  type NfRecord,
  type Marketplace,
  type TenantSegment,
} from '@/types/internal';

function id() {
  return `f5_${Math.random().toString(36).slice(2, 11)}`;
}

function now() {
  return new Date().toISOString();
}

function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const tenants: InternalTenant[] = [
  {
    id: 'tenant_pet_a',
    name: 'Indústria Pet — Piloto A',
    segment: 'PET',
    scenario: 'AMAZON_1P',
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tenant_pet_b',
    name: 'Indústria Pet — Piloto B',
    segment: 'PET',
    scenario: 'BRACO_ONLINE',
    status: 'trial',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tenant_saude',
    name: 'Indústria Saúde — Piloto',
    segment: 'SAUDE',
    scenario: 'BRACO_ONLINE',
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tenant_papel',
    name: 'Indústria Papel — Piloto',
    segment: 'PAPEL',
    scenario: 'BRACO_ONLINE',
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'tenant_parafuso',
    name: 'Ferramentas — Prospect',
    segment: 'PARAFUSO',
    scenario: 'BRACO_ONLINE',
    status: 'inactive',
    createdAt: now(),
    updatedAt: now(),
  },
];

const products: InternalProduct[] = [
  {
    id: 'prod_pet_a_1',
    tenantId: 'tenant_pet_a',
    sku: 'PET-RA-001',
    name: 'Ração premium aves 1kg',
    category: 'Alimentação',
    marketplace: 'amazon',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'prod_pet_a_2',
    tenantId: 'tenant_pet_a',
    sku: 'PET-SN-002',
    name: 'Snack natural pet 500g',
    category: 'Alimentação',
    marketplace: 'mercado_livre',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'prod_pet_b_1',
    tenantId: 'tenant_pet_b',
    sku: 'PET-EX-010',
    name: 'Extrusado pequenos animais 2kg',
    category: 'Alimentação',
    marketplace: 'mercado_livre',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'prod_saude_1',
    tenantId: 'tenant_saude',
    sku: 'SAU-EPI-001',
    name: 'Kit EPI descartável',
    category: 'EPI',
    marketplace: 'mercado_livre',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'prod_papel_1',
    tenantId: 'tenant_papel',
    sku: 'PAP-RES-100',
    name: 'Resma A4 75g 500fl',
    category: 'Papelaria',
    marketplace: 'mercado_livre',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

const metrics: ProductMetric[] = [
  {
    id: 'metric_1',
    tenantId: 'tenant_pet_a',
    productId: 'prod_pet_a_1',
    marketplace: 'amazon',
    periodStart: weekStart(),
    periodEnd: now(),
    impressions: 12400,
    visits: 890,
    unitsSold: 42,
    revenue: 8316,
    searchPosition: 8,
    conversionRate: 0.047,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'metric_2',
    tenantId: 'tenant_pet_b',
    productId: 'prod_pet_b_1',
    marketplace: 'mercado_livre',
    periodStart: weekStart(),
    periodEnd: now(),
    impressions: 3200,
    visits: 210,
    unitsSold: 8,
    revenue: 1440,
    searchPosition: 22,
    conversionRate: 0.038,
    notes: 'Giro abaixo da meta — revisar preço e fotos',
    createdAt: now(),
    updatedAt: now(),
  },
];

const insights: InsightNote[] = [
  {
    id: 'insight_1',
    tenantId: 'tenant_pet_b',
    productId: 'prod_pet_b_1',
    title: 'Giro baixo na semana',
    body: 'Conversão caiu 12% vs semana anterior. Concorrência na primeira página com preço 8% menor. Sugestão: ajustar título + testar preço promocional.',
    visibleToClient: true,
    weekOf: weekStart(),
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'insight_2',
    tenantId: 'tenant_pet_a',
    productId: 'prod_pet_a_1',
    title: 'Posição estável Amazon',
    body: 'SKU mantém top 10 na busca principal. Manter estoque e monitorar sazonalidade.',
    visibleToClient: false,
    weekOf: weekStart(),
    createdAt: now(),
    updatedAt: now(),
  },
];

const nfs: NfRecord[] = [
  {
    id: 'nf_1',
    tenantId: 'tenant_pet_a',
    nfNumber: '000142',
    nfSeries: '1',
    nfDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    valorTotal: 4280.5,
    itemsCount: 3,
    status: 'processed',
    uploadedAt: now(),
  },
];

export const internalStore = {
  tenants: {
    list: (segment?: TenantSegment) =>
      segment ? tenants.filter((t) => t.segment === segment) : [...tenants],
    get: (id: string) => tenants.find((t) => t.id === id) ?? null,
    create: (data: Omit<InternalTenant, 'id' | 'createdAt' | 'updatedAt'>) => {
      const tenant: InternalTenant = {
        ...data,
        id: id(),
        createdAt: now(),
        updatedAt: now(),
      };
      tenants.push(tenant);
      return tenant;
    },
    update: (id: string, data: Partial<InternalTenant>) => {
      const idx = tenants.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      tenants[idx] = { ...tenants[idx], ...data, updatedAt: now() };
      return tenants[idx];
    },
  },

  products: {
    list: (tenantId?: string) =>
      tenantId ? products.filter((p) => p.tenantId === tenantId) : [...products],
    get: (id: string) => products.find((p) => p.id === id) ?? null,
    create: (
      data: Omit<InternalProduct, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      const product: InternalProduct = {
        ...data,
        id: id(),
        createdAt: now(),
        updatedAt: now(),
      };
      products.push(product);
      return product;
    },
    update: (
      productId: string,
      data: Partial<Pick<InternalProduct, 'name' | 'description' | 'category' | 'marketplace' | 'active'>>,
    ) => {
      const idx = products.findIndex((p) => p.id === productId);
      if (idx === -1) return null;
      products[idx] = { ...products[idx], ...data, updatedAt: now() };
      return products[idx];
    },
  },

  metrics: {
    list: (tenantId?: string, productId?: string) =>
      metrics.filter(
        (m) =>
          (!tenantId || m.tenantId === tenantId) &&
          (!productId || m.productId === productId),
      ),
    create: (
      data: Omit<ProductMetric, 'id' | 'createdAt' | 'updatedAt' | 'conversionRate'> & {
        conversionRate?: number;
      },
    ) => {
      const conversionRate =
        data.conversionRate ??
        (data.visits > 0 ? data.unitsSold / data.visits : undefined);
      const metric: ProductMetric = {
        ...data,
        conversionRate,
        id: id(),
        createdAt: now(),
        updatedAt: now(),
      };
      metrics.unshift(metric);
      return metric;
    },
  },

  insights: {
    list: (tenantId?: string) =>
      tenantId
        ? insights.filter((i) => i.tenantId === tenantId)
        : [...insights],
    create: (
      data: Omit<InsightNote, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      const note: InsightNote = {
        ...data,
        id: id(),
        createdAt: now(),
        updatedAt: now(),
      };
      insights.unshift(note);
      return note;
    },
    update: (id: string, data: Partial<InsightNote>) => {
      const idx = insights.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      insights[idx] = { ...insights[idx], ...data, updatedAt: now() };
      return insights[idx];
    },
  },

  nfs: {
    list: (tenantId?: string) =>
      tenantId ? nfs.filter((n) => n.tenantId === tenantId) : [...nfs],
    create: (data: Omit<NfRecord, 'id' | 'uploadedAt'>) => {
      const nf: NfRecord = { ...data, id: id(), uploadedAt: now() };
      nfs.unshift(nf);
      return nf;
    },
  },

  overview: () => {
    const activeTenants = tenants.filter((t) => t.status === 'active').length;
    const weekMetrics = metrics.filter((m) => m.periodStart === weekStart());
    const lowGiro = weekMetrics.filter(
      (m) => m.conversionRate !== undefined && m.conversionRate < 0.04,
    );
    const pendingNfs = nfs.filter((n) => n.status === 'pending').length;
    const clientInsights = insights.filter((i) => i.visibleToClient).length;

    return {
      activeTenants,
      totalTenants: tenants.length,
      metricsThisWeek: weekMetrics.length,
      lowGiroCount: lowGiro.length,
      pendingNfs,
      clientInsights,
      segments: (['PET', 'SAUDE', 'PAPEL', 'PARAFUSO'] as TenantSegment[]).map(
        (segment) => ({
          segment,
          count: tenants.filter((t) => t.segment === segment).length,
        }),
      ),
    };
  },
};

export type CreateMetricInput = {
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
  notes?: string;
};

export type CreateInsightInput = {
  tenantId: string;
  productId?: string;
  title: string;
  body: string;
  visibleToClient: boolean;
  weekOf?: string;
};

export type CreateProductInput = {
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  marketplace: Marketplace;
};
