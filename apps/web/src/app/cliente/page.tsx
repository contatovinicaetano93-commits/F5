'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import styles from '@/styles/client.module.css';
import { ClientSkeleton } from '@/components/client/ClientSkeleton';
import { ClientPanelCard } from '@/components/client/ClientPanelCard';
import { RevenueChart } from '@/components/client/RevenueChart';
import { formatBRL, formatPct } from '@/lib/admin/styles';
import { fetchClientJson } from '@/lib/client/fetch';
import { useClientPoll } from '@/lib/client/use-client-poll';

interface Overview {
  period: { month: string };
  monthSales: number;
  variationPct: number;
  totalReceivable: number;
  paymentsReceivable: {
    id: string;
    label: string;
    amount: number;
    expectedDate: string;
    settlementDays: number;
  }[];
  channelDistribution: {
    label: string;
    amount: number;
    share: number;
  }[];
  revenueHistory?: { month: string; revenue: number }[];
}

interface Insight {
  id: string;
  title: string;
  body: string;
  weekOf: string | null;
  createdAt: string;
}

type HomeData = {
  overview: Overview;
  insights: Insight[];
};

export default function ClienteInicioPage() {
  const loader = useCallback(async (): Promise<HomeData | null> => {
    const [overview, insightData] = await Promise.all([
      fetchClientJson<Overview>('/api/client/overview'),
      fetchClientJson<{ items: Insight[] }>('/api/client/insights'),
    ]);
    if (!overview) return null;
    return { overview, insights: insightData?.items ?? [] };
  }, []);

  const { data, loading } = useClientPoll<HomeData>('client-home', loader);

  if (loading && !data) {
    return <ClientSkeleton />;
  }

  if (!data) {
    return <ClientSkeleton />;
  }

  const { overview: dataOverview, insights } = data;
  const variationPositive = dataOverview.variationPct >= 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>Resultado do digital</h2>
        <p className={styles.pageSubtitle}>
          Visão consolidada de vendas e recebimentos para {dataOverview.period.month}. A F5
          opera os marketplaces — você acompanha os números aqui.
        </p>
      </div>

      <ClientPanelCard title="Resumo do mês" collapsible={false} compact>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiTile}>
            <p className={styles.kpiLabel}>Vendas do mês</p>
            <p className={styles.kpiValue}>{formatBRL(dataOverview.monthSales)}</p>
            <p className={styles.kpiMeta}>
              <span
                className={`${styles.badge} ${
                  variationPositive ? styles.badgePositive : styles.badgeNegative
                }`}
              >
                {variationPositive ? '+' : ''}
                {formatPct(dataOverview.variationPct)}
              </span>
              <span className={styles.cellMuted}>vs mês anterior</span>
            </p>
          </div>

          <div className={styles.kpiTile}>
            <p className={styles.kpiLabel}>Pagamentos a receber</p>
            <p className={styles.kpiValue}>{formatBRL(dataOverview.totalReceivable)}</p>
            <p className={styles.kpiMeta}>
              <span className={styles.cellMuted}>
                {dataOverview.paymentsReceivable.length} repasses programados
              </span>
            </p>
          </div>

          <div className={styles.kpiTile}>
            <p className={styles.kpiLabel}>Canais ativos</p>
            <p className={styles.kpiValue}>{dataOverview.channelDistribution.length}</p>
            <p className={styles.kpiMeta}>
              <span className={styles.cellMuted}>ML, Amazon e Shopee</span>
            </p>
          </div>
        </div>
      </ClientPanelCard>

      <div className={styles.twoCol}>
        <ClientPanelCard title="Distribuição por canal" defaultOpen={false}>
          {dataOverview.channelDistribution.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateTitle}>Sem vendas por canal neste mês</p>
              <p className={styles.emptyStateBody}>
                Assim que houver faturamento nos marketplaces, a distribuição aparece aqui.
              </p>
            </div>
          ) : (
            <div className={styles.channelList}>
              {dataOverview.channelDistribution.map((ch) => (
                <div key={ch.label} className={styles.channelRow}>
                  <div className={styles.channelHeader}>
                    <span className={styles.channelName}>{ch.label}</span>
                    <span className={styles.channelAmount}>{formatBRL(ch.amount)}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${Math.round(ch.share * 100)}%` }}
                    />
                  </div>
                  <span className={styles.channelShare}>
                    {formatPct(ch.share)} do faturamento
                  </span>
                </div>
              ))}
            </div>
          )}
        </ClientPanelCard>

        <ClientPanelCard title="Próximos recebimentos" defaultOpen={false}>
          {dataOverview.paymentsReceivable.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateTitle}>Nenhum repasse programado</p>
              <p className={styles.emptyStateBody}>
                Repasses D+15 (Mercado Livre) e D+60 (Amazon) aparecem após processamento das NF-e.
              </p>
            </div>
          ) : (
            <div className={styles.paymentList}>
              {dataOverview.paymentsReceivable.map((p) => (
                <div key={p.id} className={styles.paymentItem}>
                  <div className={styles.paymentInfo}>
                    <span className={styles.paymentLabel}>{p.label}</span>
                    <span className={styles.paymentDate}>
                      Previsão:{' '}
                      {new Date(p.expectedDate).toLocaleDateString('pt-BR')} — D+
                      {p.settlementDays}
                    </span>
                  </div>
                  <span className={styles.paymentAmount}>{formatBRL(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </ClientPanelCard>
      </div>

      {dataOverview.revenueHistory && dataOverview.revenueHistory.length > 0 && (
        <ClientPanelCard title="Receita — últimos 6 meses" defaultOpen={false}>
          <RevenueChart data={dataOverview.revenueHistory} />
        </ClientPanelCard>
      )}

      {insights.length > 0 && (
        <ClientPanelCard title="Insights da operação F5" defaultOpen={false}>
          <div className={styles.insightList}>
            {insights.slice(0, 2).map((insight) => (
              <article key={insight.id} className={styles.insightItem}>
                <h4 className={styles.insightTitle}>{insight.title}</h4>
                <p className={styles.insightBody}>{insight.body}</p>
                <span className={styles.cellMuted}>
                  {new Date(insight.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </article>
            ))}
          </div>
          {insights.length > 2 && (
            <p className={styles.cellMuted} style={{ marginTop: 12 }}>
              <Link href="/cliente/insights" className={styles.headerLink}>
                Ver todos os insights ({insights.length})
              </Link>
            </p>
          )}
        </ClientPanelCard>
      )}
    </div>
  );
}
