# F5 — Segurança

## Superfície de ataque

| Área | Proteção |
|------|----------|
| Admin `/admin/*` | Cookie `ADMIN_SECRET` + rate limit login (5/15min) |
| Portal `/cliente/*` | Supabase JWT ou `CLIENT_PORTAL_SECRET` |
| API | Middleware auth + headers de segurança |
| Uploads | XML ≤ 5 MB · CSV ≤ 2 MB |
| Multi-tenant | `tenant_id` em Prisma + lookup por email |

## Headers (middleware)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` (básico)
- `Referrer-Policy: strict-origin-when-cross-origin`

## Rotação de secrets

| Secret | Quando rotacionar |
|--------|-------------------|
| `ADMIN_PASSWORD` / `ADMIN_SECRET` | Saída de operador, suspeita de vazamento |
| `CLIENT_PORTAL_SECRET` | Modo portal senha única (fallback) |
| `SUPABASE_SECRET_KEY` | Dashboard Supabase → regenerate |
| `CRON_SECRET` | Ao configurar cron Vercel |
| `DATABASE_URL` | Neon → reset password |

## O que não commitar

- `.env`, `.env.local`, `f5-notes.md`
- Tokens Supabase (`sbp_*`), Sentry auth token

## Threat model (MVP)

1. **Vazamento entre clientes** — mitigado por `User.tenantId` + auth email
2. **Brute force admin** — rate limit + audit log
3. **Brute force portal** — rate limit IP (modo senha)
4. **XXE/XML bomb** — limite tamanho + parser sem entidades externas
5. **RLS** — P2 quando >1 cliente simultâneo no Supabase

## Logs

Produção: JSON estruturado via `lib/logger.ts` — sem PII (email, senha).
