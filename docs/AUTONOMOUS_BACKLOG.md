# F5 — Backlog autônomo (100 passos)

**Memória persistente** do plano de execução. Atualizado automaticamente pelo agente.  
**Fonte de verdade de negócio:** `docs/EXECUTION_PLAN.md`

**Última execução:** Jun 2026 · Branch `claude/project-f5-n2x24y`

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Concluído |
| 🟡 | Parcial / código pronto, depende config manual |
| ⬜ | Pendente |
| ⚠️ | Bloqueado — ação humana (credencial, comercial) |

---

## Bloco 1 — Observabilidade & deploy (1–10)

| # | Passo | Status |
|---|--------|--------|
| 1 | Sentry `f5-web` + DSN Vercel | ⚠️ MCP 403 — Owner cria projeto |
| 2 | `SENTRY_AUTH_TOKEN` + source maps | 🟡 `withSentryConfig` ✅ |
| 3 | GitHub Action type-check + build | ✅ `.github/workflows/ci.yml` |
| 4 | GitHub Action `gate2:validate` | ✅ job `gate2` (secret `DATABASE_URL`) |
| 5 | CI `prisma migrate deploy` | ⬜ |
| 6 | `pnpm smoke:prod` | ✅ `scripts/smoke-prod.mjs` |
| 7 | Alertas Sentry 5xx | ⚠️ depende DSN |
| 8 | `/api/health` | ✅ |
| 9 | Preview env docs | 🟡 `docs/MANUAL_SETUP.md` |
| 10 | Cron recalc dashboard | ✅ `vercel.json` + `/api/cron/recalc-dashboard` |

## Bloco 2 — Admin Gate 1 (11–25)

| # | Passo | Status |
|---|--------|--------|
| 11 | `/admin/clientes/[id]` 360° | ✅ |
| 12 | CRUD tenant edit | ✅ PATCH API |
| 13 | CRUD produto edit | ⬜ |
| 14 | Bulk import catálogo CSV | ⬜ |
| 15 | Filtro + busca listas | ⬜ |
| 16 | Paginação admin | ⬜ |
| 17 | Export CSV lançamentos | ⬜ |
| 18 | Export CSV NF-e | ⬜ |
| 19 | Toast sucesso/erro | ⬜ |
| 20 | Progress bar upload XML | ⬜ |
| 21 | Preview NF-e antes confirmar | ⬜ |
| 22 | Badge giro baixo → SKU | ⬜ |
| 23 | Widget fluxo semanal | ✅ admin central |
| 24 | Atalho insight de giro baixo | ⬜ |
| 25 | `pnpm gate1:validate` | ✅ |

## Bloco 3 — Portal Gate 3 (26–45)

| # | Passo | Status |
|---|--------|--------|
| 26 | `/cliente/insights` | ✅ |
| 27 | Tab Insights bottom nav | ✅ |
| 28 | API insights UI | ✅ |
| 29 | Empty states | ✅ |
| 30 | Variação % mês anterior | 🟡 API tem campo |
| 31 | Gráfico 6 meses | ⬜ |
| 32 | Barras canal | ✅ |
| 33 | Mobile bottom nav | ✅ |
| 34 | Desktop sidebar | ✅ |
| 35 | Skeleton loading | ✅ |
| 36 | `formatBRL` em `@f5/core` | ✅ |
| 37 | Linguagem cliente | 🟡 |
| 38 | Top 3 repasses | 🟡 lista completa |
| 39 | Ordenar produtos | ⬜ |
| 40 | Badges performance | ✅ tendência |
| 41 | Timeline NF → recebimento | ⬜ |
| 42 | Perfil contato F5 | ✅ |
| 43 | Logout no perfil | ✅ |
| 44 | `noindex` cliente/login | ✅ |
| 45 | `pnpm gate3:validate` | ✅ |

## Bloco 4 — Dados & KPIs (46–60)

| # | Passo | Status |
|---|--------|--------|
| 46 | Variação vs mês anterior | ⬜ |
| 47 | Histórico mensal | ⬜ |
| 48 | Regra giro baixo documentada | ⬜ |
| 49 | Recalc pós NF/CSV | ✅ |
| 50 | PaymentSchedule `paid` manual | ✅ |
| 51 | Marcar repasse recebido | ✅ |
| 52 | Conciliação A receber | ✅ |
| 53 | Parser NF namespaces | 🟡 parcial |
| 54 | Erros parser amigáveis | 🟡 |
| 55 | Match SKU XML | 🟡 |
| 56 | Template CSV download | ⬜ |
| 57 | Preview CSV import | ⬜ |
| 58 | Idempotência CSV | ⬜ |
| 59 | `pnpm db:recalc-all-tenants` | ✅ |
| 60 | Métricas admin Gate 4 | 🟡 pilotReadiness |

## Bloco 5 — Auth & segurança (61–75)

| # | Passo | Status |
|---|--------|--------|
| 61 | Rate limit client login | ✅ |
| 62 | Audit insight/tenant | 🟡 NF/metrics ✅ |
| 63 | Security headers middleware | ✅ |
| 64 | Rotação secrets doc | 🟡 SECURITY.md |
| 65 | Supabase email → tenantId | ✅ Prisma User |
| 66 | piloto-a → Nutri | ✅ |
| 67 | Middleware Supabase first | ✅ |
| 68 | RLS Supabase | ⬜ P2 |
| 69 | Teste isolamento tenant | ✅ gate3 |
| 70 | RBAC admin/operator | ⬜ |
| 71 | Sessão admin expiração env | ⬜ |
| 72 | CSRF admin | ⬜ |
| 73 | Limite upload 5MB XML | ✅ |
| 74 | Log JSON estruturado | ✅ `lib/logger.ts` |
| 75 | `docs/SECURITY.md` | ✅ |

## Bloco 6 — Testes (76–85)

| # | Passo | Status |
|---|--------|--------|
| 76 | Testes parser NF | ✅ `test:unit` |
| 77 | Testes CSV + dashboard | 🟡 CSV ✅ |
| 78 | Integração NF idempotente | ✅ gate2 |
| 79 | Integração CSV | ✅ gate2 |
| 80 | E2E Playwright | ⬜ |
| 81 | Snapshot landing | ⬜ |
| 82 | `pnpm test` turbo | ⬜ |
| 83 | Pre-commit type-check | ⬜ |
| 84 | Lighthouse CI | ⬜ |
| 85 | `docs/RELEASE_CHECKLIST.md` | ✅ |

## Bloco 7 — Docs & DX (86–92)

| # | Passo | Status |
|---|--------|--------|
| 86 | EXECUTION_PLAN status | 🟡 |
| 87 | WEEKLY_OPERATOR.md | ⬜ |
| 88 | CSV_FORMAT.md | ✅ |
| 89 | NFE_UPLOAD.md | ✅ |
| 90 | `pnpm onboard:tenant` | ✅ |
| 91 | `pnpm demo:reset` | ✅ |
| 92 | README links | ✅ |

## Bloco 8 — Infra P2 (93–97)

| # | Passo | Status |
|---|--------|--------|
| 93 | `XmlStorage` interface | ✅ |
| 94 | `.env.example` completo | 🟡 |
| 95 | Deprecate Nest duplicado | ⬜ |
| 96 | BullMQ stub NF | ✅ |
| 97 | Neon branch por PR | ⬜ |

## Bloco 9 — Gate 4 (98–100)

| # | Passo | Status |
|---|--------|--------|
| 98 | Readiness piloto admin | ✅ |
| 99 | Email insight stub | ⬜ |
| 100 | PR main merge | ⚠️ comercial |

---

## Comandos de validação

```bash
pnpm gate1:validate   # admin operacional
pnpm gate2:validate   # NF-e + CSV + KPIs
pnpm gate3:validate   # portal alinhado
pnpm smoke:prod       # produção
pnpm ci:check         # type-check + unit
```

## Próximo lote autônomo (prioridade)

1. Bloco 2: CRUD tenant/produto + filtros + paginação  
2. Bloco 4: PaymentSchedule paid + template CSV  
3. Bloco 6: Playwright E2E admin→portal  
4. ⚠️ Sentry DSN (manual)
