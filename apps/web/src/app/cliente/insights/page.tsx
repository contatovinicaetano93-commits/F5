'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/client.module.css';
import { ClientSkeleton } from '@/components/client/ClientSkeleton';

interface Insight {
  id: string;
  title: string;
  body: string;
  weekOf: string | null;
  createdAt: string;
}

export default function ClienteInsightsPage() {
  const [insights, setInsights] = useState<Insight[] | null>(null);

  useEffect(() => {
    fetch('/api/client/insights', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setInsights(data.items ?? []))
      .catch(console.error);
  }, []);

  if (insights === null) {
    return <ClientSkeleton rows={2} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>Insights da operação</h2>
        <p className={styles.pageSubtitle}>
          Análises e recomendações da equipe F5 sobre performance nos marketplaces.
        </p>
      </div>

      {insights.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateTitle}>Nenhum insight publicado ainda</p>
          <p className={styles.emptyStateBody}>
            A equipe F5 publica aqui análises semanais sobre seus produtos e canais.
            Volte em breve ou fale com seu gestor de conta.
          </p>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.insightList}>
            {insights.map((insight) => (
              <article key={insight.id} className={styles.insightItem}>
                <h3 className={styles.insightTitle}>{insight.title}</h3>
                <p className={styles.insightBody}>{insight.body}</p>
                <span className={styles.cellMuted}>
                  {insight.weekOf
                    ? `Semana de ${new Date(insight.weekOf).toLocaleDateString('pt-BR')}`
                    : new Date(insight.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
