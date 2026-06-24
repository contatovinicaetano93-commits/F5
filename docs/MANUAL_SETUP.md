# F5 — Setup manual (você faz)

> Tudo que **não** dá para automatizar. Marque ✅ conforme concluir.  
> O resto o agente/código faz sozinho.

---

## 1. PostgreSQL (Neon) — **obrigatório para dados reais**

| # | Ação | Onde |
|---|------|------|
| 1.1 | Criar conta / login | [neon.tech](https://neon.tech) |
| 1.2 | New Project → nome `f5-prod` | Neon dashboard |
| 1.3 | Copiar connection string | Connection Details → `postgresql://...?sslmode=require` |
| 1.4 | Colar em **Vercel** → `f5-industria-digital` → Settings → Environment Variables | `DATABASE_URL` = string copiada |
| 1.5 | (Opcional local) Criar `apps/web/.env.local` com mesma URL | Para dev local |
| 1.6 | Redeploy Vercel após salvar env | Deployments → Redeploy |

**Depois (terminal, uma vez):**
```bash
cd /Users/thaise/Downloads/F5
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed   # só dev local; bloqueado em produção
```

✅ Teste: `/admin` → dados persistem após refresh (não só demo).

**Tenants P0 no seed (codenames internos — não usar nomes comerciais em docs externos):**

| Codename seed | Segmento | Cenário | SKU exemplo |
|---------------|----------|---------|-------------|
| `PET Piloto Nutri` | PET | AMAZON_1P | `PET-NP-001` |
| `PET Piloto Extru` | PET | SOCIO_DIGITAL | `PET-EX-020` |

Dev local (apaga e recria dados): `ALLOW_DESTRUCTIVE_SEED=true pnpm db:seed`

---

## 2. Senha do admin — **obrigatório em produção**

| # | Ação | Onde |
|---|------|------|
| 2.1 | Definir senha forte | Anote em gerenciador de senhas |
| 2.2 | Gerar token de sessão | `openssl rand -hex 32` → `ADMIN_SECRET` |
| 2.3 | Vercel → Environment Variables | `ADMIN_PASSWORD` + `ADMIN_SECRET` (valores diferentes) |
| 2.4 | Copiar UUID do tenant piloto | Neon → Tenant → `CLIENT_DEMO_TENANT_ID` |
| 2.5 | (Opcional) | `ADMIN_EMAIL` = seu email |
| 2.6 | Redeploy | Vercel |

✅ Teste: https://f5-industria-digital.vercel.app/admin/login

---

## 3. GitHub — **backup do código**

| # | Ação | Onde |
|---|------|------|
| 3.1 | Push do branch atual | `git push origin claude/project-f5-n2x24y` |
| 3.2 | (Opcional) Abrir PR → `main` | GitHub |

**Repo F5 separado do imobi** — mesmo org GitHub, repo diferente.

---

## 4. Sentry — monitoramento F5

**Guia completo:** [`docs/SENTRY_F5.md`](./SENTRY_F5.md)

**Org:** `imobi-hl` · **DSN key:** `f5-web` · [Dashboard](https://imobi-hl.sentry.io/projects/javascript/)

| # | Ação | Status |
|---|------|--------|
| 4.1 | DSN `f5-web` criado via MCP | ✅ (interim no projeto `javascript`) |
| 4.2 | Vercel: `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` | ⬜ **você** — ver `SENTRY_F5.md` |
| 4.3 | Vercel: `SENTRY_ORG=imobi-hl` · `SENTRY_PROJECT=javascript` | ⬜ |
| 4.4 | (Opcional) `SENTRY_AUTH_TOKEN` source maps | ⬜ |
| 4.5 | Redeploy | ⬜ |
| 4.6 | (Ideal) Owner cria projeto **`f5-web`** separado | ⬜ |

⚠️ **Não** reutilizar DSN do projeto `javascript` / imobi.

---

## 5. Render — **API Nest (fase 2, ainda não)**

| # | Ação | Quando |
|---|------|--------|
| 5.1 | New Web Service → repo `f5` | Sprint B+ |
| 5.2 | Root: `services/api`, build Nest | |
| 5.3 | Env: `DATABASE_URL` (mesmo Neon) | |
| 5.4 | URL ex: `f5-api.onrender.com` | |

Por enquanto Next.js + Prisma direto na Vercel — Render **não é urgente**.

---

## 6. AWS S3 — **XMLs NF-e (fase 2, ainda não)**

| # | Ação | Quando |
|---|------|--------|
| 6.1 | Criar bucket `f5-nfe-xml` (ou prefixo `f5-`) | Sprint B |
| 6.2 | IAM user/policy só para F5 | Não reusar credenciais imobi |
| 6.3 | Vercel env: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | |

Hoje XML fica no Postgres (`xmlContent`) — S3 é otimização.

---

## 7. Firebase — **NÃO usar projeto imobi**

| Opção | Ação manual |
|-------|-------------|
| **Recomendado** | Postgres (Neon) + login admin por senha; cliente via Supabase depois |
| Alternativa | Criar **projeto Firebase novo** só F5 (se quiser auth mobile) |

❌ Nunca apontar F5 para o Firebase do imobi.

---

## 8. Domínio custom (opcional)

| # | Ação | Onde |
|---|------|------|
| 8.1 | Comprar/configurar `f5.com.br` (ou similar) | Registrador |
| 8.2 | Vercel → Domains → Add | Apontar DNS |

---

## Checklist rápido — mínimo para piloto

```
[x] DATABASE_URL na Vercel
[x] pnpm db:migrate + db:seed
[x] ADMIN_PASSWORD na Vercel
[x] CLIENT_PORTAL_PASSWORD + CLIENT_PORTAL_SECRET na Vercel
[x] CLIENT_DEMO_TENANT_ID na Vercel (tenant piloto)
[ ] git push
[ ] Testar /admin/login + upload NF-e XML real
[ ] Testar /login → /cliente (senha portal)
[ ] Mandar link pro Raul
```

---

## O que o agente faz sozinho (sem você)

- Código, deploy via CLI (quando autorizado)
- Parser NF-e, admin, portal cliente
- Migrations e seed scripts
- Documentação técnica

## O que sempre precisa de você

- Criar contas e copiar **secrets** (DB, senhas, DSN)
- Decisões comerciais (piloto, preço, cenário)
- Redeploy após mudar env na Vercel
- Push git se quiser backup remoto
