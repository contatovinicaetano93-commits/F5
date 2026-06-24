# Formato CSV — métricas marketplace

Arquivo usado em `/admin/lancamentos` → Importar CSV.

## Colunas obrigatórias

| Coluna | Exemplo | Descrição |
|--------|---------|-----------|
| `sku` | `PET-NP-001` | SKU no catálogo F5 |
| `period_start` | `2026-06-01` | Início do período (ISO) |
| `period_end` | `2026-06-07` | Fim do período |
| `revenue` | `1250.50` | Receita no período (R$) |
| `units_sold` | `42` | Unidades vendidas |
| `visits` | `1200` | Visitas ao anúncio |
| `conversion_rate` | `0.035` | Taxa 0–1 (3,5% = 0.035) |

## Colunas opcionais

| Coluna | Exemplo |
|--------|---------|
| `marketplace` | `amazon`, `mercado_livre`, `shopee` |
| `turnover` | `1.2` |

## Fixture de referência

`apps/web/public/fixtures/metrics-sample.csv`

## Erros comuns

- SKU não cadastrado no catálogo do tenant
- `conversion_rate` > 1 (use decimal, não percentual)
- Datas em formato `DD/MM/YYYY` (use ISO `YYYY-MM-DD`)
