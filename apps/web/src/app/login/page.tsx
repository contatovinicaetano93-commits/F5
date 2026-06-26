'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { createClient } from '@/lib/supabase-client';
import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

const inputStyle = {
  width: '100%',
  padding: spacing[3],
  border: `1px solid #D1D5DB`,
  borderRadius: borderRadius.md,
  fontSize: 14,
  fontFamily: typography.fontFamily.primary,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block',
  marginBottom: spacing[2],
  fontWeight: 600,
  color: colors.navy,
  fontSize: 14,
};

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Tenta admin (sem Supabase — email fixo + senha env)
      const adminRes = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (adminRes.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }

      // 2. Tenta cliente via Supabase (email + senha por tenant)
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError('Email ou senha inválidos.');
        return;
      }

      // Supabase OK — verifica se tem tenant vinculado
      const sessionRes = await fetch('/api/client/session', { credentials: 'include' });
      if (!sessionRes.ok) {
        await supabase.auth.signOut();
        setError('Conta não vinculada a um cliente F5. Entre em contato com a equipe.');
        return;
      }

      router.push('/cliente');
      router.refresh();
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
          <h1 style={{ fontSize: 32, fontWeight: 700, color: colors.navy, marginBottom: spacing[2] }}>
            F5
          </h1>
          <p style={{ color: colors.gray, fontSize: 14, margin: 0 }}>
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
          <div style={{ marginBottom: spacing[4] }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: spacing[6] }}>
            <label style={labelStyle}>Senha</label>
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          <Link href="/" style={{ color: colors.gray, textDecoration: 'none', fontSize: 13 }}>
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
