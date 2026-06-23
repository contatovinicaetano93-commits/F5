'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@f5/ui';
import { adminStyles, formatBRL, formatPct } from '@/lib/admin/styles';
import {
  MARKETPLACE_LABELS,
  type InternalTenant,
  type InternalProduct,
  type ProductMetric,
  type Marketplace,
} from '@/types/internal';

export default function LancamentosPage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tenantId: '',
    productId: '',
    marketplace: 'mercado_livre' as Marketplace,
    impressions: 0,
    visits: 0,
    unitsSold: 0,
    revenue: 0,
    searchPosition: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/admin/tenants').then((r) => r.json()).then(setTenants);
    fetch('/api/admin/metrics').then((r) => r.json()).then(setMetrics);
  }, []);

  useEffect(() => {
    if (!form.tenantId) {
      setProducts([]);
      return;
    }
    fetch(`/api/admin/products?tenantId=${form.tenantId}`)
      .then((r) => r.json())
      .then(setProducts);
  }, [form.tenantId]);

  const weekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          periodStart: weekStart(),
          periodEnd: new Date().toISOString(),
          searchPosition: form.searchPosition ? Number(form.searchPosition) : undefined,
          notes: form.notes || undefined,
        }),
      });
      const created = await res.json();
      setMetrics((prev) => [created, ...prev]);
      setForm((f) => ({
        ...f,
        impressions: 0,
        visits: 0,
        unitsSold: 0,
        revenue: 0,
        searchPosition: '',
        notes: '',
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Lançamentos</h1>
        <p style={adminStyles.pageSubtitle}>
          Registrar métricas do marketplace manualmente (relatório ML/Amazon)
        </p>
      </div>

      <div style={adminStyles.grid2}>
        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Novo lançamento</h2>
          <form onSubmit={handleSubmit} style={adminStyles.form}>
            <label style={adminStyles.label}>
              Cliente
              <select
                required
                value={form.tenantId}
                onChange={(e) =>
                  setForm({ ...form, tenantId: e.target.value, productId: '' })
                }
                style={adminStyles.select}
              >
                <option value="">Selecione...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={adminStyles.label}>
              Produto (SKU)
              <select
                required
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                style={adminStyles.select}
                disabled={!form.tenantId}
              >
                <option value="">Selecione...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={adminStyles.label}>
              Canal
              <select
                value={form.marketplace}
                onChange={(e) =>
                  setForm({ ...form, marketplace: e.target.value as Marketplace })
                }
                style={adminStyles.select}
              >
                {Object.entries(MARKETPLACE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={adminStyles.label}>
                Impressões
                <input
                  type="number"
                  min={0}
                  value={form.impressions}
                  onChange={(e) =>
                    setForm({ ...form, impressions: Number(e.target.value) })
                  }
                  style={adminStyles.input}
                />
              </label>
              <label style={adminStyles.label}>
                Visitas
                <input
                  type="number"
                  min={0}
                  value={form.visits}
                  onChange={(e) => setForm({ ...form, visits: Number(e.target.value) })}
                  style={adminStyles.input}
                />
              </label>
              <label style={adminStyles.label}>
                Unidades vendidas
                <input
                  type="number"
                  min={0}
                  value={form.unitsSold}
                  onChange={(e) =>
                    setForm({ ...form, unitsSold: Number(e.target.value) })
                  }
                  style={adminStyles.input}
                />
              </label>
              <label style={adminStyles.label}>
                Receita (R$)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.revenue}
                  onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })}
                  style={adminStyles.input}
                />
              </label>
            </div>

            <label style={adminStyles.label}>
              Posição na busca
              <input
                type="number"
                min={1}
                value={form.searchPosition}
                onChange={(e) => setForm({ ...form, searchPosition: e.target.value })}
                style={adminStyles.input}
                placeholder="Ex: 8"
              />
            </label>

            <label style={adminStyles.label}>
              Observações
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={adminStyles.textarea}
              />
            </label>

            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Registrar lançamento'}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Histórico recente</h2>
          <table style={adminStyles.table}>
            <thead>
              <tr>
                <th style={adminStyles.th}>Produto</th>
                <th style={adminStyles.th}>Vendas</th>
                <th style={adminStyles.th}>Receita</th>
                <th style={adminStyles.th}>Conv.</th>
              </tr>
            </thead>
            <tbody>
              {metrics.slice(0, 8).map((m) => (
                <tr key={m.id}>
                  <td style={adminStyles.td}>{m.productId.slice(-6)}</td>
                  <td style={adminStyles.td}>{m.unitsSold}</td>
                  <td style={adminStyles.td}>{formatBRL(m.revenue)}</td>
                  <td style={adminStyles.td}>
                    {m.conversionRate ? formatPct(m.conversionRate) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
