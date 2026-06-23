# F5 — Template de Tabela de Preço (USO INTERNO)

**Confidencial** — Vinicius + Raul apenas. Não compartilhar com clientes nem em apresentações.

**Drive**: pasta de gestão F5 (planilha por aba: PET · SAÚDE · PAPEL · PARAFUSO)

**CSVs prontos para importar**: `docs/internal/csv/` — ver `IMPORTAR_GOOGLE_SHEETS.md`

---

## Objetivo

Simular **qual cenário gera caixa** para a F5 e **margem aceitável** para o cliente — antes da call.  
Não expor esta planilha; na call, apresentar só o **modelo escolhido** e o **resultado esperado**.

---

## Aba: `_CONFIG` (uma vez)

| Parâmetro | Valor | Notas |
|-----------|-------|-------|
| Comissão cenário 1 (braço ML) | ___% | Preencher por negociação |
| Split F5 cenário 2 (sócio) | ___% | Acordo por operação |
| Margem mínima cenário 3 (revenda) | ___% | Após custo + logística + ML |
| Comissão cenário 4 (1P) | ___% | Sobre volume faturado |
| Comissão marketplace (média) | ___% | ML / Amazon — por categoria |
| Custo logístico (% GMV) | ___% | Estimativa |
| Custo operacional F5 (% GMV) | ___% | Interno — não revelar ao cliente |

---

## Colunas por produto (cada aba de segmento)

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `sku_ref` | Código interno (não nome do cliente) | PET-001 |
| `produto` | Descrição genérica do item | Ração extrusada 500g |
| `categoria` | PET / SAÚDE / PAPEL / PARAFUSO | PET |
| `custo_industria` | Preço que a indústria pratica (ou custo revenda C3) | R$ 12,00 |
| `preco_mercado_ref` | Faixa 1ª página ML/Amazon (pesquisa interna) | R$ 24–28 |
| `preco_sugerido` | Preço de venda alvo | R$ 26,00 |
| `cenario` | 1 / 2 / 3 / 4 | Dropdown |
| `volume_mes_est` | Unidades/mês estimadas | 5.000 |
| `gmv_mes` | `preco_sugerido × volume_mes_est` | fórmula |
| `receita_f5_mes` | Ver fórmulas abaixo | fórmula |
| `margem_industria` | O que sobra para o parceiro | fórmula |
| `giro_ok` | S/N — volume realista? | manual |
| `obs_interna` | Insight operacional (não vai pro cliente) | livre |
| `status` | Pipeline / Call / Piloto / Ativo | dropdown |

---

## Fórmulas de simulação (coluna `receita_f5_mes`)

Substituir `%` pelos valores da aba `_CONFIG`.

### Cenário 1 — Braço online (comissão)

```
gmv_liquido = gmv_mes × (1 - comissao_marketplace - custo_logistico)
receita_f5  = gmv_liquido × comissao_cenario_1
margem_industria = gmv_liquido - receita_f5 - (custo_industria × volume_mes_est)
```

### Cenário 2 — Sócio digital (split)

```
gmv_liquido = gmv_mes × (1 - comissao_marketplace - custo_logistico - custo_op_f5)
receita_f5  = gmv_liquido × split_f5_cenario_2
margem_industria = gmv_liquido × (1 - split_f5_cenario_2) - (custo_industria × volume_mes_est)
```

### Cenário 3 — Comprar e revender

```
custo_total = (custo_industria × volume_mes_est) + custo_import_log (se houver)
receita_bruta = gmv_mes
receita_f5 = gmv_mes - comissao_marketplace - custo_logistico - custo_total - custo_op_f5
margem_industria = 0  (indústria é fornecedor; margem dela está no custo_industria)
```

### Cenário 4 — Venda direta marketplace (1P)

```
gmv_1p = volume_mes_est × preco_compra_amazon  (preço que Amazon paga ao fabricante)
receita_f5 = gmv_1p × comissao_cenario_4
margem_industria = gmv_1p - (custo_industria × volume_mes_est) - receita_f5
```

---

## Matriz rápida: qual cenário testar primeiro

| Sinal na planilha | Testar cenário |
|-------------------|----------------|
| Indústria forte, sem ML organizado | 1 |
| Quer sociedade só digital | 2 |
| Margem na revenda / importação | 3 |
| Volume industrial, fit grande marketplace | 4 |
| Margem_industria < 0 em todos | Reprecificar ou descartar |

---

## O que NUNCA colocar na planilha compartilhada

- Nome de clientes ou marcas em operação
- Links de anúncios concorrentes
- Scripts de abordagem comercial
- Detalhes de cadastro 1P / contatos Amazon
- Percentuais finais negociados antes do contrato

---

## Checklist antes da call

- [ ] Tabela de preço preenchida para 3–5 SKUs âncora do segmento
- [ ] Cenário recomendado definido (1 coluna, decisão interna)
- [ ] Apenas **1 cenário** preparado para apresentar ao cliente
- [ ] PDF `apresentacao_cliente.html` — sem nomes, sem números internos
- [ ] Proposta comercial separada — só após alinhamento na call
