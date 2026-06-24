/**
 * Valida envs obrigatórias antes do build de produção (Vercel / NODE_ENV=production).
 */

const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!isProduction) {
  process.exit(0);
}

const missing = [];

if (!process.env.DATABASE_URL?.trim()) missing.push('DATABASE_URL');
if (!process.env.ADMIN_PASSWORD?.trim()) missing.push('ADMIN_PASSWORD');
if (!process.env.ADMIN_SECRET?.trim()) missing.push('ADMIN_SECRET');
const hasSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim());

if (!hasSupabase && !process.env.CLIENT_DEMO_TENANT_ID?.trim()) {
  missing.push('CLIENT_DEMO_TENANT_ID');
}

if (!hasSupabase) {
  if (!process.env.CLIENT_PORTAL_PASSWORD?.trim()) {
    missing.push('CLIENT_PORTAL_PASSWORD');
  }
  if (!process.env.CLIENT_PORTAL_SECRET?.trim()) {
    missing.push('CLIENT_PORTAL_SECRET');
  }
}

if (missing.length > 0) {
  console.error(
    `[F5] Build bloqueado — variáveis ausentes: ${missing.join(', ')}`,
  );
  process.exit(1);
}

console.log('[F5] Env de produção validada.');
