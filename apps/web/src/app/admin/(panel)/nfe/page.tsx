'use client';

import React, { useEffect, useState } from 'react';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { fetchAdminList } from '@/lib/admin/fetch';
import { Button } from '@f5/ui';
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
  const [payments, setPayments] = useState<
    {
      id: string;
      tenantName: string;
      marketplace: string;
      dataRecebimento: string;
      valor: number;
    }[]
  >([]);
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
    fetchAdminList<NfRecord>('/api/admin/nfs', { credentials: 'include' })
      .then(setNfs)
      .catch(console.error);

  const loadPayments = () =>
    fetchAdminList<{
      id: string;
      tenantName: string;
      marketplace: string;
      dataRecebimento: string;
      valor: number;
    }>('/api/admin/payments', { credentials: 'include' })
      .then(setPayments)
      .catch(console.error);

  useEffect(() => {
    fetchAdminList<InternalTenant>('/api/admin/tenants', { credentials: 'include' })
      .then(setTenants);
    loadNfs();
    loadPayments();
  }, []);

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (res.ok) loadPayments();
  };

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
      await loadPayments();
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
        <AdminPanelCard title="Upload XML" defaultOpen={false}>
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
        </AdminPanelCard>

        <AdminPanelCard title="Registro manual" defaultOpen={false}>
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
        </AdminPanelCard>
      </div>

      <AdminPanelCard title="NF-e registradas">
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
      </AdminPanelCard>

      <AdminPanelCard title="Repasses pendentes (D+15 / D+60)" defaultOpen={false}>
        {payments.length === 0 ? (
          <p style={{ margin: 0, color: '#8B9CB6', fontSize: 14 }}>
            Nenhum repasse pendente. Aparecem após processar NF-e.
          </p>
        ) : (
          <table style={adminStyles.table}>
            <thead>
              <tr>
                <th style={adminStyles.th}>Cliente</th>
                <th style={adminStyles.th}>Canal</th>
                <th style={adminStyles.th}>Previsão</th>
                <th style={adminStyles.th}>Valor</th>
                <th style={adminStyles.th}></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={adminStyles.td}>{p.tenantName}</td>
                  <td style={adminStyles.td}>{p.marketplace}</td>
                  <td style={adminStyles.td}>{formatDate(p.dataRecebimento)}</td>
                  <td style={adminStyles.td}>{formatBRL(p.valor)}</td>
                  <td style={adminStyles.td}>
                    <Button type="button" onClick={() => markPaid(p.id)}>
                      Marcar recebido
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminPanelCard>
    </div>
  );
}
