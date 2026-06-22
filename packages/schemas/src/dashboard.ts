import { z } from 'zod';

export const kpiMetricSchema = z.object({
  valor: z.number(),
  variacao: z.number(),
  label: z.string(),
});

export const dashboardKpisSchema = z.object({
  vendas: kpiMetricSchema,
  custos: kpiMetricSchema,
  estoque: kpiMetricSchema,
  pagamentos: kpiMetricSchema,
});

export const marketplaceDistributionSchema = z.object({
  mercadoLivre: z.number().min(0).max(100),
  amazon: z.number().min(0).max(100),
  shopee: z.number().min(0).max(100),
});

export const dashboardResponseSchema = z.object({
  kpis: dashboardKpisSchema,
  marketplaceDistribution: marketplaceDistributionSchema,
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
});

export const recentSaleSchema = z.object({
  id: z.string().cuid(),
  nfNumber: z.string(),
  date: z.date(),
  marketplace: z.string(),
  valor: z.number().positive(),
  status: z.enum(['Processada', 'Pendente', 'Erro']),
});

export type KPIMetric = z.infer<typeof kpiMetricSchema>;
export type DashboardKPIs = z.infer<typeof dashboardKpisSchema>;
export type MarketplaceDistribution = z.infer<typeof marketplaceDistributionSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
export type RecentSale = z.infer<typeof recentSaleSchema>;
