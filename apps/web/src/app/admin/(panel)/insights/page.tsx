'use client';

import React, { useEffect, useState } from 'react';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { fetchAdminList } from '@/lib/admin/fetch';
import { Button } from '@f5/ui';
import { adminStyles, formatDate } from '@/lib/admin/styles';
import {
  type InternalTenant,
  type InternalProduct,
  type InsightNote,
} from '@/types/internal';

export default function InsightsPage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [insights, setInsights] = useState<InsightNote[]>([]);
  const [form, setForm] = useState({
    tenantId: '',
    productId: '',
    title: '',
    body: '',
    visibleToClient: true,
  });

  useEffect(() => {
    fetchAdminList<InternalTenant>('/api/admin/tenants').then(setTenants);
    fetchAdminList<InsightNote>('/api/admin/insights').then(setInsights);
  }, []);

  useEffect(() => {
    if (!form.tenantId) {
      setProducts([]);
      return;
    }
    fetchAdminList<InternalProduct>(`/api/admin/products?tenantId=${form.tenantId}`)
      .then(setProducts);
  }, [form.tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        productId: form.productId || undefined,
        weekOf: new Date().toISOString(),
      }),
    });
    const created = await res.json();
    setInsights((prev) => [created, ...prev]);
    setForm({ tenantId: '', productId: '', title: '', body: '', visibleToClient: true });
  };

  const toggleVisible = async (insight: InsightNote) => {
    const res = await fetch('/api/admin/insights', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: insight.id, visibleToClient: !insight.visibleToClient }),
    });
    const updated = await res.json();
    setInsights((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Insights</h1>
        <p style={adminStyles.pageSubtitle}>
          Notas de observação do operador — viram recomendação no dashboard do cliente
        </p>
      </div>

      <div style={adminStyles.grid2}>
        <AdminPanelCard title="Novo insight">
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
              Produto (opcional)
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                style={adminStyles.select}
                disabled={!form.tenantId}
              >
                <option value="">Geral do cliente</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku}
                  </option>
                ))}
              </select>
            </label>

            <label style={adminStyles.label}>
              Título
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={adminStyles.input}
              />
            </label>

            <label style={adminStyles.label}>
              Observação
              <textarea
                required
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                style={adminStyles.textarea}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={form.visibleToClient}
                onChange={(e) =>
                  setForm({ ...form, visibleToClient: e.target.checked })
                }
              />
              Visível para o cliente
            </label>

            <Button type="submit">Salvar insight</Button>
          </form>
        </AdminPanelCard>

        <AdminPanelCard title="Insights registrados">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {insights.map((insight) => (
              <div
                key={insight.id}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #F4F6F9',
                  backgroundColor: '#FAFBFC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{insight.title}</strong>
                  <span
                    style={adminStyles.badge(
                      insight.visibleToClient ? '#0066FF' : '#8B9CB6',
                      insight.visibleToClient ? '#DBEAFE' : '#F4F6F9',
                    )}
                  >
                    {insight.visibleToClient ? 'Cliente' : 'Interno'}
                  </span>
                </div>
                <p style={{ margin: '8px 0', fontSize: 14, color: '#2D3748' }}>
                  {insight.body}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#8B9CB6',
                  }}
                >
                  <span>{insight.weekOf ? formatDate(insight.weekOf) : ''}</span>
                  <button
                    type="button"
                    onClick={() => toggleVisible(insight)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0066FF',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {insight.visibleToClient ? 'Ocultar do cliente' : 'Publicar ao cliente'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanelCard>
      </div>
    </div>
  );
}
