/**
 * Seed de usuários clientes — Supabase Auth + User no Neon
 *
 * Cria usuários no Supabase (Admin API) e vincula ao tenant no banco.
 * Idempotente: re-executar não duplica nem quebra.
 *
 * Uso: pnpm seed:clients
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(resolve(__dirname, '../.env.local'));
loadEnv(resolve(__dirname, '../.env'));

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !DATABASE_URL) {
  console.error('❌ Variáveis faltando: SUPABASE_URL, SUPABASE_SECRET_KEY, DATABASE_URL');
  process.exit(1);
}

// Clientes piloto a criar
// Adicione novos clientes aqui conforme fechar contratos
const CLIENT_USERS = [
  {
    email: 'nutri@f5cliente.com.br',
    password: 'F5-Nutri-2026!',
    name: 'Nutripássaros',
    tenantName: 'PET Piloto Nutri',
  },
  {
    email: 'extru@f5cliente.com.br',
    password: 'F5-Extru-2026!',
    name: 'Extrutécnica',
    tenantName: 'PET Piloto Extru',
  },
];

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

async function supabaseAdminPost(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function supabaseAdminGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/${path}`, {
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    },
  });
  return { status: res.status, data: await res.json() };
}

async function getOrCreateSupabaseUser(email: string, password: string, name: string) {
  // Verifica se já existe
  const list = await supabaseAdminGet(`users?email=${encodeURIComponent(email)}`);
  const existing = list.data?.users?.find((u: { email: string }) => u.email === email);
  if (existing) {
    console.log(`  ↩  Supabase user já existe: ${email}`);
    return existing.id as string;
  }

  // Cria novo
  const { status, data } = await supabaseAdminPost('users', {
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (status !== 200 && status !== 201) {
    throw new Error(`Supabase error ${status}: ${JSON.stringify(data)}`);
  }

  console.log(`  ✅ Supabase user criado: ${email}`);
  return data.id as string;
}

async function main() {
  console.log('\n🌱 Seed de usuários clientes F5\n');

  for (const client of CLIENT_USERS) {
    console.log(`\n📦 ${client.name} (${client.email})`);

    // 1. Busca tenant no Neon
    const tenant = await prisma.tenant.findFirst({
      where: { name: { contains: client.tenantName.split(' ').pop()! } },
    });

    if (!tenant) {
      console.warn(`  ⚠️  Tenant "${client.tenantName}" não encontrado — pulando`);
      continue;
    }

    console.log(`  Tenant: ${tenant.name} (${tenant.id})`);

    // 2. Cria usuário no Supabase
    const supabaseId = await getOrCreateSupabaseUser(client.email, client.password, client.name);

    // 3. Upsert User no Neon (email = link entre Supabase e tenant)
    const existing = await prisma.user.findUnique({ where: { email: client.email } });

    if (existing) {
      await prisma.user.update({
        where: { email: client.email },
        data: { tenantId: tenant.id, role: 'client_viewer' },
      });
      console.log(`  ↩  User Neon atualizado: ${client.email} → ${tenant.name}`);
    } else {
      await prisma.user.create({
        data: {
          email: client.email,
          password: supabaseId, // não usado para auth, Supabase é a fonte
          name: client.name,
          role: 'client_viewer',
          tenantId: tenant.id,
        },
      });
      console.log(`  ✅ User Neon criado: ${client.email} → ${tenant.name}`);
    }
  }

  console.log('\n✅ Seed concluído!\n');
  console.log('Credenciais dos clientes:');
  console.log('─────────────────────────────────────────');
  for (const c of CLIENT_USERS) {
    console.log(`  ${c.name}`);
    console.log(`  Email: ${c.email}`);
    console.log(`  Senha: ${c.password}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
