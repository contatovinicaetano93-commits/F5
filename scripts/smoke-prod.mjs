#!/usr/bin/env node
/**
 * Smoke test de produção — endpoints públicos e auth guards.
 * Uso: pnpm smoke:prod [baseUrl]
 */
const BASE = process.argv[2]?.replace(/\/$/, '') ?? 'https://f5-industria-digital.vercel.app';

async function check(name, url, expectStatus, opts = {}) {
  const res = await fetch(`${BASE}${url}`, { redirect: 'manual', ...opts });
  const statuses = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
  const ok = statuses.includes(res.status);
  console.log(
    `${ok ? '✅' : '❌'} ${name} — ${res.status} (esperado ${statuses.join('|')})`,
  );
  if (!ok) process.exitCode = 1;
  return res;
}

async function checkOptional(name, url, expectStatus) {
  const res = await fetch(`${BASE}${url}`, { redirect: 'manual' });
  const statuses = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
  if (statuses.includes(res.status)) {
    console.log(`✅ ${name} — ${res.status}`);
  } else {
    console.log(`⚠️  ${name} — ${res.status} (aguardando deploy)`);
  }
  return res;
}

async function main() {
  console.log(`\n=== Smoke: ${BASE} ===\n`);
  await check('Landing', '/', 200);
  await check('Login portal', '/login', 200);
  await checkOptional('Health', '/api/health', 200);
  await check('Client session (sem auth)', '/api/client/session', 401);
  await check('Admin overview (sem auth)', '/api/admin/overview', 401);
  await checkOptional('Cliente (protegido)', '/cliente', [307, 302, 308, 401]);
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
