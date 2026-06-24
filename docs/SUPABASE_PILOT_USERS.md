# Supabase Auth — usuários piloto F5

Projeto: `jaokeypptatywvarwlao` · Portal: https://f5-industria-digital.vercel.app/login

---

## Usuários (Neon seed ↔ Supabase Auth)

| Email | Senha (dev) | Tenant Prisma |
|-------|-------------|---------------|
| `piloto-a@f5.internal` | `F5-Piloto-Dev2026!` | PET Piloto Nutri |
| `piloto-b@f5.internal` | `F5-Piloto-Dev2026!` | PET Piloto Extru |

**Status (Jun 2026):** ambos criados no Supabase Auth com email confirmado.

O login só funciona se o **mesmo email** existir na tabela `User` (role `client_viewer`) no Neon — rode `pnpm db:seed:pilot` se necessário.

---

## Criar manualmente (dashboard)

1. https://supabase.com/dashboard/project/jaokeypptatywvarwlao/auth/users
2. **Add user** → **Create new user**
3. Email + senha acima
4. ✅ **Auto Confirm User**

---

## URL Configuration (recomendado)

**Authentication → URL Configuration**

| Campo | Valor |
|-------|--------|
| Site URL | `https://f5-industria-digital.vercel.app` |
| Redirect URLs | `https://f5-industria-digital.vercel.app/**` |
| (dev) | `http://localhost:3000/**` |

---

## Teste

1. https://f5-industria-digital.vercel.app/login
2. Email: `piloto-a@f5.internal` · Senha: `F5-Piloto-Dev2026!`
3. Deve abrir `/cliente` com KPIs do tenant Nutri

Se aparecer *“Conta não vinculada…”* → falta `User` no Neon com esse email (`pnpm db:seed:pilot`).

---

## Variáveis Vercel (referência)

Ver `apps/web/.env.example` — `SUPABASE_URL`, publishable, secret, `SUPABASE_JWKS_URL`, `NEXT_PUBLIC_*`.
