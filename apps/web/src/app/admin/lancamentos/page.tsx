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
import { METRICS_CSV_TEMPLATE } from '@/lib/metrics/csv-import';

export default function LancamentosPage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
  const [saving, setSaving] = useState(false);
  const [importTenantId, setImportTenantId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
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
    fetch('/api/admin/tenants', { credentials: 'include' })
      .then((r) => r.json())
      .then(setTenants);
    fetch('/api/admin/metrics', { credentials: 'include' })
      .then((r) => r.json())
      .then(setMetrics);
  }, []);

  useEffect(() => {
    if (!form.tenantId) {
      setProducts([]);
      return;
    }
    fetch(`/api/admin/products?tenantId=${form.tenantId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setProducts);
  }, [form.tenantId]);

  const reloadMetrics = () =>
    fetch('/api/admin/metrics', { credentials: 'include' })
      .then((r) => r.json())
      .then(setMetrics);

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !importTenantId) return;

    setImporting(true);
    setImportResult('');
    setImportErrors([]);

    const formData = new FormData();
    formData.append('tenantId', importTenantId);
    formData.append('file', importFile);

    try {
      const res = await fetch('/api/admin/metrics/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportResult(data.error ?? 'Erro na importação');
        setImportErrors(data.details ?? []);
        return;
      }
      setImportResult(`${data.created} lançamento(s) importado(s)`);
      setImportErrors(data.errors ?? []);
      setImportFile(null);
      await reloadMetrics();
    } catch {
      setImportResult('Falha na conexão');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([METRICS_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'f5-metricas-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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
        credentials: 'include',
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

      <Card>
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Importar CSV (quinta-feira)</h2>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748B' }}>
          Exporte o relatório do ML/Amazon, ajuste colunas ou use o template F5.
          Colunas: sku, canal, impressoes, visitas, unidades, receita, posicao.
        </p>
        <form onSubmit={handleCsvImport} style={{ ...adminStyles.form, maxWidth: 560 }}>
          <label style={adminStyles.label}>
            Cliente
            <select
              required
              value={importTenantId}
              onChange={(e) => setImportTenantId(e.target.value)}
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
            Arquivo CSV
            <input
              type="file"
              accept=".csv,text/csv"
              required
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              style={adminStyles.input}
            />
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button type="submit" disabled={importing}>
              {importing ? 'Importando...' : 'Importar CSV'}
            </Button>
            <Button type="button" variant="secondary" onClick={downloadTemplate}>
              Baixar template
            </Button>
            <a
              href="/fixtures/metrics-sample.csv"
              download="f5-metricas-exemplo.csv"
              style={{ ...adminStyles.link, fontSize: 14, alignSelf: 'center' }}
            >
              CSV exemplo (4 SKUs)
            </a>
          </div>
        </form>
        {importResult && (
          <p style={{ marginTop: 12, fontSize: 14, color: '#059669' }}>{importResult}</p>
        )}
        {importErrors.length > 0 && (
          <ul style={{ marginTop: 8, fontSize: 13, color: '#B45309' }}>
            {importErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
