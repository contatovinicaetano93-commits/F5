'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#F4F6F9',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#0D1B2A' }}>
            Algo deu errado
          </h1>
          <p style={{ margin: '0 0 20px', color: '#64748B', lineHeight: 1.6 }}>
            Ocorreu um erro inesperado. Tente recarregar ou volte ao login do admin.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 16px',
                background: '#0066FF',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Recarregar
            </button>
            <Link
              href="/admin/login"
              style={{
                padding: '10px 16px',
                background: '#0D1B2A',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Login admin
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
