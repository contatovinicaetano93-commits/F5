# F5 — Setup PostgreSQL

Banco separado da imobi. Recomendado: **Neon** (free tier, branches, Vercel integration).

## 1. Criar banco (Neon)

1. Acesse [neon.tech](https://neon.tech) → New Project → `f5-prod`
2. Copie a connection string (`postgresql://...?sslmode=require`)
3. Crie branch `dev` para desenvolvimento local (opcional)

## 2. Variáveis de ambiente

**Local** — `services/api/.env`:
```bash
DATABASE_URL="postgresql://user:pass@host/f5?sslmode=require"
```

**Local web** — `apps/web/.env.local`:
```bash
DATABASE_URL="postgresql://..."   # mesma URL ou branch dev
ADMIN_PASSWORD="sua-senha-admin"
```

**Vercel** — Project `f5-industria-digital` → Settings → Environment Variables:
```bash
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=...
ADMIN_EMAIL=admin@f5digital.com.br   # opcional
```

## 3. Migrar e seed

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## 4. Verificar

```bash
pnpm dev:web
# /admin → dados persistem após restart (não só memória)
```

## 5. Fallback

Sem `DATABASE_URL`, o sistema usa **store em memória** (demo Vercel). Com `DATABASE_URL`, usa **PostgreSQL**.

## Arquitetura

```
Next.js (Vercel) ──► Prisma ──► PostgreSQL (Neon)
NestJS (futuro)  ──► Prisma ──► PostgreSQL (Neon)
```

Um banco, multi-tenant via `tenant_id` em todas as tabelas de negócio.
