# Código legado — API Nest (pré-MVP jun/2026)

Módulos **fora do escopo** do MVP atual (consultoria + operação manual + plataforma KPIs em `apps/web`).

## O que está aqui

| Pasta | Visão antiga | Status |
|-------|--------------|--------|
| `sync/` | Sync automático ML/Amazon/Shopee (estoque, pedidos, filas BullMQ) | Não importado em `app.module.ts` |

## Modelo atual

- **Operação marketplace** → manual pela equipe F5
- **Portal cliente** → `apps/web` (`/cliente`) + Prisma/Neon
- **NF-e + métricas** → parser e import no Next.js, não via sync API

## Type-check

`services/api/tsconfig.json` exclui `src/legacy/**` do build ativo. Código mantido só como referência histórica.

Para reativar sync no futuro, importar `SyncModule` em `app.module.ts` e alinhar com `docs/OPERATING_MODEL.md`.
