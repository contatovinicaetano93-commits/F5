# F5 — Independent Platform

**INDÚSTRIA NO DIGITAL** — consultoria + operação marketplace + software.

## Quick start

```bash
pnpm install
pnpm dev                 # web + api
pnpm ci:check            # type-check + unit tests
pnpm gate2:validate      # NF-e + KPIs (requer DATABASE_URL)
```

## Documentação

| Doc | Uso |
|-----|-----|
| [EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) | Fases e gates |
| [AUTONOMOUS_BACKLOG.md](docs/AUTONOMOUS_BACKLOG.md) | **100 passos — memória do agente** |
| [MANUAL_SETUP.md](docs/MANUAL_SETUP.md) | Vercel, Neon, Supabase, Sentry |
| [OPERATING_MODEL.md](docs/OPERATING_MODEL.md) | Operação 360 |
| [SECURITY.md](docs/SECURITY.md) | Threat model |
| [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) | Deploy |

## Comandos úteis

```bash
pnpm gate1:validate          # admin operacional
pnpm gate3:validate          # portal cliente
pnpm smoke:prod              # smoke produção
pnpm db:seed:pilot           # SKUs piloto
pnpm onboard:tenant -- --name "..." --segment PET
pnpm demo:reset              # reset demo dev
pnpm db:recalc-all-tenants   # recalc KPIs
```

## Stack

Next.js 14 · Neon Postgres · Prisma · Supabase Auth · Vercel

## Produção

https://f5-industria-digital.vercel.app

---

Repo independente — zero dependência de imobi/amet.
