'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@f5/ui';
import { adminStyles, formatBRL, formatDate } from '@/lib/admin/styles';
import { type InternalTenant, type NfRecord } from '@/types/internal';

export default function NfePage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [nfs, setNfs] = useState<NfRecord[]>([]);
  const [form, setForm] = useState({
    tenantId: '',
    nfNumber: '',
    valorTotal: '',
    itemsCount: '1',
  });

  useEffect(() => {
    fetch('/api/admin/tenants').then((r) => r.json()).then(setTenants);
    fetch('/api/admin/nfs').then((r) => r.json()).then(setNfs);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/nfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: form.tenantId,
        nfNumber: form.nfNumber,
        valorTotal: Number(form.valorTotal),
        itemsCount: Number(form.itemsCount),
      }),
    });
    const created = await res.json();
    setNfs((prev) => [created, ...prev]);
    setForm({ tenantId: '', nfNumber: '', valorTotal: '', itemsCount: '1' });
  };

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>NF-e</h1>
        <p style={adminStyles.pageSubtitle}>
          Upload XML (API Nest) ou registro manual para validar fluxo
        </p>
      </div>

      <div style={adminStyles.grid2}>
        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Upload XML</h2>
          <p style={{ fontSize: 14, color: '#8B9CB6', marginBottom: 16 }}>
            Parser NF-e já existe na API Nest (`/api/v1/notas-fiscais/upload`).
            Conectar quando o banco estiver ativo.
          </p>
          <input type="file" accept=".xml" disabled style={{ opacity: 0.5 }} />
          <p style={{ fontSize: 12, color: '#8B9CB6', marginTop: 8 }}>
            Em breve — vinculado ao tenant
          </p>
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Registro manual</h2>
          <form onSubmit={handleRegister} style={adminStyles.form}>
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
              Número NF
              <input
                required
                value={form.nfNumber}
                onChange={(e) => setForm({ ...form, nfNumber: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <label style={adminStyles.label}>
              Valor total (R$)
              <input
                required
                type="number"
                step="0.01"
                value={form.valorTotal}
                onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
                style={adminStyles.input}
              />
            </label>
            <Button type="submit">Registrar NF</Button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>NF-e registradas</h2>
        <table style={adminStyles.table}>
          <thead>
            <tr>
              <th style={adminStyles.th}>NF</th>
              <th style={adminStyles.th}>Data</th>
              <th style={adminStyles.th}>Valor</th>
              <th style={adminStyles.th}>Itens</th>
              <th style={adminStyles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {nfs.map((nf) => (
              <tr key={nf.id}>
                <td style={adminStyles.td}>
                  {nf.nfNumber}/{nf.nfSeries}
                </td>
                <td style={adminStyles.td}>{formatDate(nf.nfDate)}</td>
                <td style={adminStyles.td}>{formatBRL(nf.valorTotal)}</td>
                <td style={adminStyles.td}>{nf.itemsCount}</td>
                <td style={adminStyles.td}>
                  <span
                    style={adminStyles.badge(
                      nf.status === 'processed' ? '#10B981' : '#F59E0B',
                      nf.status === 'processed' ? '#D1FAE5' : '#FEF3C7',
                    )}
                  >
                    {nf.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
