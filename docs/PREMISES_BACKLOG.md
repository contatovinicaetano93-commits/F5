# F5 — Backlog por Premissas (P0 → P2)
## Escalável · Guiado · AI-first · Resiliente · SIPOC

**Versão**: 1.0  
**Data**: Junho 2026  
**Branch**: `claude/project-f5-n2x24y`

> **Fontes**: auditoria arquitetura Jun/2026 · `docs/SIPOC.md` · `docs/EXECUTION_PLAN.md` · `docs/AUTONOMOUS_BACKLOG.md` (Onda 2)  
> **Legenda**: ✅ feito · 🟡 parcial · ⬜ pendente · 👤 manual · 🤖 código

---

## Scorecard atual

| Premissa | Docs | Código | Meta Gate |
|----------|------|--------|-----------|
| Escalável | ✅ | 🟡 45% | Gate 4 → Fase 5 |
| Guiado | ✅ | 🟡 40% | Gate 4 |
| AI-first | ✅ | 🔴 15% | P2 (pós-piloto) |
| Resiliente | ✅ | 🟡 65% | Gate 4 |
| SIPOC | ✅ (este ciclo) | 🟡 25% | Gate 4 |

---

## Como usar este backlog

1. **P0** — bloqueia escala ou risco antes de multi-cliente  
2. **P1** — fecha piloto comercial com experiência guiada + SIPOC no produto  
3. **P2** — Fase 5 (10+ clientes, volume NF, AI no runtime)

Itens com **#Onda2** referenciam `docs/AUTONOMOUS_BACKLOG.md`.

---

## P0 — Crítico (antes de escalar comercial)

| ID | Item | Premissa(s) | Owner | Status | Onda 2 / Notas |
|----|------|-------------|-------|--------|----------------|
| P0-01 | Formalizar SIPOC (`docs/SIPOC.md`) | SIPOC | 🤖 | ✅ | Este doc |
| P0-02 | Backlog premissas (`docs/PREMISES_BACKLOG.md`) | Todas | 🤖 | ✅ | Este doc |
| P0-03 | Redeploy Vercel + vars `ADMIN_*`, Supabase | Resiliente | 👤 | ⬜ | Onda2 #1–5 |
| P0-04 | Login admin + painel sem crash em prod | Resiliente | 🤖→👤 | 🟡 | Error boundary feito; validar deploy |
| P0-05 | `pnpm smoke:prod` + `/api/health` ok | Resiliente | 🤖→👤 | ⬜ | Onda2 #10–11 |
| P0-06 | **Zod em rotas `/api/admin/*` e `/api/client/*`** | Resiliente | 🤖 | ⬜ | Exportar `nf`/`dashboard` de `@f5/schemas` |
| P0-07 | **Teste isolamento tenant A ≠ B** (gate automático) | Resiliente + SIPOC | 🤖 | ⬜ | Onda2 #69 |
| P0-08 | Alinhar pitch AI-first vs produto (nota comercial ou 1 feature) | AI-first | 👤 | ⬜ | Ver `docs/SIPOC.md` gap #7 |
| P0-09 | `gate1` + `gate3` no CI (main) | Guiado + Resiliente | 🤖 | ⬜ | Onda2 #82 parcial |
| P0-10 | Documentar vars mínimas prod (`.env.example`) | Resiliente | 🤖 | ⬜ | Onda2 #15 |

### Critério de saída P0

- [ ] 1 cliente piloto em prod sem crash  
- [ ] Gates 1–3 verdes  
- [ ] SIPOC publicado e referenciado no `EXECUTION_PLAN`  
- [ ] Nenhum gap P0 de isolamento tenant aberto  

---

## P1 — Pós Gate 4 (1º cliente pagante)

| ID | Item | Premissa(s) | Owner | Status | Onda 2 / Notas |
|----|------|-------------|-------|--------|----------------|
| P1-01 | **Checklist semanal in-app** (seg→sex, estado feito/pendente) | Guiado + SIPOC | 🤖 | ⬜ | Espelha `docs/SIPOC.md` tabela semanal |
| P1-02 | Badge giro baixo + atalho “criar insight” | Guiado + SIPOC | 🤖 | ⬜ | Onda2 #25–26 |
| P1-03 | Preview NF-e antes de confirmar upload | Guiado + Resiliente | 🤖 | ⬜ | Onda2 #18 |
| P1-04 | Preview CSV (linhas válidas/inválidas) | Guiado + Resiliente | 🤖 | ⬜ | Onda2 #54 |
| P1-05 | `docs/KPI_RULES.md` (regra giro baixo) | SIPOC + Guiado | 🤖 | ⬜ | Onda2 #52 |
| P1-06 | Métrica admin “% insights no prazo” | SIPOC | 🤖 | ⬜ | Novo — ver SIPOC métricas |
| P1-07 | Error boundary + Sentry no portal `/cliente` | Resiliente | 🤖 | ⬜ | Paridade com admin |
| P1-08 | Sentry em admin boundary + rotas API | Resiliente | 🤖 | ⬜ | Onda2 #89–94 |
| P1-09 | Toasts sucesso/erro forms admin | Guiado | 🤖 | ⬜ | Onda2 #16 |
| P1-10 | Playwright: login admin → central | Guiado + Resiliente | 🤖 | ⬜ | Onda2 #79 |
| P1-11 | Playwright: login portal → KPIs | Guiado + Resiliente | 🤖 | ⬜ | Onda2 #80 |
| P1-12 | Walkthrough 15 min cliente piloto | Guiado | 👤 | ⬜ | Onda2 #44 |
| P1-13 | Operador executa 1 ciclo seg→sex real | SIPOC | 👤 | ⬜ | Onda2 #32–35 |
| P1-14 | Gráfico receita 6 meses (portal) | Guiado | 🤖 | ⬜ | Onda2 #36 |
| P1-15 | Email stub “insight da semana” | Guiado + SIPOC | 🤖 | ⬜ | Onda2 #49 |

### Critério de saída P1

- [ ] Gate 4 ✅ (piloto pago)  
- [ ] 4 semanas de ciclo SIPOC executado com registro  
- [ ] E2E Playwright na CI  
- [ ] Cliente piloto não precisa abrir ML para ver resultado  

---

## P2 — Fase 5 (10+ clientes, escala)

| ID | Item | Premissa(s) | Owner | Status | Onda 2 / Notas |
|----|------|-------------|-------|--------|----------------|
| P2-01 | **RLS Supabase / Postgres** por tenant | Resiliente + Escalável | 🤖 | ⬜ | Onda2 #74 · EXECUTION_PLAN P1 |
| P2-02 | **BullMQ + Redis** (NF, email) | Escalável | 🤖 | ⬜ | Substituir `nf-process.stub.ts` |
| P2-03 | Decisão `services/api`: extrair ou remover legacy | Escalável | 👤 | ⬜ | Nest hoje esqueleto |
| P2-04 | Rate limit distribuído (Redis/KV) | Escalável + Resiliente | 🤖 | ⬜ | Login hoje in-memory |
| P2-05 | **IA rascunho insight** (human-in-the-loop) | AI-first | 🤖 | ⬜ | Alinhado ARCHITECTURE_STRATEGY |
| P2-06 | Match SKU XML ↔ catálogo (sugestão) | AI-first + SIPOC | 🤖 | ⬜ | Onda2 #57 |
| P2-07 | Cliente confirma leitura insight (feedback loop) | SIPOC | 🤖 | ⬜ | Novo |
| P2-08 | Mobile Expo KPIs | Escalável | 🤖 | ⬜ | Fase 5 EXECUTION_PLAN |
| P2-09 | API Nest em Render + Sentry `f5-api` | Escalável + Resiliente | 🤖 | ⬜ | P2 infra |
| P2-10 | Cache leitura dashboard (quando >20 tenants) | Escalável | 🤖 | ⬜ | Após métricas de carga |

### Critério de saída P2

- [ ] 10+ clientes ativos  
- [ ] NF > 50/dia sem degradar upload  
- [ ] RLS ativo  
- [ ] ≥1 feature AI no runtime com revisão humana obrigatória  

---

## Matriz premissa × backlog

| Premissa | P0 | P1 | P2 |
|----------|----|----|-----|
| **Escalável** | CI gates | E2E | BullMQ, RLS, API split, cache |
| **Guiado** | SIPOC doc | Checklist in-app, preview, toasts, gráfico | Mobile, email |
| **AI-first** | Alinhar pitch | — | Rascunho insight, match SKU |
| **Resiliente** | Zod, tenant test, health | Sentry cliente, Playwright | RLS, rate limit distribuído |
| **SIPOC** | SIPOC + backlog | SLA métricas, ciclo semanal | Feedback cliente |

---

## Ordem de execução recomendada (próximas 2 semanas)

```
Semana 1 (você + agente)
├── P0-03..05  Deploy + smoke prod          👤
├── P0-06      Zod nas APIs                 🤖
├── P0-07      Gate isolamento tenant       🤖
└── P1-03..04  Preview NF + CSV             🤖

Semana 2 (agente + operador)
├── P1-01      Checklist seg→sex in-app     🤖
├── P1-02      Giro baixo → insight          🤖
├── P1-10..11  Playwright CI                🤖
└── P1-13      1º ciclo SIPOC real          👤
```

---

## Rastreio de status (atualizar a cada sprint)

| Data | P0 fechados | P1 fechados | P2 fechados | Notas |
|------|-------------|-------------|-------------|-------|
| 25 Jun 2026 | 2/10 | 0/15 | 0/10 | SIPOC + backlog criados |
| | | | | |

---

## Referências cruzadas

| Documento | Relação |
|-----------|---------|
| `docs/SIPOC.md` | Mapa processo — **o quê** medir |
| `docs/AUTONOMOUS_BACKLOG.md` | 100 passos Onda 2 — **como** executar |
| `docs/EXECUTION_PLAN.md` | Fases e gates — **quando** |
| `docs/ARCHITECTURE_STRATEGY.md` | Decisões técnicas — **por quê** |
| `docs/OPERATING_MODEL.md` | Operação manual — **quem** |

---

**Próxima revisão**: após Gate 4 ou primeiro ciclo SIPOC completo com cliente piloto.
