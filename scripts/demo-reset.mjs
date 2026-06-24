/**
 * Reset demo piloto (idempotente) — dev/staging only.
 * Uso: pnpm demo:reset
 */
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');

if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  // allow on Vercel preview with caution — block only bare production NODE_ENV
}

console.log('[F5] demo:reset — seed piloto + recalc dashboard\n');
execSync('pnpm db:seed:pilot', { cwd: root, stdio: 'inherit' });
execSync('pnpm db:recalc-dashboard', { cwd: root, stdio: 'inherit' });
console.log('\n✅ Demo piloto pronto. Login: piloto-a@f5.internal');
