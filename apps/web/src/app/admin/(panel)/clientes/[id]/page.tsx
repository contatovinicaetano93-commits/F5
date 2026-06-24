'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { adminStyles, formatBRL, formatPct } from '@/lib/admin/styles';
import {
  SEGMENT_LABELS,
  SCENARIO_LABELS,
  MARKETPLACE_LABELS,
  type InternalTenant,
  type InternalProduct,
  type ProductMetric,
  type InsightNote,
  type NfRecord,
} from '@/types/internal';

interface TenantDetail {
  tenant: InternalTenant;
  products: InternalProduct[];
  metrics: ProductMetric[];
  insights: InsightNote[];
  nfs: NfRecord[];
}

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<TenantDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/tenants/${params.id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [params.id]);

  if (!data) {
    return <p>Carregando...</p>;
  }

  const { tenant, products, metrics, insights, nfs } = data;
  const revenue = metrics.reduce((s, m) => s + m.revenue, 0);

  return (
    <div style={adminStyles.page}>
      <Link href="/admin/clientes" style={{ ...adminStyles.link, fontSize: 14 }}>
        ← Voltar
      </Link>

      <div>
        <h1 style={adminStyles.pageTitle}>{tenant.name}</h1>
        <p style={adminStyles.pageSubtitle}>
          {SEGMENT_LABELS[tenant.segment]} · {SCENARIO_LABELS[tenant.scenario]}
        </p>
      </div>

      <div style={adminStyles.grid4}>
        <AdminPanelCard title="SKUs monitorados">
          <p style={adminStyles.kpiValue}>{products.length}</p>
        </AdminPanelCard>
        <AdminPanelCard title="Receita (lançamentos)">
          <p style={adminStyles.kpiValue}>{formatBRL(revenue)}</p>
        </AdminPanelCard>
        <AdminPanelCard title="Insights">
          <p style={adminStyles.kpiValue}>{insights.length}</p>
        </AdminPanelCard>
        <AdminPanelCard title="NF-e processadas">
          <p style={adminStyles.kpiValue}>{nfs.length}</p>
        </AdminPanelCard>
      </div>

      <AdminPanelCard title="Últimos lançamentos">
        {metrics.length === 0 ? (
          <p style={{ color: '#8B9CB6' }}>Nenhum lançamento ainda.</p>
        ) : (
          <table style={adminStyles.table}>
            <thead>
              <tr>
                <th style={adminStyles.th}>SKU</th>
                <th style={adminStyles.th}>Canal</th>
                <th style={adminStyles.th}>Vendas</th>
                <th style={adminStyles.th}>Receita</th>
                <th style={adminStyles.th}>Conversão</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => {
                const product = products.find((p) => p.id === m.productId);
                return (
                  <tr key={m.id}>
                    <td style={adminStyles.td}>{product?.sku ?? m.productId}</td>
                    <td style={adminStyles.td}>{MARKETPLACE_LABELS[m.marketplace]}</td>
                    <td style={adminStyles.td}>{m.unitsSold} un</td>
                    <td style={adminStyles.td}>{formatBRL(m.revenue)}</td>
                    <td style={adminStyles.td}>
                      {m.conversionRate ? formatPct(m.conversionRate) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AdminPanelCard>
    </div>
  );
}
