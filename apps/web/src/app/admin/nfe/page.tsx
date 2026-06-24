'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@f5/ui';
import { adminStyles, formatBRL, formatDate } from '@/lib/admin/styles';
import { type InternalTenant, type Marketplace, type NfRecord, MARKETPLACE_LABELS } from '@/types/internal';

const MARKETPLACES: Marketplace[] = [
  'mercado_livre',
  'amazon',
  'shopee',
  'tiktok',
  'outros',
];

export default function NfePage() {
  const [tenants, setTenants] = useState<InternalTenant[]>([]);
  const [nfs, setNfs] = useState<NfRecord[]>([]);
  const [uploadTenantId, setUploadTenantId] = useState('');
  const [uploadMarketplace, setUploadMarketplace] = useState<Marketplace>('mercado_livre');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [form, setForm] = useState({
    tenantId: '',
    nfNumber: '',
    valorTotal: '',
    itemsCount: '1',
    marketplace: 'mercado_livre' as Marketplace,
  });

  const loadNfs = () =>
    fetch('/api/admin/nfs', { credentials: 'include' })
      .then((r) => r.json())
      .then(setNfs)
      .catch(console.error);

  useEffect(() => {
    fetch('/api/admin/tenants', { credentials: 'include' })
      .then((r) => r.json())
      .then(setTenants);
    loadNfs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTenantId) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('tenantId', uploadTenantId);
    formData.append('marketplace', uploadMarketplace);

    try {
      const res = await fetch('/api/admin/nfs/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? 'Erro no upload');
        return;
      }
      setUploadSuccess(
        `NF-e ${data.data.nfNumber}/${data.data.nfSeries} processada (${data.data.itemsCount} itens)`,
      );
      setUploadFile(null);
      setUploadTenantId('');
      await loadNfs();
    } catch {
      setUploadError('Falha na conexão');
    } finally {
      setUploading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/nfs', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: form.tenantId,
        nfNumber: form.nfNumber,
        valorTotal: Number(form.valorTotal),
        itemsCount: Number(form.itemsCount),
        marketplace: form.marketplace,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setNfs((prev) => [created, ...prev]);
      setForm({
        tenantId: '',
        nfNumber: '',
        valorTotal: '',
        itemsCount: '1',
        marketplace: 'mercado_livre',
      });
      await loadNfs();
    }
  };

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>NF-e</h1>
        <p style={adminStyles.pageSubtitle}>
          Upload XML SEFAZ ou registro manual — idempotente por número/série/emitente
        </p>
      </div>

      <div style={adminStyles.grid2}>
        <Card>
          <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Upload XML</h2>
          <form onSubmit={handleUpload} style={adminStyles.form}>
            <label style={adminStyles.label}>
              Cliente
              <select
                required
                value={uploadTenantId}
                onChange={(e) => setUploadTenantId(e.target.value)}
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
              Marketplace (se não detectar no XML)
              <select
                value={uploadMarketplace}
                onChange={(e) =>
                  setUploadMarketplace(e.target.value as Marketplace)
                }
                style={adminStyles.select}
              >
                {MARKETPLACES.map((m) => (
                  <option key={m} value={m}>
                    {MARKETPLACE_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>
            <label style={adminStyles.label}>
              Arquivo XML
              <input
                required
                type="file"
                accept=".xml"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                style={adminStyles.input}
              />
            </label>
            {uploadError && (
              <p style={{ color: '#EF4444', fontSize: 14, margin: 0 }}>{uploadError}</p>
            )}
            {uploadSuccess && (
              <p style={{ color: '#10B981', fontSize: 14, margin: 0 }}>{uploadSuccess}</p>
            )}
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Processando...' : 'Processar NF-e'}
            </Button>
            <a
              href="/fixtures/sample-nfe.xml"
              download="f5-sample-nfe.xml"
              style={{ ...adminStyles.link, fontSize: 14 }}
            >
              Baixar XML de exemplo (Gate 2)
            </a>
          </form>
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
            <label style={adminStyles.label}>
              Marketplace
              <select
                required
                value={form.marketplace}
                onChange={(e) =>
                  setForm({ ...form, marketplace: e.target.value as Marketplace })
                }
                style={adminStyles.select}
              >
                {MARKETPLACES.map((m) => (
                  <option key={m} value={m}>
                    {MARKETPLACE_LABELS[m]}
                  </option>
                ))}
              </select>
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
