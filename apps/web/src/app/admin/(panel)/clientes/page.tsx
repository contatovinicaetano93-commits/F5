'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { adminStyles } from '@/lib/admin/styles';
import {
  SEGMENT_LABELS,
  SCENARIO_LABELS,
  type InternalTenant,
  type TenantSegment,
} from '@/types/internal';

export default function ClientesPage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [filter, setFilter] = useState<TenantSegment | ''>('');

  useEffect(() => {
    const url = filter ? `/api/admin/tenants?segment=${filter}` : '/api/admin/tenants';
    fetch(url)
      .then((r) => r.json())
      .then(setTenants)
      .catch(console.error);
  }, [filter]);

  const statusBadge = (status: InternalTenant['status']) => {
    const map = {
      active: ['#10B981', '#D1FAE5'],
      trial: ['#0066FF', '#DBEAFE'],
      inactive: ['#8B9CB6', '#F4F6F9'],
    } as const;
    const [color, bg] = map[status];
    return <span style={adminStyles.badge(color, bg)}>{status}</span>;
  };

  return (
    <div style={adminStyles.page}>
      <div style={adminStyles.cardHeader}>
        <div>
          <h1 style={adminStyles.pageTitle}>Clientes</h1>
          <p style={adminStyles.pageSubtitle}>Indústrias atendidas pela F5</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TenantSegment | '')}
          style={adminStyles.select}
        >
          <option value="">Todos os segmentos</option>
          {(Object.keys(SEGMENT_LABELS) as TenantSegment[]).map((s) => (
            <option key={s} value={s}>
              {SEGMENT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <AdminPanelCard title="Lista de clientes">
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={adminStyles.th}>Nome</th>
              <th style={adminStyles.th}>Segmento</th>
              <th style={adminStyles.th}>Cenário</th>
              <th style={adminStyles.th}>Status</th>
              <th style={adminStyles.th}></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td style={adminStyles.td}>
                  <strong>{t.name}</strong>
                </td>
                <td style={adminStyles.td}>{SEGMENT_LABELS[t.segment]}</td>
                <td style={adminStyles.td}>{SCENARIO_LABELS[t.scenario]}</td>
                <td style={adminStyles.td}>{statusBadge(t.status)}</td>
                <td style={adminStyles.td}>
                  <Link href={`/admin/clientes/${t.id}`} style={adminStyles.link}>
                    Abrir →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPanelCard>
    </div>
  );
}
