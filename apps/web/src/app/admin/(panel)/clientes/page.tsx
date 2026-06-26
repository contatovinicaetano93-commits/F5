'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@f5/ui';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { fetchAdminJson, fetchAdminList } from '@/lib/admin/fetch';
import { adminStyles } from '@/lib/admin/styles';
import {
  SEGMENT_LABELS,
  SCENARIO_LABELS,
  type InternalTenant,
  type OperatingScenario,
  type TenantSegment,
} from '@/types/internal';

const DEFAULT_FORM = {
  name: '',
  cnpj: '',
  segment: 'PET' as TenantSegment,
  scenario: 'BRACO_ONLINE' as OperatingScenario,
  status: 'trial' as InternalTenant['status'],
};

export default function ClientesPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [filter, setFilter] = useState<TenantSegment | ''>('');
  const [textSearch, setTextSearch] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );

  const loadTenants = () => {
    const url = filter ? `/api/admin/tenants?segment=${filter}` : '/api/admin/tenants';
    fetchAdminList<InternalTenant>(url).then(setTenants).catch(console.error);
  };

  useEffect(() => {
    loadTenants();
  }, [filter]);

  const filteredTenants = useMemo(() => {
    const q = textSearch.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.cnpj?.toLowerCase().includes(q) ?? false),
    );
  }, [tenants, textSearch]);

  const statusBadge = (status: InternalTenant['status']) => {
    const map = {
      active: ['#10B981', '#D1FAE5'],
      trial: ['#0066FF', '#DBEAFE'],
      inactive: ['#8B9CB6', '#F4F6F9'],
    } as const;
    const [color, bg] = map[status];
    return <span style={adminStyles.badge(color, bg)}>{status}</span>;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const result = await fetchAdminJson<InternalTenant>('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        cnpj: form.cnpj.trim() || undefined,
        segment: form.segment,
        scenario: form.scenario,
        status: form.status,
      }),
    });

    setSubmitting(false);

    if (!result.ok) {
      setMessage({ type: 'err', text: result.error });
      return;
    }

    setMessage({ type: 'ok', text: `Cliente "${result.data.name}" cadastrado.` });
    setForm(DEFAULT_FORM);
    router.push(`/admin/clientes/${result.data.id}`);
  };

  return (
    <div style={adminStyles.page}>
      <div style={adminStyles.cardHeader}>
        <div>
          <h1 style={adminStyles.pageTitle}>Clientes</h1>
          <p style={adminStyles.pageSubtitle}>Indústrias atendidas pela F5</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="search"
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            placeholder="Buscar nome ou CNPJ…"
            style={{ ...adminStyles.input, minWidth: 200 }}
          />
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
      </div>

      {message && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            backgroundColor: message.type === 'ok' ? '#D1FAE5' : '#FEE2E2',
            color: message.type === 'ok' ? '#065F46' : '#991B1B',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={adminStyles.grid2}>
        <AdminPanelCard title="Novo cliente">
          <form onSubmit={handleCreate} style={adminStyles.form}>
            <label style={adminStyles.label}>
              Nome da indústria
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={adminStyles.input}
                placeholder="Ex.: Indústria Pet — Piloto"
              />
            </label>
            <label style={adminStyles.label}>
              CNPJ (opcional)
              <input
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                style={adminStyles.input}
                placeholder="00.000.000/0000-00"
              />
            </label>
            <label style={adminStyles.label}>
              Segmento
              <select
                required
                value={form.segment}
                onChange={(e) =>
                  setForm({ ...form, segment: e.target.value as TenantSegment })
                }
                style={adminStyles.select}
              >
                {(Object.keys(SEGMENT_LABELS) as TenantSegment[]).map((s) => (
                  <option key={s} value={s}>
                    {SEGMENT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label style={adminStyles.label}>
              Cenário operacional
              <select
                required
                value={form.scenario}
                onChange={(e) =>
                  setForm({ ...form, scenario: e.target.value as OperatingScenario })
                }
                style={adminStyles.select}
              >
                {(Object.keys(SCENARIO_LABELS) as OperatingScenario[]).map((s) => (
                  <option key={s} value={s}>
                    {SCENARIO_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label style={adminStyles.label}>
              Status
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as InternalTenant['status'],
                  })
                }
                style={adminStyles.select}
              >
                <option value="trial">trial</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Cadastrar cliente'}
            </Button>
          </form>
        </AdminPanelCard>

        <AdminPanelCard title={`${filteredTenants.length} clientes`}>
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
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...adminStyles.td, color: '#8B9CB6' }}>
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id}>
                    <td style={adminStyles.td}>
                      <strong>{t.name}</strong>
                    </td>
                    <td style={adminStyles.td}>
                      {SEGMENT_LABELS[t.segment as TenantSegment] ?? t.segment}
                    </td>
                    <td style={adminStyles.td}>{SCENARIO_LABELS[t.scenario]}</td>
                    <td style={adminStyles.td}>{statusBadge(t.status)}</td>
                    <td style={adminStyles.td}>
                      <Link href={`/admin/clientes/${t.id}`} style={adminStyles.link}>
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminPanelCard>
      </div>
    </div>
  );
}
