'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { Toast } from '@/components/admin/Toast';
import { fetchAdminJson, fetchAdminList } from '@/lib/admin/fetch';
import { CATALOG_CSV_TEMPLATE, parseCatalogCsv } from '@/lib/admin/catalog-import';
import { Button } from '@f5/ui';
import { adminStyles } from '@/lib/admin/styles';
import {
  MARKETPLACE_LABELS,
  type InternalTenant,
  type InternalProduct,
  type Marketplace,
  type ProductMetric,
} from '@/types/internal';

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const openImport = searchParams.get('import') === '1';
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
  const [filter, setFilter] = useState('');
  const [textSearch, setTextSearch] = useState('');
  const [editing, setEditing] = useState<InternalProduct | null>(null);
  const [importTenantId, setImportTenantId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const [importPreview, setImportPreview] = useState<{
    valid: number;
    errors: string[];
    sample: string[];
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );
  const dismissToast = useCallback(() => setToast(null), []);
  const [form, setForm] = useState({
    tenantId: '',
    sku: '',
    name: '',
    category: '',
    marketplace: 'mercado_livre' as Marketplace,
  });

  const loadProducts = (tenantId?: string) => {
    const url = tenantId
      ? `/api/admin/products?tenantId=${tenantId}`
      : '/api/admin/products';
    fetchAdminList<InternalProduct>(url).then(setProducts);
  };

  useEffect(() => {
    fetchAdminList<InternalTenant>('/api/admin/tenants').then(setTenants);
    fetchAdminList<ProductMetric>('/api/admin/metrics', { credentials: 'include' }).then(setMetrics);
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts(filter || undefined);
  }, [filter]);

  const filteredProducts = useMemo(() => {
    const q = textSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.category?.toLowerCase().includes(q) ?? false),
    );
  }, [products, textSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await fetchAdminJson<InternalProduct>('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, active: true }),
    });
    if (result.ok) {
      setProducts((prev) => [result.data, ...prev]);
      setToast({ message: `SKU ${result.data.sku} cadastrado`, type: 'success' });
      setForm({
        tenantId: '',
        sku: '',
        name: '',
        category: '',
        marketplace: 'mercado_livre',
      });
    } else {
      setToast({ message: result.error ?? 'Erro ao cadastrar', type: 'error' });
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const result = await fetchAdminJson<InternalProduct>(
      `/api/admin/products/${editing.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name,
          category: editing.category,
          marketplace: editing.marketplace,
          active: editing.active,
        }),
      },
    );

    if (result.ok) {
      setProducts((prev) => prev.map((p) => (p.id === result.data.id ? result.data : p)));
      setEditing(null);
      setToast({ message: 'Produto atualizado', type: 'success' });
    } else {
      setToast({ message: result.error ?? 'Erro ao salvar', type: 'error' });
    }
  };

  const handleImportFile = async (file: File | null) => {
    setImportFile(file);
    setImportPreview(null);
    if (!file) return;
    try {
      const text = await file.text();
      const { rows, errors } = parseCatalogCsv(text);
      setImportPreview({
        valid: rows.length,
        errors: errors.slice(0, 5),
        sample: rows.slice(0, 3).map((r) => `${r.sku} — ${r.name}`),
      });
    } catch {
      setImportPreview({ valid: 0, errors: ['Arquivo ilegível'], sample: [] });
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTenantId || !importFile) return;

    setImportMessage('');
    const formData = new FormData();
    formData.append('tenantId', importTenantId);
    formData.append('file', importFile);

    const res = await fetch('/api/admin/products/import', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const body = await res.json();
    if (!res.ok) {
      setImportMessage(body.error ?? 'Falha no import');
      setToast({ message: body.error ?? 'Falha no import', type: 'error' });
      return;
    }
    const msg =
      `Importado: ${body.created} novos, ${body.updated} atualizados` +
      (body.errors?.length ? ` · ${body.errors.length} avisos` : '');
    setImportMessage(msg);
    setToast({ message: msg, type: 'success' });
    setImportFile(null);
    setImportPreview(null);
    loadProducts(filter || undefined);
  };

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? id;

  return (
    <>
    <div style={adminStyles.page}>
      <div style={adminStyles.cardHeader}>
        <div>
          <h1 style={adminStyles.pageTitle}>Catálogo interno</h1>
          <p style={adminStyles.pageSubtitle}>
            SKUs monitorados — sem sync de API de marketplace
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="search"
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            placeholder="Filtrar SKU ou nome…"
            style={{ ...adminStyles.input, minWidth: 200 }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={adminStyles.select}
          >
            <option value="">Todos os clientes</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={adminStyles.grid2}>
        <AdminPanelCard title="Adicionar SKU" defaultOpen={false}>
          <form onSubmit={handleSubmit} style={adminStyles.form}>
            <label style={adminStyles.label}>
              Cliente
              <select
                required
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
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
              SKU
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <label style={adminStyles.label}>
              Nome do produto
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <label style={adminStyles.label}>
              Categoria
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <label style={adminStyles.label}>
              Canal principal
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
            <Button type="submit">Cadastrar SKU</Button>
          </form>
        </AdminPanelCard>

        <AdminPanelCard title="Importar catálogo CSV" defaultOpen={openImport}>
          <form onSubmit={handleImport} style={adminStyles.form}>
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
                required
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
                style={adminStyles.input}
              />
            </label>
            {importPreview && (
              <div
                style={{
                  fontSize: 13,
                  padding: 12,
                  background: '#F4F6F9',
                  borderRadius: 8,
                  color: '#475569',
                }}
              >
                <strong>{importPreview.valid}</strong> linha(s) válida(s) detectada(s)
                {importPreview.sample.length > 0 && (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                    {importPreview.sample.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
                {importPreview.errors.length > 0 && (
                  <p style={{ color: '#B45309', margin: '8px 0 0' }}>
                    Avisos: {importPreview.errors.join('; ')}
                  </p>
                )}
              </div>
            )}
            <details>
              <summary style={{ fontSize: 14, color: '#64748B', cursor: 'pointer' }}>
                Ver modelo CSV
              </summary>
              <pre
                style={{
                  fontSize: 12,
                  background: '#F4F6F9',
                  padding: 12,
                  borderRadius: 8,
                  overflow: 'auto',
                }}
              >
                {CATALOG_CSV_TEMPLATE}
              </pre>
            </details>
            <Button type="submit" disabled={!importPreview || importPreview.valid === 0}>
              Confirmar importação
            </Button>
            {importMessage && (
              <p style={{ fontSize: 14, color: '#065F46', margin: 0 }}>{importMessage}</p>
            )}
          </form>
        </AdminPanelCard>
      </div>

      {editing && (
        <AdminPanelCard title={`Editar ${editing.sku}`}>
          <form onSubmit={handleEditSave} style={adminStyles.form}>
            <label style={adminStyles.label}>
              Nome
              <input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <label style={adminStyles.label}>
              Categoria
              <input
                value={editing.category ?? ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <label style={adminStyles.label}>
              Canal
              <select
                value={editing.marketplace}
                onChange={(e) =>
                  setEditing({ ...editing, marketplace: e.target.value as Marketplace })
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
            <label style={{ ...adminStyles.label, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              Ativo no monitoramento
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </AdminPanelCard>
      )}

      <AdminPanelCard title={`${filteredProducts.length} SKUs monitorados`}>
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={adminStyles.th}>SKU</th>
              <th style={adminStyles.th}>Produto</th>
              <th style={adminStyles.th}>Cliente</th>
              <th style={adminStyles.th}>Canal</th>
              <th style={adminStyles.th}>Status</th>
              <th style={adminStyles.th}>Giro</th>
              <th style={adminStyles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} style={!p.active ? { opacity: 0.55 } : undefined}>
                <td style={adminStyles.td}>
                  <code>{p.sku}</code>
                </td>
                <td style={adminStyles.td}>{p.name}</td>
                <td style={adminStyles.td}>{tenantName(p.tenantId)}</td>
                <td style={adminStyles.td}>{MARKETPLACE_LABELS[p.marketplace]}</td>
                <td style={adminStyles.td}>
                  <span
                    style={adminStyles.badge(
                      p.active ? '#10B981' : '#8B9CB6',
                      p.active ? '#D1FAE5' : '#F4F6F9',
                    )}
                  >
                    {p.active ? 'ativo' : 'inativo'}
                  </span>
                </td>
                <td style={adminStyles.td}>
                  {(() => {
                    const m = metrics.find((x) => x.productId === p.id);
                    const units = m?.unitsSold ?? 0;
                    const isLowGiro = units === 0;
                    return isLowGiro ? (
                      <span style={adminStyles.badge('#D97706', '#FEF3C7')}>Giro baixo</span>
                    ) : null;
                  })()}
                </td>
                <td style={adminStyles.td}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0066FF',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Editar
                    </button>
                    <a
                      href={`/admin/insights?sku=${encodeURIComponent(p.sku)}`}
                      style={{
                        fontSize: 13,
                        color: '#8B9CB6',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Insight
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPanelCard>
    </div>
    {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </>
  );
}
