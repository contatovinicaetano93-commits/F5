# F5 — Regras de KPI

## Giro de produto (turnover)

- **Giro alto**: > 0.5 unidades/dia (produto saudável)
- **Giro médio**: 0.2–0.5 unidades/dia (monitorar)
- **Giro baixo**: < 0.2 unidades/dia → badge laranja, acionar insight
- **Giro zero**: 0 unidades/mês → badge vermelho, prioridade máxima

Calculado como: `unitsSold / diasNoMes`

## Variação de vendas

- **Positiva**: mês atual > mês anterior → badge verde com `+X%`
- **Negativa**: mês atual < mês anterior → badge vermelho com `−X%`
- Mês base: mês anterior completo (não mês atual parcial)

## Custos operacionais (estimativa MVP)

| Marketplace | Comissão | Logística | Total estimado |
|-------------|----------|-----------|----------------|
| Mercado Livre | 12–15% | 2% | ~17% |
| Amazon | 8–15% | 3% | ~18% |
| Shopee | 10–14% | 2% | ~16% |

*Será refinado com dados reais por segmento*

## Repasses (PaymentSchedule)

- **D+15**: Mercado Livre (após data NF)
- **D+60**: Amazon (após data NF)
- **D+30**: Shopee e outros (estimativa)

## Insights no prazo

- Meta: 1 insight publicado por semana por tenant ativo
- "No prazo" = publicado até sexta-feira da semana de referência
- KPI: `insightsOnTime / totalInsightsExpected × 100%`
