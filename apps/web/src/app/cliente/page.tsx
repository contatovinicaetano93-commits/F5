'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '@/styles/client.module.css';
import { ClientSkeleton } from '@/components/client/ClientSkeleton';
import { formatBRL, formatPct } from '@/lib/admin/styles';

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
}

interface Insight {
  id: string;
  title: string;
  body: string;
  weekOf: string | null;
  createdAt: string;
}

export default function ClienteInicioPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/client/overview', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/client/insights', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([overview, insightData]) => {
        setData(overview);
        setInsights(insightData.items ?? []);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return <ClientSkeleton />;
  }

  const variationPositive = data.variationPct >= 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>Resultado do digital</h2>
        <p className={styles.pageSubtitle}>
          Visão consolidada de vendas e recebimentos para {data.period.month}. A F5
          opera os marketplaces — você acompanha os números aqui.
        </p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.card}>
          <p className={styles.kpiLabel}>Vendas do mês</p>
          <p className={styles.kpiValue}>{formatBRL(data.monthSales)}</p>
          <p className={styles.kpiMeta}>
            <span
              className={`${styles.badge} ${
                variationPositive ? styles.badgePositive : styles.badgeNegative
              }`}
            >
              {variationPositive ? '+' : ''}
              {formatPct(data.variationPct)}
            </span>
            <span className={styles.cellMuted}>vs mês anterior</span>
          </p>
        </div>

        <div className={styles.card}>
          <p className={styles.kpiLabel}>Pagamentos a receber</p>
          <p className={styles.kpiValue}>{formatBRL(data.totalReceivable)}</p>
          <p className={styles.kpiMeta}>
            <span className={styles.cellMuted}>
              {data.paymentsReceivable.length} repasses programados
            </span>
          </p>
        </div>

        <div className={styles.card}>
          <p className={styles.kpiLabel}>Canais ativos</p>
          <p className={styles.kpiValue}>{data.channelDistribution.length}</p>
          <p className={styles.kpiMeta}>
            <span className={styles.cellMuted}>ML, Amazon e Shopee</span>
          </p>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Distribuição por canal</h3>
          {data.channelDistribution.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateTitle}>Sem vendas por canal neste mês</p>
              <p className={styles.emptyStateBody}>
                Assim que houver faturamento nos marketplaces, a distribuição aparece aqui.
              </p>
            </div>
          ) : (
            <div className={styles.channelList}>
              {data.channelDistribution.map((ch) => (
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
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Próximos recebimentos</h3>
          {data.paymentsReceivable.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateTitle}>Nenhum repasse programado</p>
              <p className={styles.emptyStateBody}>
                Repasses D+15 (Mercado Livre) e D+60 (Amazon) aparecem após processamento das NF-e.
              </p>
            </div>
          ) : (
            <div className={styles.paymentList}>
              {data.paymentsReceivable.map((p) => (
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
        </div>
      </div>

      {insights.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Insights da operação F5</h3>
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
        </div>
      )}
    </div>
  );
}
