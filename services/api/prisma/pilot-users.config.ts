/**
 * Usuários portal cliente — fonte única para seed Neon + Supabase Auth.
 * Rode: pnpm db:seed:users
 */

export const PILOT_CLIENT_PASSWORD = 'F5Demo2026!';

/** Senha padrão do operador — deve coincidir com ADMIN_PASSWORD na Vercel. */
export const ADMIN_PORTAL_PASSWORD = 'Adminf5@123';

export const ADMIN_PORTAL_USER = {
  email: 'admin@f5digital.com.br',
  name: 'F5 Admin Operador',
} as const;

export type PilotUserSeed = {
  email: string;
  name: string;
  tenantName: string;
};

/** Contas demo atuais (Jun 2026) — substituem piloto-*@f5.internal */
export const PILOT_PORTAL_USERS: PilotUserSeed[] = [
  {
    email: 'demo.nutri@f5digital.com.br',
    name: 'Demo — PET Piloto Nutri',
    tenantName: 'PET Piloto Nutri',
  },
  {
    email: 'demo.extru@f5digital.com.br',
    name: 'Demo — PET Piloto Extru',
    tenantName: 'PET Piloto Extru',
  },
  {
    email: 'demo.saude@f5digital.com.br',
    name: 'Demo — Indústria Saúde',
    tenantName: 'Indústria Saúde — Piloto',
  },
  {
    email: 'demo.papel@f5digital.com.br',
    name: 'Demo — Indústria Papel',
    tenantName: 'Indústria Papel — Piloto',
  },
];
