# F5 — Modelo Operacional
## Como realmente trabalhamos com a indústria

**Versão**: 3.0 (fonte: conversa Raul + Vinicius, 22–23/jun/2026)  
**Data**: Junho 2026

> Alinhamento confirmado por Raul no WhatsApp. Para cada cliente, a F5 escolhe **o melhor dos 4 cenários** — não é one-size-fits-all.

---

## Essência do F5

**F5 é o contador digital da indústria no marketplace.**

Assim como o contador da fábrica organiza números, presta contas e dá visibilidade financeira — **sem operar a fábrica** — a F5:

1. **Presta contas** à indústria sobre o que acontece no digital
2. **Entrega controle** via plataforma (KPIs, vendas, recebimentos, performance por produto)
3. **Opera manualmente** tudo que acontece nos marketplaces (anúncios, preço, estoque, insights)
4. **Observa e recomenda** ações para melhorar o **giro** do produto

A indústria **não precisa** saber operar Mercado Livre, Amazon ou Shopee. Ela precisa **ver resultado e confiar nos números**.

---

## Divisão clara: Sistema vs Operação

```
┌─────────────────────────────────────────────────────────────────┐
│                    O QUE O SISTEMA FAZ                           │
│         (software — valor para a indústria)                      │
│                                                                  │
│  • Dashboard de KPIs do digital                                  │
│  • Controle financeiro (NF-e, recebimentos D+15 / D+60)          │
│  • Performance por produto e por canal                           │
│  • Histórico e comparativos (mês a mês)                          │
│  • Transparência: a indústria vê, não opera                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 O QUE A OPERAÇÃO F5 FAZ (MANUAL)                 │
│         (pessoas + processo — core business)                       │
│                                                                  │
│  • Criar e otimizar anúncios nos marketplaces                    │
│  • Ajustar preço, título, fotos, descrição                       │
│  • Monitorar concorrência e primeira página                      │
│  • Analisar insights de giro (o que vende, o que trava)          │
│  • Implementar melhorias com base em observação                  │
│  • Coordenar logística e atendimento                             │
│  • Registrar/atualizar dados na plataforma para o cliente ver    │
└─────────────────────────────────────────────────────────────────┘
```

**Regra de ouro**: se a indústria precisa abrir o painel do Mercado Livre, o sistema falhou em dar controle — mas **não** significa que ela opera; significa que a F5 ainda não consolidou a visão na plataforma.

---

## Princípio técnico: mínimas integrações externas

### O que NÃO é prioridade

- OAuth com APIs de Mercado Livre, Amazon, Shopee, TikTok
- Sync bidirecional de estoque/pedidos a cada 5–15 min
- Publicação automática de anúncios via API
- Dependência de webhook de marketplace para o sistema funcionar

### O que É o sistema (entradas de dados)

| Fonte | Como entra | O que alimenta |
|-------|------------|----------------|
| **NF-e (XML)** | Upload pelo operador F5 ou indústria | Vendas, itens, financeiro, recebimentos |
| **Lançamento manual** | Operador F5 registra no admin | KPIs de performance (visitas, conversão, posição) |
| **Planilha / CSV** | Import periódico dos relatórios do marketplace | Métricas que o ML/Amazon exportam |
| **Catálogo interno** | Cadastro manual ou scrape pontual do site do cliente | Lista de produtos e SKUs monitorados |

### IA no modelo correto

IA é **ferramenta interna do operador F5**, não automação exposta ao cliente:

- Pesquisa de concorrência (primeira página ML/Amazon)
- Rascunho de título e descrição (humano publica manualmente)
- Análise de gaps de catálogo
- Sugestões de preço e giro

**O operador decide. A indústria vê o resultado nos KPIs.**

---

## KPIs que a indústria vê (plataforma cliente)

### Financeiro (contador digital)

| KPI | Fonte |
|-----|-------|
| Vendas do mês | NF-e + lançamentos |
| Variação vs mês anterior | Cálculo automático |
| Pagamentos a receber | PaymentSchedule (D+15 ML, D+60 Amazon) |
| Distribuição por canal | % ML / Amazon / Shopee / outros |

### Performance digital (por produto)

| KPI | Fonte |
|-----|-------|
| Receita por SKU | NF-e / lançamento |
| Unidades vendidas | NF-e / lançamento |
| Tráfego / impressões | Lançamento manual (relatório marketplace) |
| Taxa de conversão | Calculada (vendas ÷ tráfego) |
| Posição na busca | Lançamento manual (observação operador) |
| Giro | Unidades ÷ período (tendência) |

### O que a indústria NÃO vê

- Painel técnico de filas, APIs, sync logs
- Ferramentas internas de pesquisa de concorrência
- Rascunhos de anúncio antes de publicar

---

## Fluxo operacional semanal (F5 interno)

```
Segunda   → Operador revisa KPIs de todos os clientes no admin
          → Identifica produtos com giro baixo ou queda de conversão

Terça–Qua → Trabalho manual nos marketplaces (preço, título, ads)
          → Pesquisa concorrência com IA (sem API)
          → Implementa melhorias nos anúncios

Quinta    → Atualiza métricas de performance na plataforma (manual/CSV)
          → Processa NF-e recebidas

Sexta     → Insight semanal registrado (nota interna → resumo para cliente)
          → Cliente vê dashboard atualizado
```

---

## As 4 formas de operar (definição Raul)

> *"Tudo que temos caminhamos para as possibilidades. Para cada cliente a gente vai ver QUAL O MELHOR dos CENÁRIOS."* — Raul, 22/jun/2026

| # | Cenário | O que é | Receita F5 | Risco / capital F5 |
|---|---------|---------|------------|-------------------|
| **1** | **Braço do online** | F5 opera a **conta do cliente no Mercado Livre** (e canais 3P). Indústria fabrica; F5 vende online em nome dele. | **Comissão** sobre vendas | Baixo — sem estoque F5 |
| **2** | **Distribuidor / Sócio** | F5 vira **sócio** em operação **100% focada no online** com o cliente. Nova estrutura, split de resultado. | **Split** da operação digital | Médio — compromisso de longo prazo |
| **3** | **Comprar e revender** | F5 **compra** do fabricante, **estoca** e **vende** (marca própria ou revenda). | **Margem** compra → venda | Alto — capital de giro + estoque |
| **4** | **Amazon 1P** | F5 **cadastra a empresa do cliente** para a **Amazon comprar direto** (venda direta 1P). F5 ganha **comissão** na intermediação/cadastro/operação. | **Comissão** | Baixo — Amazon compra do cliente |

### Quando usar cada cenário

| Cenário | Indícios de fit | Exemplo no portfólio |
|---------|-----------------|---------------------|
| **1 — Braço online** | Cliente sem operação ML madura; quer marca dele no digital | Medway, Sirius (a validar) |
| **2 — Sócio digital** | Cliente quer crescer online mas aceita nova sociedade/estrutura | Distribuidor pet (Mateus), Extrutécnica |
| **3 — Comprar e revender** | Volume, margem na revenda, importação viável | Tapetes pet (China, 30k/mês) |
| **4 — Amazon 1P** | Produto com fit Amazon Vendor; escala industrial | **PET** — *"cabe 1P tranquilamente"* (Raul) |

### O que NÃO é cenário separado

- **Plataforma / KPIs / contador digital** — existe em **todos** os cenários; é o que a indústria vê.
- **Operação manual** (anúncio, preço, insight de giro) — trabalho F5 em **todos** os cenários.

---

## Segmentos ativos (organização Raul)

| Segmento | Cliente(s) | Catálogo | Tabela de preço | Drive |
|----------|------------|----------|-----------------|-------|
| **PET** | Nutripássaros, Extrutécnica, tapetes | ✅ / 🔄 | A montar | [Drive F5](https://drive.google.com/drive/folders/1OtIFt1GdenuExvwGvYMnw9SXJMVl5Cfu?usp=sharing) |
| **PAPEL** | Sirius | ✅ | A montar | Drive |
| **SAÚDE** | Medway | ✅ | A montar | Drive |
| **PARAFUSO** | A entregar | — | — | Drive |

**Próximo passo comercial**: tabela de preço por potencial → *"para começar a fazer conta"* (Raul).

---

## Mapeamento cliente → melhor cenário (proposta)

| Cliente | Cenário sugerido | Por quê |
|---------|------------------|---------|
| **Nutripássaros** | **4 — Amazon 1P** e/ou **1 — Braço ML** | PET = 1P natural; já tem presença ML — braço online só se consolidar conta |
| **Extrutécnica / Colosso** | **4 — Amazon 1P** ou **2 — Sócio** | Mercado virgem; escala industrial pet |
| **Medway (Saúde)** | **1 — Braço online** ou **4 — 1P** | EPI B2B; validar fit 1P com catálogo |
| **Sirius (Papel)** | **1 — Braço online** | A definir com tabela de preço |
| **Tapetes pet** | **3 — Comprar e revender** | Importação, estoque F5, revenda |
| **Distribuidor (Mateus)** | **2 — Sócio digital** | Já distribui offline; nova operação 100% online |
| **Parafuso (Ferramenta)** | **A definir** | Raul: *"não sei se cabe 1P amazon, ainda não vi nada"* |

> Regra: **entender o caminho** do cliente antes de fechar cenário (Raul).

---

## O que muda na arquitetura (vs documento anterior)

| Antes (errado) | Agora (correto) |
|----------------|-----------------|
| Sync API ML/Amazon a cada 5 min | Lançamento manual + NF-e + CSV |
| Publicação automática de listings | Operador publica no marketplace; sistema registra resultado |
| Cliente vê catálogo técnico sync | Cliente vê KPIs e performance |
| IA publica sozinha | IA apoia operador; humano executa |
| 4+ integrações OAuth obrigatórias | Zero integrações OAuth no MVP |

---

## MVP do sistema (escopo real)

### Cliente (indústria) — mobile/web simples

1. **Início** — vendas do mês, variação, recebimentos pendentes
2. **Produtos** — performance por SKU (receita, unidades, conversão, giro)
3. **Financeiro** — NF-e processadas, calendário D+15 / D+60
4. **Perfil** — dados da empresa, contato F5

### Admin (operador F5)

1. **Clientes** — lista de tenants / indústrias
2. **Lançamentos** — registrar métricas de marketplace manualmente
3. **NF-e** — upload e processamento XML
4. **Insights** — notas de observação por produto (vira recomendação ao cliente)
5. **Catálogo interno** — SKUs monitorados (sem sync API)

### Integrações necessárias (mínimas)

| Integração | Obrigatória? | Motivo |
|------------|--------------|--------|
| NF-e parser (SEFAZ XML) | ✅ Sim | Contador digital — já implementado |
| Email / Slack notificação | Opcional | Alertas internos F5 |
| API Mercado Livre | ❌ Não no MVP | Operação manual |
| API Amazon | ❌ Não no MVP | Operação manual |
| API Shopee / TikTok | ❌ Não no MVP | Operação manual |
| Scrape pontual (IA) | Ferramenta interna | Pesquisa concorrência, não produção |

---

## Frase para o pitch

> **A indústria fabrica. A F5 opera o digital e presta contas.**  
> Você vê vendas, performance e recebimentos na palma da mão.  
> Nós fazemos o resto — com pessoas, experiência e inteligência — sem te obrigar a aprender marketplace.

---

**Próximo passo**: Tabelas de preço no Drive → simulação de margem por cenário → **receita no bolso no próximo mês** (meta Raul).
