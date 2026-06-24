# Supabase Auth — usuários demo F5

Projeto: `jaokeypptatywvarwlao` · Portal: https://f5-industria-digital.vercel.app/login

---

## Usuários atuais (Jun 2026)

| Email | Senha | Tenant Prisma |
|-------|-------|---------------|
| `demo.nutri@f5digital.com.br` | `F5Demo2026!` | PET Piloto Nutri |
| `demo.extru@f5digital.com.br` | `F5Demo2026!` | PET Piloto Extru |
| `demo.saude@f5digital.com.br` | `F5Demo2026!` | Indústria Saúde — Piloto |
| `demo.papel@f5digital.com.br` | `F5Demo2026!` | Indústria Papel — Piloto |

**Registrar / atualizar tudo (Neon + Supabase):**

```bash
pnpm db:seed:pilot    # garante tenants + SKUs (idempotente)
pnpm db:seed:users    # cria/atualiza User no Neon + Supabase Auth
```

Requer `DATABASE_URL` e `SUPABASE_URL` + `SUPABASE_SECRET_KEY` (ex.: `apps/web/.env.local`).

---

## Contas legadas (podem continuar no banco)

| Email | Senha antiga |
|-------|----------------|
| `piloto-a@f5.internal` | `F5-Piloto-Dev2026!` |
| `piloto-b@f5.internal` | `F5-Piloto-Dev2026!` |

Prefira as contas `demo.*@f5digital.com.br` para novos testes.

---

## Criar manualmente (dashboard)

1. https://supabase.com/dashboard/project/jaokeypptatywvarwlao/auth/users
2. **Add user** → **Create new user**
3. Email + senha da tabela acima
4. ✅ **Auto Confirm User**
5. Mesmo email na tabela `User` (role `client_viewer`) no Neon — ou rode `pnpm db:seed:users`

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
2. `demo.nutri@f5digital.com.br` / `F5Demo2026!`
3. Deve abrir `/cliente` com KPIs do tenant Nutri

Se aparecer *“Conta não vinculada…”* → rode `pnpm db:seed:users`.

---

## Variáveis Vercel (referência)

Ver `apps/web/.env.example` — `SUPABASE_URL`, publishable, secret, `SUPABASE_JWKS_URL`, `NEXT_PUBLIC_*`.
