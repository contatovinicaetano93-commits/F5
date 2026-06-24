'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { colors, spacing, typography, borderRadius } from '@f5/ui';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { createClient, isSupabaseConfigured } from '@/lib/supabase-client';

function mapLoginError(message: string): string {
  if (message === 'Invalid login credentials') {
    return 'Email ou senha inválidos.';
  }
  return message;
}

async function loginViaEnv(email: string, password: string) {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, error: data.error as string | undefined };
}

async function loginViaSupabase(email: string, password: string) {
  const supabase = createClient();
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (signInError) {
    return { ok: false as const, error: mapLoginError(signInError.message) };
  }

  const accessToken = signInData.session?.access_token;
  const sessionRes = await fetch('/api/admin/auth/establish-session', {
    method: 'POST',
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!sessionRes.ok) {
    const data = await sessionRes.json().catch(() => ({}));
    await supabase.auth.signOut();
    return {
      ok: false as const,
      error:
        (data.error as string | undefined) ??
        'Sem permissão de operador F5.',
    };
  }

  return { ok: true as const };
}

export function AdminLoginForm() {
  const [email, setEmail] = useState('admin@f5digital.com.br');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/admin';
  const supabaseConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const target = redirectTo.startsWith('/') ? redirectTo : '/admin';

    try {
      // 1) Senha da Vercel (ADMIN_PASSWORD) — caminho principal
      const envLogin = await loginViaEnv(email, password);
      if (envLogin.ok) {
        window.location.assign(target);
        return;
      }

      if (envLogin.status === 429) {
        setError(envLogin.error ?? 'Muitas tentativas. Aguarde 15 minutos.');
        return;
      }

      if (envLogin.status === 503) {
        setError(
          envLogin.error ??
            'Admin não configurado na Vercel (ADMIN_PASSWORD + ADMIN_SECRET).',
        );
        return;
      }

      // 2) Fallback Supabase (conta admin@f5digital.com.br)
      if (supabaseConfigured) {
        const supabaseLogin = await loginViaSupabase(email, password);
        if (supabaseLogin.ok) {
          window.location.assign(target);
          return;
        }
        setError(supabaseLogin.error);
        return;
      }

      setError(envLogin.error ?? 'Email ou senha inválidos.');
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
              autoComplete="username"
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
              opacity: loading ? 0.5 : 1,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no admin'}
          </button>
        </form>

        <p
          style={{
            marginTop: spacing[4],
            fontSize: 12,
            color: colors.gray,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Cliente (portal)?{' '}
          <Link href="/login" style={{ color: colors.blue }}>
            Área do cliente
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: spacing[4] }}>
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
