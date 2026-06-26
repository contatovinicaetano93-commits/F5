# F5 — Próximos 100 passos (Onda 2)

**Atualizado:** 25 Jun 2026 · Branch `claude/project-f5-n2x24y`  
**Onda 1 (1–100):** ~85% concluída — ver histórico em git / EXECUTION_PLAN  
**Fonte de negócio:** `docs/EXECUTION_PLAN.md` · **Checklist deploy:** `docs/RELEASE_CHECKLIST.md`  
**Premissas & SIPOC:** `docs/SIPOC.md` · `docs/PREMISES_BACKLOG.md` (P0–P2)

---

## Legenda

| Tag | Quem faz |
|-----|----------|
| 🤖 | **Autônomo** — agente/código (sem credencial comercial) |
| 👤 | **Manual** — você (Vercel, Supabase, comercial, decisão) |
| 🤖→👤 | Código pronto; **validar** em prod após deploy |

---

## Resumo executivo (5h de sono / amanhã cedo)

| Prioridade | Ação | Tag |
|------------|------|-----|
| 1 | Redeploy Vercel + vars `ADMIN_*` + Supabase | 👤 |
| 2 | Login admin `Adminf5@123` → painel sem crash | 🤖→👤 |
| 3 | `pnpm smoke:prod` + gates verdes | 🤖→👤 |
| 4 | 1º fluxo semanal operador (seg→sex) | 👤 |
| 5 | Fechar piloto comercial (Gate 4) | 👤 |

---

## Bloco A — Deploy & estabilidade (1–15)

| # | Passo | Tag |
|---|--------|-----|
| 1 | Redeploy prod branch `claude/project-f5-n2x24y` | 👤 |
| 2 | Vercel: `ADMIN_PASSWORD=Adminf5@123` | 👤 |
| 3 | Vercel: `ADMIN_EMAIL=admin@f5digital.com.br` | 👤 |
| 4 | Vercel: `ADMIN_SECRET` ≠ senha (openssl rand -hex 32) | 👤 |
| 5 | Vercel: `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SECRET_KEY` | 👤 |
| 6 | Testar `/admin/login` aba anônima após deploy | 👤 |
| 7 | Confirmar hint “senha padrão” na tela de login | 🤖→👤 |
| 8 | Confirmar cards colapsáveis no painel | 🤖→👤 |
| 9 | Confirmar error boundary (sem “Application error”) | 🤖→👤 |
| 10 | `pnpm smoke:prod` contra URL prod | 🤖→👤 |
| 11 | `/api/health` → `db: ok` | 🤖→👤 |
| 12 | Merge PR → `main` quando gates + login OK | 👤 |
| 13 | Promote deployment anterior (rollback doc) se falhar | 👤 |
| 14 | CI: `prisma migrate deploy` no GitHub Action | 🤖 |
| 15 | Documentar vars mínimas prod em `.env.example` | 🤖 |

## Bloco B — Admin UX & operação (16–35)

| # | Passo | Tag |
|---|--------|-----|
| 16 | Toast sucesso/erro (sonner ou inline) em forms admin | 🤖 |
| 17 | Progress bar upload XML NF-e | 🤖 |
| 18 | Preview NF-e antes de confirmar upload | 🤖 |
| 19 | CRUD produto — editar SKU/nome/canal | 🤖 |
| 20 | CRUD tenant — editar nome/status na UI | 🤖 |
| 21 | Busca + filtro texto em clientes/catálogo | 🤖 |
| 22 | Paginação listas (clientes, métricas, NF) | 🤖 |
| 23 | Export CSV lançamentos | 🤖 |
| 24 | Export CSV NF-e registradas | 🤖 |
| 25 | Badge “giro baixo” linkando SKU | 🤖 |
| 26 | Atalho “criar insight” a partir de giro baixo | 🤖 |
| 27 | Bulk import catálogo CSV | 🤖 |
| 28 | Template CSV catálogo download | 🤖 |
| 29 | Confirmação antes de excluir/desativar SKU | 🤖 |
| 30 | Empty states consistentes em todas páginas admin | 🤖 |
| 31 | Loading skeletons admin (espelhar portal) | 🤖 |
| 32 | Operador testa fluxo seg→sex (OPERATING_MODEL) | 👤 |
| 33 | Registrar 1 lançamento real piloto | 👤 |
| 34 | Upload 1 NF-e real piloto | 👤 |
| 35 | Publicar 1 insight visível ao cliente | 👤 |

## Bloco C — Portal cliente (36–50)

| # | Passo | Tag |
|---|--------|-----|
| 36 | Gráfico receita 6 meses (Início) | 🤖 |
| 37 | Variação % vs mês anterior nos KPIs | 🤖 |
| 38 | Top 3 repasses (não lista completa) | 🤖 |
| 39 | Timeline NF → data recebimento | 🤖 |
| 40 | Ordenar produtos (receita, giro, SKU) | 🤖 |
| 41 | Linguagem 100% cliente (revisão copy) | 🤖 |
| 42 | Demo login `demo.nutri@` teste prod | 👤 |
| 43 | Cliente piloto recebe credenciais | 👤 |
| 44 | Walkthrough 15 min com cliente piloto | 👤 |
| 45 | Coletar feedback escrito (Notion/Drive) | 👤 |
| 46 | `pnpm gate3:validate` pós-mudanças | 🤖→👤 |
| 47 | Mobile Safari test portal | 👤 |
| 48 | PWA manifest opcional (ícone F5) | 🤖 |
| 49 | Email “seu insight da semana” (stub Resend) | 🤖 |
| 50 | Configurar domínio email / Resend API key | 👤 |

## Bloco D — Dados & KPIs (51–65)

| # | Passo | Tag |
|---|--------|-----|
| 51 | Histórico mensal agregado API | 🤖 |
| 52 | Regra giro baixo documentada (`docs/KPI_RULES.md`) | 🤖 |
| 53 | Idempotência CSV (mesmo arquivo 2x) | 🤖 |
| 54 | Preview CSV antes import (linhas válidas/inválidas) | 🤖 |
| 55 | Parser NF namespaces edge cases | 🤖 |
| 56 | Erros parser NF mensagens PT-BR | 🤖 |
| 57 | Match SKU XML ↔ catálogo sugestão | 🤖 |
| 58 | `pnpm db:recalc-all-tenants` cron segunda | 🤖→👤 |
| 59 | Validar cron `CRON_SECRET` na Vercel | 👤 |
| 60 | Seed piloto Nutri + Extru atualizado | 🤖 |
| 61 | `pnpm db:seed:users` idempotente prod | 🤖→👤 |
| 62 | Conciliar KPI admin vs portal (planilha) | 👤 |
| 63 | Gate 4 readiness verde (4 SKUs, NF, insight, viewer) | 🤖→👤 |
| 64 | Métricas GMV rastreado no admin | 🤖 |
| 65 | Export PDF resumo mensal cliente (P2) | 🤖 |

## Bloco E — Auth & segurança (66–78)

| # | Passo | Tag |
|---|--------|-----|
| 66 | Sessão admin TTL configurável (`ADMIN_SESSION_MAX_AGE`) | 🤖 |
| 67 | RBAC `operator` vs `admin` na UI | 🤖 |
| 68 | Audit log insights + tenant PATCH | 🤖 |
| 69 | Teste isolamento: tenant A não vê B | 🤖 |
| 70 | Rate limit feedback na UI (“aguarde 15 min”) | 🤖 |
| 71 | Rotacionar `ADMIN_SECRET` (procedimento) | 👤 |
| 72 | Rotacionar Supabase service key | 👤 |
| 73 | Supabase URL config redirect prod + localhost | 👤 |
| 74 | RLS Supabase (P2 — quando >2 clientes) | 🤖 |
| 75 | CSRF double-submit admin forms (P2) | 🤖 |
| 76 | Scan dependências (`pnpm audit`) fix críticos | 🤖 |
| 77 | Security review PR antes merge main | 🤖→👤 |
| 78 | Atualizar `docs/SECURITY.md` rotação | 🤖 |

## Bloco F — Testes & CI (79–88)

| # | Passo | Tag |
|---|--------|-----|
| 79 | Playwright: login admin → central | 🤖 |
| 80 | Playwright: login portal → KPIs | 🤖 |
| 81 | Playwright: upload NF fixture Gate 2 | 🤖 |
| 82 | `pnpm gate-pilot:e2e` no CI (secret DB) | 🤖 |
| 83 | Pre-commit hook type-check (husky) | 🤖 |
| 84 | Lighthouse CI landing (score > 90) | 🤖 |
| 85 | Snapshot test landing hero | 🤖 |
| 86 | `pnpm test` unificado turbo | 🤖 |
| 87 | Badge CI verde no README | 🤖 |
| 88 | Rodar suite completa antes cada release | 👤 |

## Bloco G — Observabilidade (89–94)

| # | Passo | Tag |
|---|--------|-----|
| 89 | Projeto Sentry `f5-web` (Owner org) | 👤 |
| 90 | `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` Vercel | 👤 |
| 91 | `SENTRY_AUTH_TOKEN` source maps | 👤 |
| 92 | Alerta Sentry erro 5xx / login spike | 👤 |
| 93 | Dashboard Sentry filtro `service:f5-web` | 👤 |
| 94 | Teste `/admin/sentry-test` pós-config | 🤖→👤 |

## Bloco H — Comercial Gate 4 (95–100)

| # | Passo | Tag |
|---|--------|-----|
| 95 | Tabela preço / proposta no Drive | 👤 |
| 96 | Escolher 1 indústria piloto (codinome) | 👤 |
| 97 | Onboarding call + acesso portal | 👤 |
| 98 | Contrato / piloto pago assinado | 👤 |
| 99 | Review semanal KPIs com cliente (recorrente) | 👤 |
| 100 | Gate 4 ✅ — GMV na plataforma + cliente não abriu ML | 👤 |

---

## Contagem Onda 2

| Tag | Passos | % |
|-----|--------|---|
| 🤖 Autônomo (código) | 52 | 52% |
| 👤 Manual (você) | 38 | 38% |
| 🤖→👤 Validar pós-deploy | 10 | 10% |

---

## Comandos (agente roda enquanto você dorme)

```bash
pnpm ci:check
pnpm gate1:validate
pnpm gate2:validate
pnpm gate3:validate
pnpm smoke:prod          # após deploy
pnpm db:seed:users       # Neon + Supabase
pnpm db:recalc-all-tenants
```

---

## Onda 1 — histórico (referência)

Itens 1–100 originais (Jun 2026): observabilidade, admin Gate 1, portal Gate 3, dados, auth, testes unitários, docs, infra P2, readiness piloto — **maioria ✅**.  
Pendências absorvidas na Onda 2 acima (E2E, Sentry Owner, Gate 4 comercial, CRUD/paginação admin).

---

## Próximo lote autônomo (esta noite)

1. Bloco B: toasts + CRUD produto + busca/paginação  
2. Bloco C: gráfico 6 meses + variação %  
3. Bloco F: Playwright admin + portal  
4. Bloco D: preview CSV + idempotência  

**Você amanhã (15 min):** passos 1–6 Bloco A → login → smoke prod.
