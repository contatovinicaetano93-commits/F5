'use client';

import React, { useEffect, useState } from 'react';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { fetchAdminJson } from '@/lib/admin/fetch';
import { adminStyles } from '@/lib/admin/styles';
import type { AdminAuditAction, AdminAuditEntry } from '@/lib/admin/audit';

const ACTION_LABELS: Record<string, string> = {
  'admin.login_success': 'Login OK',
  'admin.login_failed': 'Login falhou',
  'admin.login_rate_limited': 'Rate limit',
  'admin.logout': 'Logout',
  'admin.tenant_create': 'Novo cliente',
  'admin.tenant_update': 'Cliente atualizado',
  'admin.product_create': 'Novo SKU',
  'admin.product_update': 'SKU atualizado',
  'admin.catalog_import': 'Import catálogo',
  'admin.metric_create': 'Lançamento métrica',
  'admin.insight_create': 'Novo insight',
  'admin.insight_update': 'Insight atualizado',
  'admin.nf_upload': 'Upload NF-e',
  'admin.metrics_import': 'Import CSV métricas',
  'admin.payment_mark_paid': 'Repasse pago',
};

const ACTION_OPTIONS: { value: '' | AdminAuditAction; label: string }[] = [
  { value: '', label: 'Todas as ações' },
  { value: 'admin.tenant_create', label: 'Novo cliente' },
  { value: 'admin.product_create', label: 'Novo SKU' },
  { value: 'admin.product_update', label: 'SKU atualizado' },
  { value: 'admin.catalog_import', label: 'Import catálogo' },
  { value: 'admin.metric_create', label: 'Lançamento' },
  { value: 'admin.nf_upload', label: 'Upload NF-e' },
  { value: 'admin.metrics_import', label: 'Import CSV' },
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata) return '—';
  const parts: string[] = [];
  if (metadata.tenantId) parts.push(`tenant: ${String(metadata.tenantId).slice(0, 8)}…`);
  if (metadata.sku) parts.push(`sku: ${metadata.sku}`);
  if (metadata.nfNumber) parts.push(`NF ${metadata.nfNumber}`);
  if (metadata.name) parts.push(String(metadata.name));
  if (metadata.title) parts.push(String(metadata.title));
  if (metadata.created !== undefined) parts.push(`+${metadata.created} criados`);
  return parts.length > 0 ? parts.join(' · ') : JSON.stringify(metadata);
}

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<'' | AdminAuditAction>('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (actionFilter) params.set('action', actionFilter);

    fetchAdminJson<{ logs?: AdminAuditEntry[] }>(`/api/admin/audit?${params}`)
      .then((result) => {
        if (result.ok) {
          setLogs(Array.isArray(result.data.logs) ? result.data.logs : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [actionFilter]);

  return (
    <div style={adminStyles.page}>
      <div style={adminStyles.cardHeader}>
        <div>
          <h1 style={adminStyles.pageTitle}>Auditoria</h1>
          <p style={adminStyles.pageSubtitle}>
            Logins, cadastros, uploads e imports — últimas 100 ações do operador.
          </p>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as '' | AdminAuditAction)}
          style={adminStyles.select}
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <AdminPanelCard title="Registro de ações">
          <p style={{ color: '#64748B' }}>Carregando…</p>
        </AdminPanelCard>
      ) : logs.length === 0 ? (
        <AdminPanelCard title="Registro de ações">
          <p style={{ color: '#64748B' }}>
            Nenhum registro ainda. Ações passam a aparecer após login e operações no admin.
          </p>
        </AdminPanelCard>
      ) : (
        <AdminPanelCard title="Registro de ações">
          <div style={{ overflowX: 'auto' }}>
            <table style={adminStyles.table}>
              <thead>
                <tr>
                  <th style={adminStyles.th}>Quando</th>
                  <th style={adminStyles.th}>Ação</th>
                  <th style={adminStyles.th}>Operador</th>
                  <th style={adminStyles.th}>IP</th>
                  <th style={adminStyles.th}>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={adminStyles.td}>{formatWhen(log.createdAt)}</td>
                    <td style={adminStyles.td}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td style={adminStyles.td}>{log.actorEmail ?? '—'}</td>
                    <td style={adminStyles.td}>{log.ip ?? '—'}</td>
                    <td style={adminStyles.td}>{formatMetadata(log.metadata)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanelCard>
      )}
    </div>
  );
}
