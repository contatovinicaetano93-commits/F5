'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Falha no login');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: typography.fontFamily.primary,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.navy,
      }}
    >
      <div
        style={{
          backgroundColor: colors.white,
          padding: spacing[8],
          borderRadius: borderRadius.lg,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: colors.navy,
              marginBottom: spacing[2],
            }}
          >
            F5 Admin
          </h1>
          <p style={{ color: colors.gray, fontSize: 14 }}>
            Acesso interno — operação F5
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: spacing[3],
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: borderRadius.md,
              marginBottom: spacing[4],
            }}
          >
            <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                display: 'block',
                marginBottom: spacing[2],
                fontWeight: 600,
                color: colors.navy,
                fontSize: 14,
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="admin@f5digital.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${colors.offWhite}`,
                borderRadius: borderRadius.md,
                fontSize: 14,
                fontFamily: typography.fontFamily.primary,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: spacing[6] }}>
            <label
              style={{
                display: 'block',
                marginBottom: spacing[2],
                fontWeight: 600,
                color: colors.navy,
                fontSize: 14,
              }}
            >
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${colors.offWhite}`,
                borderRadius: borderRadius.md,
                fontSize: 14,
                fontFamily: typography.fontFamily.primary,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: colors.blue,
              color: colors.white,
              padding: spacing[3],
              border: 'none',
              borderRadius: borderRadius.md,
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: spacing[6] }}>
          <Link
            href="/"
            style={{
              color: colors.gray,
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
