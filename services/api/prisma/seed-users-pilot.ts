/**
 * Registra usuários portal no Neon (Prisma) + Supabase Auth — idempotente, seguro em produção.
 * Uso: pnpm db:seed:users
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import {
  PILOT_CLIENT_PASSWORD,
  PILOT_PORTAL_USERS,
} from './pilot-users.config';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(__dirname, '../.env'));
loadEnvFile(resolve(__dirname, '../../../apps/web/.env.local'));
loadEnvFile(resolve(__dirname, '../../../.env'));

const prisma = new PrismaClient();

function getSupabaseAdminConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secret =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !secret) {
    return null;
  }

  return { url: url.replace(/\/$/, ''), secret };
}

async function findSupabaseUserIdByEmail(
  baseUrl: string,
  secret: string,
  email: string,
): Promise<string | null> {
  const res = await fetch(
    `${baseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(`email.eq.${email}`)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        apikey: secret,
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase list users failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { users?: { id: string }[] };
  return data.users?.[0]?.id ?? null;
}

async function upsertSupabaseUser(
  baseUrl: string,
  secret: string,
  email: string,
  password: string,
  metadata: Record<string, string>,
): Promise<'created' | 'updated'> {
  const existingId = await findSupabaseUserIdByEmail(baseUrl, secret, email);

  if (existingId) {
    const res = await fetch(`${baseUrl}/auth/v1/admin/users/${existingId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${secret}`,
        apikey: secret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase update user failed (${res.status}): ${body}`);
    }

    return 'updated';
  }

  const res = await fetch(`${baseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      apikey: secret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase create user failed (${res.status}): ${body}`);
  }

  return 'created';
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('❌ DATABASE_URL ausente — configure services/api/.env ou apps/web/.env.local');
    process.exit(1);
  }

  const supabase = getSupabaseAdminConfig();
  if (!supabase) {
    console.warn(
      '⚠️  SUPABASE_URL + SUPABASE_SECRET_KEY ausentes — só Neon será atualizado.',
    );
  }

  console.log('\n=== F5 — registrar usuários portal (demo) ===\n');
  console.log(`Senha: ${PILOT_CLIENT_PASSWORD}\n`);

  for (const viewer of PILOT_PORTAL_USERS) {
    const tenant = await prisma.tenant.findFirst({
      where: { name: viewer.tenantName },
    });

    if (!tenant) {
      console.error(`❌ Tenant não encontrado: ${viewer.tenantName}`);
      console.error('   Rode antes: pnpm db:seed:pilot (ou ALLOW_DESTRUCTIVE_SEED=true pnpm db:seed)');
      process.exit(1);
    }

    const dbUser = await prisma.user.upsert({
      where: { email: viewer.email },
      create: {
        email: viewer.email,
        password: 'supabase-auth',
        name: viewer.name,
        role: 'client_viewer',
        tenantId: tenant.id,
      },
      update: {
        name: viewer.name,
        role: 'client_viewer',
        tenantId: tenant.id,
      },
    });

    let supabaseStatus = 'skip (sem credenciais Supabase)';
    if (supabase) {
      const action = await upsertSupabaseUser(
        supabase.url,
        supabase.secret,
        viewer.email,
        PILOT_CLIENT_PASSWORD,
        {
          tenant: viewer.tenantName,
          f5_role: 'client_viewer',
          prisma_user_id: dbUser.id,
        },
      );
      supabaseStatus = action === 'created' ? 'Supabase ✅ criado' : 'Supabase ✅ atualizado';
    }

    console.log(`✅ ${viewer.email}`);
    console.log(`   Tenant: ${viewer.tenantName} (${tenant.id})`);
    console.log(`   Neon: client_viewer · ${supabaseStatus}\n`);
  }

  console.log('Login: https://f5-industria-digital.vercel.app/login\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
