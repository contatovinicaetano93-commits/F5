/**
 * Registra usuários portal no Neon (Prisma) + Supabase Auth — idempotente, seguro em produção.
 * Uso: pnpm db:seed:users
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import {
  ADMIN_PORTAL_PASSWORD,
  ADMIN_PORTAL_USER,
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
  const normalized = email.toLowerCase();

  const filterRes = await fetch(
    `${baseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(`email.eq.${email}`)}&per_page=200`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        apikey: secret,
      },
    },
  );

  if (filterRes.ok) {
    const data = (await filterRes.json()) as {
      users?: { id: string; email?: string }[];
    };
    const users = data.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === normalized);
    if (match?.id) return match.id;
    if (users[0]?.id) return users[0].id;
  }

  const listRes = await fetch(`${baseUrl}/auth/v1/admin/users?per_page=200`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      apikey: secret,
    },
  });

  if (!listRes.ok) {
    const body = await listRes.text();
    throw new Error(`Supabase list users failed (${listRes.status}): ${body}`);
  }

  const listData = (await listRes.json()) as {
    users?: { id: string; email?: string }[];
  };
  const match = (listData.users ?? []).find(
    (u) => u.email?.toLowerCase() === normalized,
  );
  return match?.id ?? null;
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
    if (res.status === 422 && body.includes('email_exists')) {
      const retryId = await findSupabaseUserIdByEmail(baseUrl, secret, email);
      if (retryId) {
        const updateRes = await fetch(`${baseUrl}/auth/v1/admin/users/${retryId}`, {
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
        if (!updateRes.ok) {
          const updateBody = await updateRes.text();
          throw new Error(`Supabase update user failed (${updateRes.status}): ${updateBody}`);
        }
        return 'updated';
      }
    }
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

  console.log('\n=== F5 — registrar usuários (admin + portal demo) ===\n');

  /** Deve coincidir com ADMIN_PASSWORD na Vercel. */
  const adminPassword = ADMIN_PORTAL_PASSWORD;

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_PORTAL_USER.email },
    create: {
      email: ADMIN_PORTAL_USER.email,
      password: 'supabase-auth',
      name: ADMIN_PORTAL_USER.name,
      role: 'admin',
    },
    update: {
      name: ADMIN_PORTAL_USER.name,
      role: 'admin',
    },
  });

  let adminSupabaseStatus = 'skip (sem credenciais Supabase)';
  if (supabase) {
    const action = await upsertSupabaseUser(
      supabase.url,
      supabase.secret,
      ADMIN_PORTAL_USER.email,
      adminPassword,
      {
        f5_role: 'admin',
        prisma_user_id: adminUser.id,
      },
    );
    adminSupabaseStatus =
      action === 'created' ? 'Supabase ✅ criado' : 'Supabase ✅ atualizado';
  }

  console.log(`✅ ${ADMIN_PORTAL_USER.email} (operador admin)`);
  console.log(`   Senha: ${adminPassword}`);
  console.log(`   Neon: admin · ${adminSupabaseStatus}\n`);

  console.log(`Portal demo — senha: ${PILOT_CLIENT_PASSWORD}\n`);

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

  console.log('Admin: https://f5-industria-digital.vercel.app/admin/login');
  console.log('Cliente: https://f5-industria-digital.vercel.app/login\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
