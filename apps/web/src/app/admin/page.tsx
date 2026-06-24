'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@f5/ui';
import { adminStyles } from '@/lib/admin/styles';
import { SEGMENT_LABELS, type TenantSegment } from '@/types/internal';

interface Overview {
  activeTenants: number;
  totalTenants: number;
  metricsThisWeek: number;
  lowGiroCount: number;
  pendingNfs: number;
  clientInsights: number;
  segments: { segment: TenantSegment; count: number }[];
}

export default function AdminHomePage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Central do operador</h1>
        <p style={adminStyles.pageSubtitle}>
          Segunda-feira: revisar KPIs, identificar giro baixo, atualizar lançamentos.
        </p>
      </div>

      <div style={adminStyles.grid4}>
        <Card>
          <p style={adminStyles.kpiLabel}>Clientes ativos</p>
          <p style={adminStyles.kpiValue}>
            {data?.activeTenants ?? '—'} / {data?.totalTenants ?? '—'}
          </p>
        </Card>
        <Card>
          <p style={adminStyles.kpiLabel}>Lançamentos esta semana</p>
          <p style={adminStyles.kpiValue}>{data?.metricsThisWeek ?? '—'}</p>
        </Card>
        <Card>
          <p style={adminStyles.kpiLabel}>Produtos com giro baixo</p>
          <p style={{ ...adminStyles.kpiValue, color: '#F59E0B' }}>
            {data?.lowGiroCount ?? '—'}
          </p>
        </Card>
        <Card>
          <p style={adminStyles.kpiLabel}>Insights para cliente</p>
          <p style={adminStyles.kpiValue}>{data?.clientInsights ?? '—'}</p>
        </Card>
      </div>

      <div style={adminStyles.grid2}>
        <Card>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Por segmento</h2>
          <table style={{ ...adminStyles.table, marginTop: 16 }}>
            <thead>
              <tr>
                <th style={adminStyles.th}>Segmento</th>
                <th style={adminStyles.th}>Clientes</th>
              </tr>
            </thead>
            <tbody>
              {data?.segments.map((s) => (
                <tr key={s.segment}>
                  <td style={adminStyles.td}>{SEGMENT_LABELS[s.segment]}</td>
                  <td style={adminStyles.td}>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Fluxo semanal (operador)</h2>
          <ol style={{ margin: '16px 0 0', paddingLeft: 20, lineHeight: 1.8, color: '#2D3748' }}>
            <li><strong>Segunda</strong> — Revisar KPIs e giro baixo abaixo</li>
            <li><strong>Ter–Qua</strong> — Otimizar anúncios nos marketplaces (manual)</li>
            <li><strong>Quinta</strong> — Importar CSV + processar NF-e</li>
            <li><strong>Sexta</strong> — Publicar insight → cliente vê no portal</li>
          </ol>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/admin/clientes" style={adminStyles.link}>
              Clientes
            </Link>
            <Link href="/admin/lancamentos" style={adminStyles.link}>
              + Lançamento / CSV
            </Link>
            <Link href="/admin/insights" style={adminStyles.link}>
              + Insight
            </Link>
            <Link href="/admin/nfe" style={adminStyles.link}>
              Upload NF-e
            </Link>
          </div>
        </Card>
      </div>

      <Card variant="outlined">
        <p style={{ margin: 0, fontSize: 14, color: '#8B9CB6' }}>
          Fase 2 — dados reais no Neon. Próximo gate: NF-e real do piloto + review semanal com cliente.
        </p>
      </Card>
    </div>
  );
}
