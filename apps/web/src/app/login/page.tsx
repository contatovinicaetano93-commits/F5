'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

function mapClientLoginError(message: string): string {
  if (message === 'Invalid login credentials') {
    return 'Email ou senha inválidos. Cliente: demo.nutri@f5digital.com.br — Operador F5: use /admin/login';
  }
  return message;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/cliente';
  const supabaseConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(mapClientLoginError(signInError.message));
          return;
        }

        const sessionRes = await fetch('/api/client/session', {
          credentials: 'include',
        });
        if (!sessionRes.ok) {
          await supabase.auth.signOut();
          setError(
            'Conta não vinculada a um cliente F5. Peça acesso à equipe de operação.',
          );
          return;
        }
      } else {
        const res = await fetch('/api/client/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Senha inválida');
          return;
        }
      }

      router.push(redirectTo.startsWith('/') ? redirectTo : '/cliente');
      router.refresh();
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
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
            Portal do cliente — acompanhe vendas e recebimentos
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
          {supabaseConfigured && (
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
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: spacing[3],
                  border: `1px solid ${colors.offWhite}`,
                  borderRadius: borderRadius.md,
                  fontSize: 14,
                  fontFamily: typography.fontFamily.primary,
                }}
              />
            </div>
          )}

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
              {supabaseConfigured ? 'Senha' : 'Senha do portal'}
            </label>
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
              marginBottom: spacing[4],
              fontFamily: typography.fontFamily.primary,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no portal'}
          </button>
        </form>

        <p
          style={{
            marginBottom: spacing[4],
            fontSize: 12,
            color: colors.gray,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Equipe F5 (operador)?{' '}
          <Link href="/admin/login" style={{ color: colors.blue, fontWeight: 600 }}>
            Entrar no admin
          </Link>
        </p>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              color: colors.gray,
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Voltar à página inicial
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
