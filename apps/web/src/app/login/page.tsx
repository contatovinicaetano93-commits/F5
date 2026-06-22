'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { colors, spacing, typography, borderRadius } from '@f5/ui/src/tokens';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Fetch user to get tenant_id
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', data.user.id)
          .single();

        if (fetchError || !userData) {
          setError('Usuário não configurado corretamente');
          return;
        }

        router.push(`/dashboard/${userData.tenant_id}`);
      }
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
            🚀 F5
          </h1>
          <p style={{ color: colors.gray, fontSize: 14 }}>
            Entre na sua conta para acompanhar suas vendas
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: spacing[3],
              backgroundColor: '#FEE2E2',
              border: `1px solid #FCA5A5`,
              borderRadius: borderRadius.md,
              marginBottom: spacing[4],
            }}
          >
            <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>
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
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: colors.gray, fontSize: 14, marginBottom: spacing[4] }}>
            Não tem conta?{' '}
            <Link
              href="/signup"
              style={{
                color: colors.blue,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Criar conta
            </Link>
          </p>
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
