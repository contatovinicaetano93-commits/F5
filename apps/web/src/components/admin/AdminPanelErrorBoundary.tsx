'use client';

import React from 'react';
import Link from 'next/link';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class AdminPanelErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Admin panel render error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
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
            }}
          >
            <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#0D1B2A' }}>
              Erro no painel admin
            </h1>
            <p style={{ margin: '0 0 16px', color: '#64748B', lineHeight: 1.6 }}>
              Algo falhou ao carregar o painel. Tente novamente ou volte ao login.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
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
                Tentar de novo
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
                Ir para login
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
