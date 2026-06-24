# Sentry F5 — projeto separado do imobi

**Objetivo:** erros do F5 identificados por tags `service:f5-web`, sem misturar com imobi no mesmo DSN.

| | imobi | F5 |
|---|-------|-----|
| Org Sentry | `imobi-hl` | `imobi-hl` |
| Projeto ideal | `javascript` | **`f5-web`** (Owner cria) |
| DSN F5 | ❌ não reutilizar | ✅ key **`f5-web`** (via MCP) |
| Tags eventos | — | `service:f5-web` |

Código: `@sentry/nextjs` + `instrumentation-client.ts` + `withSentryConfig`.

---

## Status MCP (Jun 2026)

| Ação MCP | Resultado |
|----------|-----------|
| `create_project` → `f5-web` | ❌ 403 — Members não podem criar projeto |
| `create_dsn` → key **`f5-web`** no projeto `javascript` | ✅ DSN dedicado F5 |
| `whoami` | `contato.vinicaetano93@gmail.com` |

**Interim:** DSN separado, eventos no projeto Sentry `javascript` com tag `service:f5-web`.  
Filtrar no dashboard: `service:f5-web` ou DSN key `f5-web`.

**Ideal (Owner):** criar projeto `f5-web` → migrar DSN → `SENTRY_PROJECT=f5-web` na Vercel.

---

## DSN F5 (key `f5-web`)

> Copie para Vercel — **não commitar** no repo.

```
NEXT_PUBLIC_SENTRY_DSN=https://1450b74cfefdd0f2187679abff9a4e80@o4511474932514816.ingest.us.sentry.io/4511474938478592
SENTRY_DSN=https://1450b74cfefdd0f2187679abff9a4e80@o4511474932514816.ingest.us.sentry.io/4511474938478592
```

Dashboard: https://imobi-hl.sentry.io/projects/javascript/

---

## Vercel (`f5-industria-digital`)

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN acima |
| `SENTRY_DSN` | mesmo DSN |
| `SENTRY_ORG` | `imobi-hl` |
| `SENTRY_PROJECT` | `javascript` (interim) ou `f5-web` (após Owner criar) |
| `SENTRY_AUTH_TOKEN` | (opcional) source maps |

Ambientes: **Production** + **Preview** → **Redeploy**.

---

## Local (opcional)

`apps/web/.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://1450b74cfefdd0f2187679abff9a4e80@o4511474932514816.ingest.us.sentry.io/4511474938478592
SENTRY_DSN=https://1450b74cfefdd0f2187679abff9a4e80@o4511474932514816.ingest.us.sentry.io/4511474938478592
SENTRY_ORG=imobi-hl
SENTRY_PROJECT=javascript
```

Source maps no build:

```bash
cp apps/web/.env.sentry-build-plugin.example apps/web/.env.sentry-build-plugin
# editar SENTRY_AUTH_TOKEN
```

---

**Causa comum (corrigida Jun/2026):** `tunnelRoute: /monitoring` retornava 404 na Vercel — eventos não chegavam. Removido; envio direto ao ingest (permitido no CSP).

## Verificar (sem console / F12)

1. Login admin: https://f5-industria-digital.vercel.app/admin/login  
2. Abra **Admin → Sentry** (`/admin/sentry-test`)  
3. Clique **Testar Sentry (servidor)** ou **Testar Sentry (browser)**  
4. Em ~30s, veja issues com tag `service:f5-web`

## Verificar (CLI)

```bash
pnpm sentry:verify   # checa env vars locais
```

1. Redeploy Vercel com DSN  
2. Console em https://f5-industria-digital.vercel.app:

```javascript
throw new Error('F5 Sentry test');
```

3. Issue em https://imobi-hl.sentry.io/issues/ — filtrar `service:f5-web`

---

## Futuro

- Owner cria projeto **`f5-web`** → novo DSN → atualizar Vercel  
- NestJS Render: **`f5-api`** (mesma org, DSN separado)
