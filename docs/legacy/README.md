# Documentação legada (pré-MVP jun/2026)

Estes arquivos descrevem a **visão antiga** do F5: SaaS com sync automático de marketplaces (ML, Amazon, Shopee), API Nest como backend principal e app mobile completo.

**Não use como fonte de verdade para implementação.**

## Fonte de verdade atual

| Doc | Conteúdo |
|-----|----------|
| [`docs/OPERATING_MODEL.md`](../OPERATING_MODEL.md) | Modelo de negócio — consultoria + operação manual |
| [`docs/EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) | Plano de execução e gates |
| [`docs/ARCHITECTURE_STRATEGY.md`](../ARCHITECTURE_STRATEGY.md) | Arquitetura — mínimas integrações |
| [`CLAUDE.md`](../../CLAUDE.md) | Guia do projeto |

## O que mudou

- **Operação marketplace** → manual F5 (não sync API no MVP)
- **Portal cliente** → `/cliente` (não `/dashboard` Supabase)
- **Stack ativa** → `apps/web` + Prisma/Neon (API Nest em standby)
- **Fixtures de teste** → `apps/web/public/fixtures/` (única cópia; ver `services/api/prisma/fixtures/README.md`)
- **Código sync API** → `services/api/src/legacy/sync/` (não importado no app ativo)

Arquivos aqui são mantidos só como referência histórica.
