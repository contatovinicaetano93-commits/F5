'use client';

import React, { useEffect, useState } from 'react';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { fetchAdminJson } from '@/lib/admin/fetch';
import { adminStyles } from '@/lib/admin/styles';
import type { AdminAuditEntry } from '@/lib/admin/audit';

const ACTION_LABELS: Record<string, string> = {
  'admin.login_success': 'Login OK',
  'admin.login_failed': 'Login falhou',
  'admin.login_rate_limited': 'Rate limit',
  'admin.logout': 'Logout',
  'admin.nf_upload': 'Upload NF-e',
  'admin.metrics_import': 'Import CSV',
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminJson<{ logs?: AdminAuditEntry[] }>('/api/admin/audit?limit=100')
      .then((result) => {
        if (result.ok) {
          setLogs(Array.isArray(result.data.logs) ? result.data.logs : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Auditoria</h1>
        <p style={adminStyles.pageSubtitle}>
          Logins, uploads e imports — últimas 100 ações do operador.
        </p>
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
                  <td style={adminStyles.td}>
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
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
