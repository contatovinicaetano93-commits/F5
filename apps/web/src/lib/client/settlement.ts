import type { Marketplace } from '@/types/internal';

const SETTLEMENT_DAYS: Record<Marketplace, number> = {
  mercado_livre: 15,
  shopee: 15,
  tiktok: 15,
  amazon: 60,
  outros: 30,
};

export function getSettlementDays(marketplace: Marketplace | string | null | undefined): number {
  if (!marketplace) return SETTLEMENT_DAYS.outros;
  return SETTLEMENT_DAYS[marketplace as Marketplace] ?? SETTLEMENT_DAYS.outros;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function settlementLabel(marketplace: Marketplace | string): string {
  const days = getSettlementDays(marketplace);
  const names: Record<string, string> = {
    mercado_livre: 'Mercado Livre',
    amazon: 'Amazon',
    shopee: 'Shopee',
    tiktok: 'TikTok Shop',
    outros: 'Outros',
  };
  return `${names[marketplace] ?? marketplace} — ciclo D+${days}`;
}
