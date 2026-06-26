'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Tenta admin primeiro
      const adminRes = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@f5digital.com.br', password }),
      });

      if (adminRes.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }

      // Tenta portal cliente
      const clientRes = await fetch('/api/client/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (clientRes.ok) {
        router.push('/cliente');
        router.refresh();
        return;
      }

      setError('Senha inválida. Verifique e tente novamente.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
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
        backgroundColor: colors.offWhite,
      }}
    >
      <div
        style={{
          backgroundColor: colors.white,
          padding: spacing[8],
          borderRadius: borderRadius.lg,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: colors.navy,
              marginBottom: spacing[2],
            }}
          >
            F5
          </h1>
          <p style={{ color: colors.gray, fontSize: 14 }}>
            Indústria no digital — acesso à plataforma
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
            <p style={{ color: '#DC2626', fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
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
              Senha de acesso
            </label>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
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
              fontFamily: typography.fontFamily.primary,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: spacing[6] }}>
          <Link
            href="/"
            style={{ color: colors.gray, textDecoration: 'none', fontSize: 13 }}
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p style={{ padding: 40, textAlign: 'center' }}>Carregando...</p>}>
      <LoginForm />
    </Suspense>
  );
}
