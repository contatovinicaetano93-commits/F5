'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/client.module.css';
import { ClientSkeleton } from '@/components/client/ClientSkeleton';
import { ClientPanelCard } from '@/components/client/ClientPanelCard';
import { formatBRL, formatPct } from '@/lib/admin/styles';

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  marketplaceLabel: string;
  revenue: number;
  unitsSold: number;
  visits: number;
  conversionRate: number;
  turnover: number;
  trend: 'up' | 'down' | 'stable';
}

interface ProductsData {
  items: ProductItem[];
  totals: { revenue: number; units: number; avgConversion: number };
}

function trendLabel(trend: ProductItem['trend']) {
  if (trend === 'up') return 'Em alta';
  if (trend === 'down') return 'Atenção';
  return 'Estável';
}

function trendClass(trend: ProductItem['trend']) {
  if (trend === 'up') return styles.badgePositive;
  if (trend === 'down') return styles.badgeNegative;
  return styles.badgeNeutral;
}

export default function ClienteProdutosPage() {
  const [data, setData] = useState<ProductsData | null>(null);

  useEffect(() => {
    fetch('/api/client/products', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <ClientSkeleton rows={2} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>Performance por SKU</h2>
        <p className={styles.pageSubtitle}>
          Receita, unidades, conversão e giro dos produtos monitorados pela operação
          F5 nos marketplaces.
        </p>
      </div>

      <ClientPanelCard title="Resumo" collapsible={false} compact>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiTile}>
            <p className={styles.kpiLabel}>Receita total</p>
            <p className={styles.kpiValue}>{formatBRL(data.totals.revenue)}</p>
          </div>
          <div className={styles.kpiTile}>
            <p className={styles.kpiLabel}>Unidades vendidas</p>
            <p className={styles.kpiValue}>{data.totals.units.toLocaleString('pt-BR')}</p>
          </div>
          <div className={styles.kpiTile}>
            <p className={styles.kpiLabel}>Conversão média</p>
            <p className={styles.kpiValue}>{formatPct(data.totals.avgConversion)}</p>
          </div>
        </div>
      </ClientPanelCard>

      <ClientPanelCard title="Catálogo monitorado" defaultOpen={false}>
        {data.items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>Nenhum produto monitorado</p>
            <p className={styles.emptyStateBody}>
              A equipe F5 cadastra os SKUs ativos nos marketplaces. Entre em contato se
              esperava ver produtos aqui.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Produto</th>
                  <th>Canal</th>
                  <th>Receita</th>
                  <th>Unidades</th>
                  <th>Conversão</th>
                  <th>Giro</th>
                  <th>Tendência</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.cellSku}>{item.sku}</td>
                    <td>{item.name}</td>
                    <td className={styles.cellMuted}>{item.marketplaceLabel}</td>
                    <td>{formatBRL(item.revenue)}</td>
                    <td>{item.unitsSold}</td>
                    <td>{formatPct(item.conversionRate)}</td>
                    <td>{item.turnover.toFixed(2)}</td>
                    <td>
                      <span className={`${styles.badge} ${trendClass(item.trend)}`}>
                        {trendLabel(item.trend)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClientPanelCard>
    </div>
  );
}
