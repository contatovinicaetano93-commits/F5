'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@f5/ui';
import { adminStyles } from '@/lib/admin/styles';
import {
  MARKETPLACE_LABELS,
  type InternalTenant,
  type InternalProduct,
  type Marketplace,
} from '@/types/internal';

export default function CatalogoPage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [filter, setFilter] = useState('');
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
    fetch(url)
      .then((r) => r.json())
      .then(setProducts);
  };

  useEffect(() => {
    fetch('/api/admin/tenants').then((r) => r.json()).then(setTenants);
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts(filter || undefined);
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, active: true }),
    });
    const created = await res.json();
    setProducts((prev) => [created, ...prev]);
    setForm({
      tenantId: '',
      sku: '',
      name: '',
      category: '',
      marketplace: 'mercado_livre',
    });
  };

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? id;

  return (
    <div style={adminStyles.page}>
      <div style={adminStyles.cardHeader}>
        <div>
          <h1 style={adminStyles.pageTitle}>Catálogo interno</h1>
          <p style={adminStyles.pageSubtitle}>
            SKUs monitorados — sem sync de API de marketplace
          </p>
        </div>
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

      <div style={adminStyles.grid2}>
        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Adicionar SKU</h2>
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
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>
            {products.length} SKUs monitorados
          </h2>
          <table style={adminStyles.table}>
            <thead>
              <tr>
                <th style={adminStyles.th}>SKU</th>
                <th style={adminStyles.th}>Produto</th>
                <th style={adminStyles.th}>Cliente</th>
                <th style={adminStyles.th}>Canal</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={adminStyles.td}>
                    <code>{p.sku}</code>
                  </td>
                  <td style={adminStyles.td}>{p.name}</td>
                  <td style={adminStyles.td}>{tenantName(p.tenantId)}</td>
                  <td style={adminStyles.td}>{MARKETPLACE_LABELS[p.marketplace]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
