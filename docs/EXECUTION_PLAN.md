# F5 — Plano de Execução Guiado
## Architecture-first · Escalável · Resiliente

**Versão**: 1.0  
**Data**: Junho 2026  
**Status**: Fonte única de verdade para implementação

> **Substitui** `MVP_PLAN_V2.md` (visão antiga com sync de marketplace).  
> **Complementa** (não repete): `docs/OPERATING_MODEL.md` (negócio) · `docs/ARCHITECTURE_STRATEGY.md` (decisões técnicas)

---

## Norte

**F5 = contador digital da indústria no marketplace.**

| Camada | Pergunta que responde |
|--------|------------------------|
| **Operação F5** | O digital vende? O giro melhorou? |
| **Software** | A indústria vê números confiáveis sem abrir ML/Amazon? |
| **Meta comercial** | Piloto fechado → receita no bolso |

---

## Princípios de arquitetura (invioláveis)

```
1. OPERAÇÃO MANUAL > API MARKETPLACE no MVP
2. MULTI-TENANT desde o dia 1 (tenant_id em tudo)
3. FALLBACK GRACIOSO (sem DB → demo; com DB → produção)
4. IDEMPOTÊNCIA em NF-e (mesmo XML não processa 2x)
5. SEPARAÇÃO CLARA: admin (operador) vs cliente (indústria)
6. ZERO DEPENDÊNCIA imobi/amet — repo e deploy independentes
7. ESCALA HORIZONTAL quando necessário — stateless API, filas só para NF/email
```

### Resiliência

| Risco | Mitigação |
|-------|-----------|
| ML/Amazon fora do ar | Sistema não depende de API deles em runtime |
| Vercel cold start | Admin + cliente leves; API Nest em Railway separado (P2) |
| Perda de dados | PostgreSQL managed + backups; XMLs em S3 (P2) |
| Vazamento entre clientes | `tenant_id` + RLS (P1) + RBAC |
| Deploy quebrado | Build obrigatório antes de prod; preview por PR |

---

## Mapa de fases

```
FASE 0 ──► FASE 1 ──► FASE 2 ──► FASE 3 ──► FASE 4 ──► FASE 5
Fundacao   Admin      Dados      Cliente    Piloto     Escala
(tech)     interno    real       produção   comercial  opcional
```

Cada fase tem **critério de saída (gate)**. Não avançar sem gate verde.

---

## FASE 0 — Fundação ✅ (concluída)

**Objetivo**: Monorepo, identidade, deploy, docs alinhados ao modelo Raul.

| Item | Status |
|------|--------|
| Monorepo Turborepo + pnpm | ✅ |
| Design system @f5/ui | ✅ |
| OPERATING_MODEL + ARCHITECTURE_STRATEGY | ✅ |
| Landing premium + Vercel prod | ✅ |
| Pitch comercial client-safe | ✅ |
| Prisma schema (Tenant, Product, Metric, Insight, NF) | ✅ |
| Migration 002_internal_ops | ✅ |

**Gate 0**: Site no ar + docs de negócio alinhados → **PASS**

---

## FASE 1 — Admin interno (operador F5) ✅ concluída

**Objetivo**: Operador F5 registra tudo que a indústria precisa ver — sem planilha paralela.

| Item | Status | Notas |
|------|--------|-------|
| `/admin` — Central | ✅ | KPIs operacionais |
| `/admin/clientes` | ✅ | Tenants por segmento |
| `/admin/lancamentos` | ✅ | Métricas manuais |
| `/admin/nfe` | ✅ | Upload XML + registro manual |
| `/admin/insights` | ✅ | Publicável ao cliente |
| `/admin/catalogo` | ✅ | SKUs monitorados |
| Auth admin (senha) | ✅ | `ADMIN_PASSWORD` na Vercel |
| API `/api/admin/*` | ✅ | Postgres + fallback memória |
| Nest InternalModule | ✅ | `/api/v1/internal/*` |
| **PostgreSQL persistente** | ✅ | Neon + `DATABASE_URL` prod |
| Import CSV métricas | ⬜ | P1 — próximo na fase |
| Upload NF-e XML → parser | ✅ | Idempotente |

**Gate 1** (sair da fase):
- [x] `DATABASE_URL` em prod (Neon)
- [x] Seed rodado; admin lê/escreve no Postgres
- [ ] 1 tenant piloto cadastrado com SKUs reais (codinomes)
- [ ] Operador consegue fluxo semanal completo (segunda→sexta do OPERATING_MODEL)

---

## FASE 2 — Dados reais (source of truth) ✅ concluída

**Objetivo**: NF-e e lançamentos alimentam KPIs automaticamente.

| Item | Prioridade | Status |
|------|------------|--------|
| NF-e upload XML no admin | P0 | ✅ |
| Idempotência NF (nfNumber+series+emitente) | P0 | ✅ |
| PaymentSchedule D+15/D+60 pós-NF | P0 | ✅ |
| DashboardMetrics agregação mensal | P0 | ✅ |
| Import CSV relatório ML/Amazon | P1 | ✅ |
| S3 para XML bruto | P2 | ⬜ |
| BullMQ fila processamento NF | P2 | ⬜ |

**Gate 2**:
- [x] Upload de 1 NF-e real processa itens + recebimentos (validado via `pnpm gate2:validate`)
- [x] KPIs do tenant batem com NF (± lançamentos manuais)
- [x] Zero duplicata de NF no reprocessamento

---

## FASE 3 — Portal cliente (indústria) 🟡 quase pronta

**Objetivo**: Indústria vê só KPIs — nunca opera marketplace.

| Tela | Status |
|------|--------|
| `/cliente` Início | ✅ Postgres + insights |
| `/cliente/produtos` | ✅ Postgres |
| `/cliente/financeiro` | ✅ Postgres + PaymentSchedule |
| `/cliente/perfil` | ✅ Postgres |
| Dados do Postgres (não mock) | ✅ com `DATABASE_URL` |
| Login cliente (senha portal) | ✅ `CLIENT_PORTAL_*` na Vercel |
| Login cliente (Supabase) | ⬜ P2 — multi-tenant por email |
| RLS por tenant | ⬜ P2 |
| Insights visíveis ao cliente | ✅ |

**Gate 3**:
- [x] Cliente loga (`/login` → senha portal)
- [x] KPIs refletem admin (NF + lançamentos)
- [x] Nenhuma rota admin exposta no portal
- [ ] Supabase por tenant (quando >1 cliente simultâneo)

---

## FASE 4 — Piloto comercial (1–2 indústrias)

**Objetivo**: Dinheiro no bolso — operação + software juntos.

| Item | Responsável |
|------|-------------|
| Tabela de preço no Drive | Raul/Vinicius |
| Diagnóstico + cenário (1–4) | Comercial |
| Onboarding tenant piloto | Operador |
| Primeira NF-e do piloto | Operador |
| Review semanal KPIs com cliente | Operador |
| Feedback → backlog | Tech |

**Gate 4**:
- [ ] 1 cliente pagante ou piloto contratual
- [ ] GMV rastreado na plataforma
- [ ] Cliente não precisou abrir painel ML na semana

---

## FASE 5 — Escala (só se volume justificar)

| Item | Quando |
|------|--------|
| App mobile Expo (KPIs) | Cliente pede mobile |
| API Nest em Railway prod | Web admin precisa desacoplar |
| OAuth ML/Amazon | Volume > manual aguenta |
| Redis + BullMQ prod | NF > 50/dia |
| Domínio custom f5.com.br | Marca consolidada |

**Não construir antes do Gate 4.**

---

## Infraestrutura — mesma stack imobi, projetos separados

> **Regra**: mesma **conta** (Vercel, AWS, Sentry, GitHub, Render) — **projeto/serviço/banco/DSN separados**.

| Ferramenta | imobi | F5 | Compartilhar conta? |
|------------|-------|-----|---------------------|
| **GitHub** | repo `imobi` | repo `f5` | ✅ org igual |
| **Vercel** | projeto imobi | `f5-industria-digital` | ✅ |
| **Render** | API imobi | `f5-api` (futuro) | ✅ |
| **Sentry** | projeto imobi | `f5-web` + `f5-api` | ✅ org igual, DSN diferente |
| **AWS** | recursos imobi | bucket `f5-*`, IAM `f5-*` | ✅ conta igual |
| **Firebase** | auth imobi | **não usar** — Neon + Supabase depois | ❌ projeto imobi |
| **Neon/Postgres** | (se imobi usa) | `f5-prod` database | ✅ instância separada |

**Setup manual completo**: `docs/MANUAL_SETUP.md` ← **você faz os itens marcados lá**

---

## Stack por camada (decisão fechada)

```
┌─────────────────────────────────────────────────────────┐
│  Vercel          Next.js 14 — web (landing+admin+cliente)│
│  Neon            PostgreSQL — source of truth            │
│  Render (P2)     NestJS API — quando desacoplar          │
│  Supabase (P2)   Auth cliente — projeto F5 separado      │
│  AWS S3 (P2)     XMLs NF-e (hoje: Postgres xmlContent) │
│  Sentry (P2)     f5-web + f5-api                         │
└─────────────────────────────────────────────────────────┘
```

**Regra**: Next.js + Prisma na Vercel no MVP. NestJS no Render quando volume pedir.

---

## Backlog técnico ordenado (trabalho autônomo)

### Sprint A — Persistência ✅ concluída
1. ✅ Documentar setup (`docs/SETUP_DATABASE.md`, `docs/MANUAL_SETUP.md`)
2. ✅ `prisma generate` no build web
3. ✅ Upload NF-e XML no admin (`/api/admin/nfs/upload`)
4. ✅ `DATABASE_URL` + migrate + seed (Neon prod)
5. ✅ Cliente `/api/client/*` lê Postgres

### Sprint B — KPIs reais (Fase 2) 🟡 em progresso
6. ✅ PaymentSchedule automático pós-NF
7. ✅ DashboardMetrics agregação mensal
8. ✅ Import CSV métricas no admin
9. AWS S3 XML (opcional)

### Sprint C — Auth cliente (Fase 3) 🟡 MVP pronto
10. ✅ Senha portal (`CLIENT_PORTAL_PASSWORD` + `CLIENT_PORTAL_SECRET`)
11. ⬜ Supabase project F5 (P2 — multi-tenant por email)
12. ⬜ RLS por tenant (P2)
13. ✅ Login `/login` funcional
14. ✅ `/cliente` exige sessão em produção

### Sprint D — Hardening
14. Sentry `f5-web` (**VOCÊ**: criar projeto + DSN)
15. Rate limit admin login
16. Audit log operador
17. Landing tags client-safe

---

## O que NÃO fazer (anti-patterns)

- ❌ Sync estoque/pedidos ML a cada 5 min
- ❌ OAuth marketplace no MVP
- ❌ Cliente vê catálogo técnico / sync logs
- ❌ IA publicando anúncio sozinha
- ❌ Importar código imobi/amet
- ❌ Nomes de clientes reais em materiais externos
- ❌ Avançar Fase 5 antes Gate 4

---

## Ambientes

| Ambiente | URL | DB | Auth admin |
|----------|-----|-----|------------|
| Local | localhost:3000 | Docker/Neon dev | .env.local |
| Preview | *.vercel.app | Neon branch | ADMIN_PASSWORD |
| Prod | f5-industria-digital.vercel.app | Neon prod | ADMIN_PASSWORD |

---

## Métricas de progresso

| Métrica | Alvo Fase 4 |
|---------|-------------|
| Tenants ativos | ≥ 1 piloto |
| SKUs monitorados | ≥ 10 |
| NF-e/mês processadas | ≥ 5 |
| Lançamentos/semana | ≥ 1 por tenant |
| Uptime Vercel | > 99% |

---

## Referências rápidas

| Doc | Uso |
|-----|-----|
| `docs/OPERATING_MODEL.md` | O que o sistema faz vs operação manual |
| `docs/ARCHITECTURE_STRATEGY.md` | Decisões técnicas profundas |
| `docs/UI_UX_PRINCIPLES.md` | Admin vs cliente UI |
| `docs/MANUAL_SETUP.md` | **Checklist do que VOCÊ faz manualmente** |
| `docs/SETUP_DATABASE.md` | PostgreSQL Neon + env vars |
| `CLAUDE.md` | Contexto repo |

---

## Changelog do plano

| Data | Versão | Mudança |
|------|--------|---------|
| Jun 2026 | 1.1 | Infra matrix imobi/F5 + Sprint A NF-e upload |
| Jun 2026 | 1.0 | Plano consolidado; substitui MVP_PLAN_V2 |

---

**Próxima ação**: Gate 2 — validar NF-e real do piloto + Gate 4 — fechar 1 indústria piloto.
