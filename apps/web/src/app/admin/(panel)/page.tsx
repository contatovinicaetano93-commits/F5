'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { fetchAdminJson } from '@/lib/admin/fetch';
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
    checks?: { label: string; ok: boolean }[];
  };
}

function parseOverview(body: unknown): Overview | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.segments)) return null;
  return body as Overview;
}

export default function AdminHomePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminJson<Overview>('/api/admin/overview')
      .then((result) => {
        if (!result.ok) {
          setLoadError(result.error || 'Não foi possível carregar o painel.');
          return;
        }
        const overview = parseOverview(result.data);
        if (!overview) {
          setLoadError('Resposta inválida do servidor.');
          return;
        }
        setData(overview);
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
        <AdminPanelCard title="Erro ao carregar" variant="outlined">
          <p style={{ margin: 0, color: '#DC2626' }}>{loadError}</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#8B9CB6' }}>
            Tente{' '}
            <Link href="/admin/login" style={adminStyles.link}>
              entrar novamente
            </Link>
            .
          </p>
        </AdminPanelCard>
      )}

      <div style={adminStyles.grid4}>
        <AdminPanelCard title="Clientes ativos">
          <p style={adminStyles.kpiValue}>
            {data?.activeTenants ?? '—'} / {data?.totalTenants ?? '—'}
          </p>
        </AdminPanelCard>
        <AdminPanelCard title="Lançamentos esta semana">
          <p style={adminStyles.kpiValue}>{data?.metricsThisWeek ?? '—'}</p>
        </AdminPanelCard>
        <AdminPanelCard title="Produtos com giro baixo">
          <p style={{ ...adminStyles.kpiValue, color: '#F59E0B' }}>
            {data?.lowGiroCount ?? '—'}
          </p>
        </AdminPanelCard>
        <AdminPanelCard title="Insights para cliente">
          <p style={adminStyles.kpiValue}>{data?.clientInsights ?? '—'}</p>
        </AdminPanelCard>
      </div>

      <div style={adminStyles.grid2}>
        <AdminPanelCard title="Por segmento">
          <table style={adminStyles.table}>
            <thead>
              <tr>
                <th style={adminStyles.th}>Segmento</th>
                <th style={adminStyles.th}>Clientes</th>
              </tr>
            </thead>
            <tbody>
              {data?.segments?.map((s) => (
                <tr key={s.segment}>
                  <td style={adminStyles.td}>
                    {SEGMENT_LABELS[s.segment as TenantSegment] ?? s.segment}
                  </td>
                  <td style={adminStyles.td}>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanelCard>

        <AdminPanelCard title="Fluxo semanal (operador)">
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: '#2D3748' }}>
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
        </AdminPanelCard>
      </div>

      <AdminPanelCard title="Readiness piloto comercial" variant="outlined">
        {data?.pilotReadiness ? (
          <>
            <p style={{ margin: '0 0 12px', color: data.pilotReadiness.ready ? '#0D9F6E' : '#C98A0A' }}>
              {data.pilotReadiness.ready ? '✅ Pronto para Gate 4' : '⏳ Pendências para Gate 4'} —{' '}
              {data.pilotReadiness.tenantName}
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {data.pilotReadiness.checks?.map((c) => (
                <li key={c.label} style={{ color: c.ok ? '#0D9F6E' : '#8B9CB6' }}>
                  {c.ok ? '✓' : '○'} {c.label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p style={{ margin: 0, color: '#8B9CB6' }}>Carregando…</p>
        )}
      </AdminPanelCard>

      <AdminPanelCard title="Validação técnica (gates)" variant="outlined" defaultOpen={false}>
        <p style={{ margin: 0, fontSize: 14, color: '#8B9CB6' }}>
          Gates: `pnpm gate1:validate` · `pnpm gate2:validate` · `pnpm gate3:validate`
        </p>
      </AdminPanelCard>
    </div>
  );
}
