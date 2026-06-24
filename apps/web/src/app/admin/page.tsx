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
  pilotReadiness?: {
    ready: boolean;
    tenantName?: string;
    tenantId?: string;
    checks: { label: string; ok: boolean }[];
  };
}

export default function AdminHomePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/overview', { credentials: 'include' })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) {
          setLoadError(body.error ?? 'Não foi possível carregar o painel.');
          return;
        }
        setData(body as Overview);
      })
      .catch(() => {
        setLoadError('Erro de rede ao carregar o painel.');
      });
  }, []);

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Central do operador</h1>
        <p style={adminStyles.pageSubtitle}>
          Segunda-feira: revisar KPIs, identificar giro baixo, atualizar lançamentos.
        </p>
      </div>

      {loadError && (
        <Card variant="outlined">
          <p style={{ margin: 0, color: '#DC2626' }}>{loadError}</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#8B9CB6' }}>
            Tente{' '}
            <Link href="/admin/login" style={adminStyles.link}>
              entrar novamente
            </Link>
            .
          </p>
        </Card>
      )}

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
              {data?.segments?.map((s) => (
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
        <h2 style={{ margin: '0 0 12px', fontSize: '18px' }}>Readiness piloto comercial</h2>
        {data?.pilotReadiness ? (
          <>
            <p style={{ margin: '0 0 12px', color: data.pilotReadiness.ready ? '#0D9F6E' : '#C98A0A' }}>
              {data.pilotReadiness.ready ? '✅ Pronto para Gate 4' : '⏳ Pendências para Gate 4'} —{' '}
              {data.pilotReadiness.tenantName}
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {data.pilotReadiness.checks.map((c) => (
                <li key={c.label} style={{ color: c.ok ? '#0D9F6E' : '#8B9CB6' }}>
                  {c.ok ? '✓' : '○'} {c.label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p style={{ margin: 0, color: '#8B9CB6' }}>Carregando…</p>
        )}
      </Card>

      <Card variant="outlined">
        <p style={{ margin: 0, fontSize: 14, color: '#8B9CB6' }}>
          Gates: `pnpm gate1:validate` · `pnpm gate2:validate` · `pnpm gate3:validate`
        </p>
      </Card>
    </div>
  );
}
