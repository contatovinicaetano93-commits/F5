# F5 — Regras de KPI (giro e performance)

**Versão**: 1.0 · Junho 2026  
**Fonte**: `docs/OPERATING_MODEL.md` · `docs/SIPOC.md`

---

## Giro baixo (alerta operador)

| Regra | Valor | Onde aparece |
|-------|-------|--------------|
| Conversão abaixo do limiar | `< 4%` (`conversionRate < 0.04`) | Admin central (`lowGiroCount`) |
| Período | Lançamentos da semana corrente | `ProductMetric.periodStart` |

**Ação SIPOC (segunda):** revisar SKUs em giro baixo → otimizar anúncio (manual ML/Amazon) → registrar insight se relevante para o cliente.

---

## Tendência no portal cliente

| Taxa conversão | Badge |
|----------------|-------|
| ≥ 5% | Em alta |
| > 0% e < 4% | Atenção |
| Demais | Estável |

---

## Insights no prazo (SIPOC sexta)

| Métrica | Cálculo |
|---------|---------|
| `% insights no prazo` | Insights publicados (`visibleToClient`) nos últimos 7 dias ÷ tenants ativos × 100 |
| Meta | ≥ 75% (admin central) |

---

## Recebimentos automáticos pós-NF

| Marketplace | Prazo |
|-------------|-------|
| Mercado Livre / Shopee | D+15 |
| Amazon | D+60 |
| Outros | D+30 (default) |

---

## Idempotência NF-e

Mesmo `nfNumber + nfSeries + emitente` **não processa duas vezes**.

---

**Referências:** `docs/ARCHITECTURE_STRATEGY.md` · `apps/web/src/lib/internal/data.ts` (overview, pilot readiness)
