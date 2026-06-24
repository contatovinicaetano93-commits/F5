#!/usr/bin/env node
/**
 * Verifica config Sentry local/prod (não envia eventos).
 * Uso: pnpm sentry:verify
 */
const dsn =
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? '';
const org = process.env.SENTRY_ORG ?? 'imobi-hl';
const project = process.env.SENTRY_PROJECT ?? 'f5-web';

console.log('\n=== Sentry F5 — verify ===\n');
console.log(`Org:     ${org}`);
console.log(`Project: ${project}`);
console.log(`DSN:     ${dsn ? `${dsn.slice(0, 30)}…` : '(ausente)'}`);

if (!dsn) {
  console.log('\n❌ DSN ausente — Sentry inativo até configurar na Vercel.');
  console.log('   Projeto alvo: f5-web (separado do javascript/imobi)');
  console.log('   Docs: docs/SENTRY_F5.md\n');
  process.exit(1);
}

if (!dsn.includes('ingest')) {
  console.log('\n⚠️  DSN com formato inesperado\n');
  process.exit(1);
}

console.log('\n✅ DSN presente — SDK ativará no próximo deploy.\n');
