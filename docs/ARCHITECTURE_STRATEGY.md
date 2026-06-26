# F5 — Estratégia de Arquitetura
## Resiliente · Escalável · AI-First · Mínimas Integrações

**Versão**: 2.0  
**Data**: Junho 2026  
**Fundadores**: Vinicius Caetano + Raul

> Alinhado a `docs/OPERATING_MODEL.md`: o sistema é **consultoria digital + KPIs** para a indústria. Marketplace é operado **manualmente** pela equipe F5.

---

## Princípio Central

> **F5 não é SaaS de marketplace — é operação humana + software de controle.**

A arquitetura serve três objetivos:

1. **Dar controle e KPIs** à indústria (transparência, confiança)
2. **Apoiar operadores F5** no trabalho manual (insights, NF-e, lançamentos)
3. **Evitar dependência** de APIs externas de marketplace no MVP

---

## Visão Arquitetural (revisada)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE EXPERIÊNCIA                        │
│                                                                  │
│  App Cliente (indústria)     App Admin (operador F5)             │
│  • KPIs vendas               • Lançamento métricas               │
│  • Performance por produto   • Upload NF-e                       │
│  • Recebimentos D+15/D+60    • Insights / notas de giro          │
│  • Distribuição por canal    • Gestão clientes (tenants)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  API (NestJS + Fastify)                          │
│  Auth JWT │ RBAC │ Multi-tenant │ NF Parser │ Metrics Engine    │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│  PostgreSQL   │   │  BullMQ       │   │  S3               │
│  Tenants      │   │  (só NF,      │   │  XMLs NF-e        │
│  Products     │   │   email,      │   │  assets catálogo  │
│  Metrics      │   │   relatórios) │   │                   │
│  NotaFiscal   │   │               │   │                   │
│  Insights     │   │               │   │                   │
└───────────────┘   └───────────────┘   └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              FORA DO SISTEMA (operação manual F5)                │
│  Mercado Livre │ Amazon │ Shopee │ TikTok — UI nativa          │
│  + Cursor/IA para pesquisa e rascunhos (ferramenta do operador) │
└─────────────────────────────────────────────────────────────────┘
```

**Sem seta de API bidirecional para marketplaces no MVP.**

---

## Entradas de Dados (source of truth)

| Entidade | Como entra | Quem alimenta |
|----------|------------|---------------|
| Vendas / itens | Upload XML NF-e | Operador F5 ou indústria |
| Recebimentos | Calculado após NF (D+15, D+60) | Sistema |
| Tráfego, conversão, posição | Formulário admin ou CSV import | Operador F5 (dados do relatório ML/Amazon) |
| Produtos monitorados | Cadastro manual ou import catálogo | Operador F5 |
| Insights de giro | Texto estruturado no admin | Operador F5 |

---

## Domínio de Dados

```
Tenant (indústria)
  ├── Users (cliente_viewer, operador F5, admin)
  ├── Products (SKU interno — espelho do que está no marketplace)
  │     └── ProductMetrics (período, canal, vendas, tráfego, conversão, posição)
  ├── NotaFiscal → SalesItem
  ├── DashboardMetrics (agregação mensal)
  ├── PaymentSchedule (D+15, D+60)
  └── InsightNotes (observações operador → resumo cliente)
```

---

## AI-First (uso interno)

IA **não substitui** o operador nem integra com marketplace. IA **acelera** o trabalho manual:

| Uso | Input | Output | Onde roda |
|-----|-------|--------|-----------|
| Pesquisa concorrência | Keyword + URL ML/Amazon | Tabela comparativa | Ferramenta operador (Cursor) |
| Rascunho de anúncio | SKU + specs | Título, bullets, descrição | Operador copia para ML/Amazon |
| Análise de giro | Métricas do período | Sugestão de ação | Nota no admin |
| Parse catálogo site | URL cliente | Lista SKUs inicial | Onboarding único |

---

## Pilares de Resiliência

> Processo formal: `docs/SIPOC.md` · Gaps priorizados: `docs/PREMISES_BACKLOG.md`

### 1. Multi-tenant
Cada indústria isolada por `tenant_id` + RLS.

### 2. Sem dependência de API externa
Sistema funciona se Mercado Livre cair — porque não depende dele em runtime.

### 3. Idempotência em NF-e
Mesmo XML não processa duas vezes.

### 4. Observabilidade
Sentry em API e workers de NF/email.

---

## O que NÃO construir agora

- `InventorySyncService` / `OrdersSyncService` com cron 5 min
- OAuth marketplace credentials
- Webhook handlers ML/Amazon
- Publicação automática de anúncios
- Circuit breaker por marketplace (não há integração)

*Referência histórica: `docs/legacy/SYNC_FLOWS.md` descreve visão antiga — não é o MVP atual.*

---

## Roadmap técnico alinhado ao modelo

| Prioridade | Item | Motivo |
|------------|------|--------|
| P0 | Dashboard KPIs cliente (NF + métricas) | Consultoria digital |
| P0 | Admin: lançamento manual de performance | Operador alimenta giro |
| P0 | Multi-tenant | Vários clientes (Nutripássaros, Medway…) |
| P1 | Import CSV relatório marketplace | Reduz digitação manual |
| P1 | Insights / notas por produto | Valor consultivo visível |
| P2 | App mobile cliente | Indústria vê KPIs no celular |
| P3 | API ML/Amazon | Só se volume justificar — não é MVP |

---

## Stack (inalterada, uso revisado)

| Camada | Tech | Uso real |
|--------|------|----------|
| Web | Next.js 14 | Dashboard cliente + admin |
| Mobile | Expo 51 | KPIs para indústria |
| API | NestJS + Fastify | NF parser, métricas, tenants |
| DB | PostgreSQL + Prisma | Source of truth |
| Queue | BullMQ | NF processing, emails — **não** sync marketplace |
| Storage | S3 | XMLs, imagens catálogo |
| IA | Cursor agents | Ferramenta operador, fora do runtime crítico |

---

**Princípio final**: O software prova valor para a indústria. O giro vem do trabalho manual inteligente da F5.
