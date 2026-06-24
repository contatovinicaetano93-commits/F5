'use client';

import React, { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AdminPanelCard } from '@/components/admin/AdminPanelCard';
import { adminStyles } from '@/lib/admin/styles';

const SENTRY_DASHBOARD =
  'https://imobi-hl.sentry.io/issues/?query=service%3Af5-web';

export default function AdminSentryTestPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function testServer() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/sentry-test', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? 'Falha ao enviar teste de servidor.');
        return;
      }
      setStatus('✅ Servidor: evento enviado. Abra o dashboard Sentry em ~30s.');
    } catch {
      setStatus('Erro de rede ao chamar a API.');
    } finally {
      setLoading(false);
    }
  }

  function testClient() {
    Sentry.captureException(new Error('F5 Sentry client test'));
    setStatus('✅ Browser: evento enviado. Abra o dashboard Sentry em ~30s.');
  }

  return (
    <div style={adminStyles.page}>
      <div>
        <h1 style={adminStyles.pageTitle}>Testar Sentry</h1>
        <p style={adminStyles.pageSubtitle}>
          Use os botões abaixo — não precisa abrir o console do navegador (F12).
        </p>
      </div>

      <AdminPanelCard title="Enviar teste">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <button
            type="button"
            onClick={() => void testServer()}
            disabled={loading}
            style={{
              padding: '12px 20px',
              background: '#0066FF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Enviando…' : 'Testar Sentry (servidor)'}
          </button>

          <button
            type="button"
            onClick={testClient}
            style={{
              padding: '12px 20px',
              background: '#0D1B2A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Testar Sentry (browser)
          </button>

          {status && (
            <p style={{ margin: 0, lineHeight: 1.6, color: '#2D3748' }}>{status}</p>
          )}

          <a
            href={SENTRY_DASHBOARD}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...adminStyles.link, fontSize: 14 }}
          >
            Abrir dashboard Sentry (filtro service:f5-web) →
          </a>
        </div>
      </AdminPanelCard>
    </div>
  );
}
