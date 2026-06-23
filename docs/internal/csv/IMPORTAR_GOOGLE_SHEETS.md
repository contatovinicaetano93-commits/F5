# Importar CSVs no Google Sheets — F5

**Confidencial** — pasta `docs/internal/csv/`

---

## Passo 1 — Criar planilha no Drive

1. [Google Sheets](https://sheets.google.com) → **Planilha em branco**
2. Renomear: `F5 — Gestão Preços (INTERNO)`
3. Mover para a pasta do Drive F5

---

## Passo 2 — Importar cada CSV como aba

Para cada arquivo (`_CONFIG.csv`, `PET.csv`, `SAUDE.csv`, `PAPEL.csv`, `PARAFUSO.csv`):

1. **Arquivo → Importar → Upload** (ou arrastar o CSV)
2. **Importar dados**: *Inserir nova(s) planilha(s)*
3. **Separador**: Vírgula
4. Repetir para os 5 arquivos → 5 abas

Renomear abas:

| Arquivo | Nome da aba |
|---------|-------------|
| `_CONFIG.csv` | `_CONFIG` |
| `PET.csv` | `PET` |
| `SAUDE.csv` | `SAÚDE` |
| `PAPEL.csv` | `PAPEL` |
| `PARAFUSO.csv` | `PARAFUSO` |

---

## Passo 3 — Preencher `_CONFIG`

Na aba `_CONFIG`, coluna **B** (`valor_pct`), linhas 2–8:

| Linha | Parâmetro | Exemplo |
|-------|-----------|---------|
| 2 | comissao_cenario_1 | `0,05` (= 5%) |
| 3 | split_f5_cenario_2 | `0,40` (= 40%) |
| 4 | margem_min_cenario_3 | `0,15` |
| 5 | comissao_cenario_4_1p | `0,05` |
| 6 | comissao_marketplace | `0,14` |
| 7 | custo_logistico | `0,10` |
| 8 | custo_op_f5 | `0,08` |

Use **número decimal** (0,05) ou percentual conforme preferir — as fórmulas abaixo assumem decimal na célula.

---

## Passo 4 — Fórmulas nas abas de segmento

Abra a aba **PET** (repita nas outras copiando as fórmulas).

**Colunas** (linha 1 = cabeçalho, dados a partir da linha 2):

| Col | Campo |
|-----|-------|
| A | sku_ref |
| B | produto |
| C | categoria |
| D | custo_industria |
| E | preco_mercado_ref |
| F | preco_sugerido |
| G | preco_compra_1p |
| H | cenario |
| I | volume_mes_est |
| J | gmv_mes |
| K | receita_f5_mes |
| L | margem_industria |
| M | giro_ok |
| N | obs_interna |
| O | status |

### Célula J2 — `gmv_mes`

```
=SE(H2=4; G2*I2; F2*I2)
```

Cenário 4 usa `preco_compra_1p × volume`; demais usam `preco_sugerido × volume`.

### Célula K2 — `receita_f5_mes`

Cole na linha 2 (ajuste `;` se seu Sheets usar `,` como separador de argumentos — no Brasil costuma ser `;`):

```
=SE(H2=1; J2*(1-_CONFIG!$B$6-_CONFIG!$B$7)*_CONFIG!$B$2;
 SE(H2=2; J2*(1-_CONFIG!$B$6-_CONFIG!$B$7-_CONFIG!$B$8)*_CONFIG!$B$3;
 SE(H2=3; J2 - J2*_CONFIG!$B$6 - J2*_CONFIG!$B$7 - (D2*I2) - J2*_CONFIG!$B$8;
 SE(H2=4; (G2*I2)*_CONFIG!$B$5;
 0))))
```

### Célula L2 — `margem_industria`

```
=SE(H2=1; J2*(1-_CONFIG!$B$6-_CONFIG!$B$7)-K2-(D2*I2);
 SE(H2=2; J2*(1-_CONFIG!$B$6-_CONFIG!$B$7-_CONFIG!$B$8)*(1-_CONFIG!$B$3)-(D2*I2);
 SE(H2=3; 0;
 SE(H2=4; (G2*I2)-(D2*I2)-K2;
 0))))
```

### Arrastar fórmulas

Selecione **J2:L2** → arraste até a última linha de produtos.

---

## Passo 5 — Validação de dados (opcional)

**Coluna H (cenario)**: Dados → Validação → Lista: `1, 2, 3, 4`

**Coluna M (giro_ok)**: Lista: `S, N`

**Coluna O (status)**: Lista: `Pipeline, Call, Piloto, Ativo, Pausado`

---

## Passo 6 — Formatação rápida

- Congelar linha 1: **Ver → Congelar → 1 linha**
- Colunas D, F, G, J, K, L: formato **Moeda (R$)**
- Coluna E: texto livre (faixa de preço, ex. `24-28`)
- Cabeçalho: fundo `#0D1B2A`, texto branco

---

## Regras de uso

- **Não** compartilhar planilha com clientes
- **Não** colocar nomes de marcas/clientes na coluna `produto` se a planilha sair do círculo F5
- Na call: só o **cenário escolhido** e **resultado resumido** — não a planilha inteira

---

## Arquivos nesta pasta

```
docs/internal/csv/
├── _CONFIG.csv
├── PET.csv
├── SAUDE.csv
├── PAPEL.csv
├── PARAFUSO.csv
└── IMPORTAR_GOOGLE_SHEETS.md  ← este guia
```
