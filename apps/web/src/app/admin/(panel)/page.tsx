'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminJson } from '@/lib/admin/fetch';
import { adminStyles } from '@/lib/admin/styles';
import { SEGMENT_LABELS, type TenantSegment } from '@/types/internal';

/* ── Types ── */
interface Overview {
  activeTenants: number;
  totalTenants: number;
  metricsThisWeek: number;
  lowGiroCount: number;
  pendingNfs: number;
  clientInsights: number;
  insightOnTimePct?: number;
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
  const r = body as Record<string, unknown>;
  if (!Array.isArray(r.segments)) return null;
  return body as Overview;
}

/* ── Icons ── */
function IcChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IcMore() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

/* ── DashSection ── */
type DashSectionProps = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  href?: string;
  secondary?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function DashSection({ icon, title, subtitle, badge, href, open, onToggle, children }: DashSectionProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(13,27,42,0.07)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(0,102,255,0.07)',
            display: 'grid',
            placeItems: 'center',
            color: '#0066FF',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#0D1B2A', lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#8B9CB6', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </div>
        </div>

        {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {href && (
            <Link
              href={href}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#0066FF',
                textDecoration: 'none',
                padding: '4px 10px',
                border: '1px solid rgba(0,102,255,0.2)',
                borderRadius: 6,
                whiteSpace: 'nowrap',
              }}
            >
              Ver tudo →
            </Link>
          )}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#8B9CB6', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'grid', placeItems: 'center' }}
          >
            <IcMore />
          </button>
        </div>

        <div style={{ color: '#8B9CB6', flexShrink: 0 }}>
          <IcChevron open={open} />
        </div>
      </div>

      {open && (
        <div style={{ padding: '16px 20px 18px', borderTop: '1px solid rgba(13,27,42,0.05)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Badges ── */
function BadgeIA() {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#7C3AED', background: 'rgba(124,58,237,0.1)', padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a6 6 0 016 6c0 2.2-1.1 4.1-2.8 5.3V16a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.7A6 6 0 0112 2z" />
        <path d="M9 21h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      IA
    </span>
  );
}

function BadgeAlert({ label, color = '#F59E0B' }: { label: string; color?: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, padding: '3px 8px', borderRadius: 20 }}>
      {label}
    </span>
  );
}

/* ── KPI row ── */
function KpiRow({ items }: { items: { label: string; value: string | number; color?: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(13,27,42,0.06)' }}>
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          style={{
            flex: '1 1 140px',
            padding: '14px 18px',
            borderRight: i < items.length - 1 ? '1px solid rgba(13,27,42,0.06)' : 'none',
            background: '#FAFBFD',
          }}
        >
          <div style={{ fontSize: 11, color: '#8B9CB6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            {kpi.label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color ?? '#0D1B2A', lineHeight: 1 }}>
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Action button style ── */
function actionBtn(color: string): React.CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    color,
    background: `${color}10`,
    border: `1px solid ${color}28`,
    padding: '6px 12px',
    borderRadius: 7,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  };
}

/* ── Control button style ── */
const ctrlBtn: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#5C6B82',
  background: '#fff',
  border: '1px solid rgba(13,27,42,0.12)',
  borderRadius: 7,
  padding: '6px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontFamily: 'inherit',
};

type SectionId = 'relatorio' | 'passos' | 'lancamentos' | 'clientes' | 'segmentos' | 'piloto' | 'gates';
const secondaryIds: SectionId[] = ['segmentos', 'piloto', 'gates'];
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AdminHomePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    relatorio: true,
    passos: true,
    lancamentos: false,
    clientes: false,
    segmentos: false,
    piloto: false,
    gates: false,
  });

  const toggle = (id: SectionId) => setOpen((s) => ({ ...s, [id]: !s[id] }));
  const collapseAll = () => setOpen((s) => Object.fromEntries(Object.keys(s).map((k) => [k, false])) as Record<SectionId, boolean>);
  const collapseSecondary = () => setOpen((s) => { const n = { ...s }; secondaryIds.forEach((id) => { n[id] = false; }); return n; });
  const expandAll = () => setOpen((s) => Object.fromEntries(Object.keys(s).map((k) => [k, true])) as Record<SectionId, boolean>);

  useEffect(() => {
    fetchAdminJson<Overview>('/api/admin/overview')
      .then((r) => {
        if (!r.ok) { setLoadError(r.error || 'Erro ao carregar.'); return; }
        const ov = parseOverview(r.data);
        if (!ov) { setLoadError('Resposta inválida.'); return; }
        setData(ov);
      })
      .catch(() => setLoadError('Erro de rede.'));
  }, []);

  const now = new Date();
  const MONTH_CAP = (() => {
    const s = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();
  const diaSemana = DIAS[now.getDay()];
  const weekday = now.getDay();

  return (
    <div style={{ ...adminStyles.page, maxWidth: 920 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ ...adminStyles.pageTitle, marginBottom: 4 }}>Visão Geral</h1>
          <p style={{ ...adminStyles.pageSubtitle, margin: 0 }}>{MONTH_CAP} · Dados reais</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/admin/lancamentos" style={actionBtn('#0066FF')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
            Novo lançamento
          </Link>
          <Link href="/admin/insights" style={actionBtn('#7C3AED')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round" /></svg>
            Publicar insight
          </Link>
        </div>
      </div>

      {/* Alert banners */}
      {loadError && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>{loadError}</span>
        </div>
      )}
      {!!data?.lowGiroCount && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>{data.lowGiroCount} produto(s) com giro baixo — revisar curadoria</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/lancamentos" style={actionBtn('#D97706')}>Ver lançamentos</Link>
            <Link href="/admin/insights" style={actionBtn('#7C3AED')}>Criar insight</Link>
          </div>
        </div>
      )}
      {!!data?.pendingNfs && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 500 }}>{data.pendingNfs} NF-e(s) aguardando processamento</span>
        </div>
      )}

      {/* Section controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" style={ctrlBtn} onClick={collapseAll}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" strokeLinecap="round" /></svg>
          Recolher tudo
        </button>
        <button type="button" style={ctrlBtn} onClick={collapseSecondary}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12H3M15 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Recolher secundários
        </button>
        <button type="button" style={ctrlBtn} onClick={expandAll}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Expandir tudo
        </button>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Relatório do mês */}
        <DashSection
          id="relatorio"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" /></svg>}
          title="Relatório do mês"
          subtitle={`${MONTH_CAP} · ${data?.activeTenants ?? '—'} cliente(s) ativo(s) · ${data?.metricsThisWeek ?? '—'} lançamento(s) esta semana`}
          badge={<BadgeIA />}
          open={open.relatorio}
          onToggle={() => toggle('relatorio')}
        >
          <KpiRow items={[
            { label: 'Clientes ativos', value: data ? `${data.activeTenants}/${data.totalTenants}` : '—' },
            { label: 'Lançamentos / semana', value: data?.metricsThisWeek ?? '—' },
            { label: 'Insights publicados', value: data?.clientInsights ?? '—' },
            { label: 'Insights no prazo', value: data?.insightOnTimePct != null ? `${data.insightOnTimePct}%` : '—', color: (data?.insightOnTimePct ?? 0) >= 75 ? '#0D9F6E' : '#C98A0A' },
          ]} />
        </DashSection>

        {/* Próximo passo */}
        <DashSection
          id="passos"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinejoin="round" /></svg>}
          title="Próximo passo"
          subtitle={`${diaSemana} — fluxo semanal do operador`}
          badge={<BadgeAlert label={diaSemana} color="#0066FF" />}
          open={open.passos}
          onToggle={() => toggle('passos')}
          href="/admin/checklist"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { dia: 'Seg', acao: 'Revisar KPIs e giro baixo', done: weekday > 1 },
              { dia: 'Ter–Qua', acao: 'Otimizar anúncios nos marketplaces', done: weekday > 3 },
              { dia: 'Qui', acao: 'Importar CSV + processar NF-e', done: weekday > 4 },
              { dia: 'Sex', acao: 'Publicar insight para o cliente', done: weekday > 5 },
            ].map((step) => (
              <div key={step.dia} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 22, borderRadius: 4, background: step.done ? 'rgba(13,159,110,0.1)' : 'rgba(0,102,255,0.07)', color: step.done ? '#0D9F6E' : '#0066FF', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', letterSpacing: '0.04em', flexShrink: 0 }}>
                  {step.dia}
                </div>
                <span style={{ fontSize: 13, color: step.done ? '#8B9CB6' : '#1a2332', textDecoration: step.done ? 'line-through' : 'none' }}>
                  {step.acao}
                </span>
              </div>
            ))}
          </div>
        </DashSection>

        {/* Lançamentos */}
        <DashSection
          id="lancamentos"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title="Lançamentos e receita"
          subtitle={`${data?.metricsThisWeek ?? '—'} lançamento(s) esta semana · ${data?.lowGiroCount ? `${data.lowGiroCount} produto(s) com giro baixo` : 'giro OK'}`}
          badge={data?.lowGiroCount ? <BadgeAlert label={`${data.lowGiroCount} baixo giro`} /> : undefined}
          open={open.lancamentos}
          onToggle={() => toggle('lancamentos')}
          href="/admin/lancamentos"
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/admin/lancamentos" style={actionBtn('#0066FF')}>Ver lançamentos</Link>
            <Link href="/admin/lancamentos?import=1" style={actionBtn('#0D9F6E')}>Importar CSV</Link>
            <Link href="/admin/nfe" style={actionBtn('#7C3AED')}>Upload NF-e</Link>
          </div>
        </DashSection>

        {/* Clientes */}
        <DashSection
          id="clientes"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinejoin="round" /></svg>}
          title="Clientes"
          subtitle={`${data?.totalTenants ?? '—'} total · ${data?.activeTenants ?? '—'} ativo(s)`}
          open={open.clientes}
          onToggle={() => toggle('clientes')}
          href="/admin/clientes"
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/admin/clientes" style={actionBtn('#0066FF')}>Lista de clientes</Link>
            <Link href="/admin/clientes?novo=1" style={actionBtn('#0D9F6E')}>Novo cliente</Link>
          </div>
        </DashSection>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(13,27,42,0.07)' }} />
          <span style={{ fontSize: 10, color: '#8B9CB6', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Secundários</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(13,27,42,0.07)' }} />
        </div>

        {/* Segmentos */}
        <DashSection
          id="segmentos"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title="Por segmento"
          subtitle={`${data?.segments?.length ?? 0} segmento(s) mapeado(s)`}
          secondary
          open={open.segmentos}
          onToggle={() => toggle('segmentos')}
        >
          {data?.segments?.length ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.segments.map((s) => (
                <div key={s.segment} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(0,102,255,0.07)', border: '1px solid rgba(0,102,255,0.15)', fontSize: 12, color: '#0066FF', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {SEGMENT_LABELS[s.segment as TenantSegment] ?? s.segment}
                  <span style={{ background: '#0066FF', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'grid', placeItems: 'center' }}>{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#8B9CB6' }}>Sem dados de segmento.</p>
          )}
        </DashSection>

        {/* Piloto comercial */}
        <DashSection
          id="piloto"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title="Readiness piloto comercial"
          subtitle={data?.pilotReadiness ? `${data.pilotReadiness.tenantName ?? ''} · Gate 4` : 'Verificando pré-requisitos...'}
          badge={data?.pilotReadiness ? <BadgeAlert label={data.pilotReadiness.ready ? 'Pronto' : 'Pendente'} color={data.pilotReadiness.ready ? '#0D9F6E' : '#C98A0A'} /> : undefined}
          secondary
          open={open.piloto}
          onToggle={() => toggle('piloto')}
        >
          {data?.pilotReadiness ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.pilotReadiness.checks?.map((c) => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: c.ok ? 'rgba(13,159,110,0.12)' : 'rgba(13,27,42,0.06)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {c.ok ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0D9F6E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }} />
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: c.ok ? '#1a2332' : '#8B9CB6' }}>{c.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#8B9CB6' }}>Carregando...</p>
          )}
        </DashSection>

        {/* Gates */}
        <DashSection
          id="gates"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="5" height="18" rx="1" /><rect x="9.5" y="3" width="5" height="18" rx="1" /><rect x="17" y="3" width="5" height="18" rx="1" /></svg>}
          title="Validação técnica"
          subtitle="Gates de qualidade do sistema"
          secondary
          open={open.gates}
          onToggle={() => toggle('gates')}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['pnpm gate1:validate', 'pnpm gate2:validate', 'pnpm gate3:validate', 'pnpm gate-pilot:e2e', 'pnpm test:isolation'].map((cmd) => (
              <code key={cmd} style={{ fontSize: 12, background: 'rgba(13,27,42,0.04)', border: '1px solid rgba(13,27,42,0.08)', borderRadius: 6, padding: '4px 10px', color: '#0066FF', fontFamily: 'monospace' }}>
                {cmd}
              </code>
            ))}
          </div>
        </DashSection>

      </div>
    </div>
  );
}
