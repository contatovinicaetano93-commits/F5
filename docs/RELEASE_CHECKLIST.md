# Release checklist — F5

## Pré-deploy

- [ ] `pnpm ci:check` verde
- [ ] `pnpm gate1:validate` verde (Neon)
- [ ] `pnpm gate2:validate` verde
- [ ] `pnpm gate3:validate` verde
- [ ] `pnpm smoke:prod` verde (opcional pós-deploy)

## Vercel Production

- [ ] `DATABASE_URL` (Neon)
- [ ] `ADMIN_PASSWORD` + `ADMIN_SECRET`
- [ ] Supabase: URL, publishable, secret, JWKS
- [ ] `CRON_SECRET` (cron segunda 06:00 UTC)
- [ ] Sentry DSN (quando projeto criado)

## Pós-deploy

- [ ] `/api/health` → `status: ok`, `db: ok`
- [ ] Admin login → central
- [ ] Portal piloto → `/cliente`
- [ ] Readiness piloto verde na central admin

## Rollback

Vercel → Deployments → Promote previous deployment
