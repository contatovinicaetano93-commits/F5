# F5 — UI/UX: Simplicidade e Objetividade

**Versão**: 2.0  
**Data**: Junho 2026

> Alinhado a `docs/OPERATING_MODEL.md`: a indústria vê **controle e KPIs**, não opera marketplace.

---

## Filosofia

> **A indústria quer ver números e confiar. Não quer aprender software de marketplace.**

A interface do **cliente** é um **extrato digital** — como o app do banco ou o relatório do contador. Simples, objetivo, um número grande por tela.

A interface do **admin F5** é onde o operador lança métricas, sobe NF-e e registra insights de giro.

---

## Regras de Ouro

### 1. Uma Tela, Uma Pergunta (cliente indústria)

| Tela | Pergunta |
|------|----------|
| Início | "Quanto vendi este mês e quanto vou receber?" |
| Produtos | "Qual produto está girando e qual travou?" |
| Financeiro | "Quais NF-e foram processadas e quando recebo?" |
| Perfil | "Quem é meu contato F5?" |

Nunca mostrar ao cliente: sync status, filas, APIs, painel de marketplace.

### 2. Hierarquia Visual Rígida

```
1. Número grande (KPI principal)     → 48px Extra Bold
2. Contexto (variação, período)      → 14px Gray
3. Ação primária (CTA)               → Botão Blue, full-width mobile
4. Detalhes (expandir se necessário) → Accordion ou segunda tela
```

**Exemplo — Dashboard do cliente Nutripássaros:**

```
┌─────────────────────────────────┐
│  Vendas este mês                │
│  R$ 47.320          ▲ 23%      │  ← número grande
│  vs. mês anterior               │  ← contexto
│                                 │
│  ┌─────────────────────────┐   │
│  │  Ver catálogo →         │   │  ← CTA
│  └─────────────────────────┘   │
│                                 │
│  Mercado Livre ████████ 62%    │  ← detalhe colapsável
│  Amazon        ████ 28%        │
│  Shopee        ██ 10%          │
└─────────────────────────────────┘
```

### 3. Empty States com Direção

Nunca mostrar tela vazia sem orientação:

| Estado | Mensagem | Ação |
|--------|----------|------|
| Sem produtos | "Nenhum produto publicado ainda" | "Publicar primeiro produto →" |
| Sem vendas | "Aguardando primeira venda" | "Ver status dos anúncios →" |
| Sem NF | "Envie sua primeira nota fiscal" | "Upload NF →" |

Padrão validado no IMOBI: *"Nenhuma obra cadastrada — Solicite crédito e registre sua primeira obra"*.

### 4. Mobile-First, Desktop-Enhanced

70% dos clientes industriais acessam pelo celular. Layout:

- **Mobile**: 1 coluna, bottom nav (4 tabs max), CTAs full-width
- **Desktop**: sidebar + content area, mesmos 4 tabs

Bottom nav padrão F5 (cliente indústria):

```
[ Início ]  [ Produtos ]  [ Financeiro ]  [ Perfil ]
```

### 5. Feedback Imediato

| Ação | Feedback |
|------|----------|
| Upload NF | Progress bar → "NF processada ✓" |
| Sync catálogo | Spinner → "12 produtos sincronizados" |
| Erro | Toast vermelho + "Tentar novamente" |
| Sucesso | Toast verde, auto-dismiss 3s |

### 6. Linguagem do Cliente, Não do Sistema

| ❌ Evitar | ✅ Usar |
|-----------|---------|
| "SKU sync failed" | "Não conseguimos atualizar o produto X" |
| "GMV" | "Vendas totais" |
| "Fulfillment" | "Envio" |
| "Tenant" | (nunca mostrar ao cliente) |
| "Marketplace 3P" | "Mercado Livre" |

---

## Componentes Padrão

### Cards de Status

Usar para estados binários claros:

```
┌─────────────────────────────────┐
│  🟢 12 produtos ativos          │
│  Publicados em 2 marketplaces   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  🟡 3 produtos em revisão       │
│  Aguardando aprovação F5        │
└─────────────────────────────────┘
```

### Simulador / Configurador

Para decisões com variáveis (preço, prazo, volume):

- **Slider** para valores contínuos (preço alvo, volume mensal)
- **Resultado em card escuro** (Navy bg, texto branco) — padrão IMOBI crédito
- **CTA abaixo do resultado** — nunca acima

### Listas de Produto

Cada item mostra apenas:

```
[Foto] Nome do produto
       R$ XX,XX  ·  ML ✓  Amazon ✓  Shopee ✗
       ▲ 15% vendas este mês
```

Detalhes (descrição, specs, histórico) em tela separada.

### Formulários

- Máximo **5 campos por tela** (wizard se mais)
- Labels acima do input, nunca placeholder como label
- Asterisco (*) apenas em obrigatórios
- Botão "Continuar →" fixo no bottom (mobile)

Padrão IMOBI: "Cadastrar obra — Passo 1 de 2".

---

## Telas do Produto F5

### Para o Cliente (Indústria)

| # | Tela | Conteúdo |
|---|------|----------|
| 1 | **Início** | KPI vendas + distribuição marketplace + alertas |
| 2 | **Catálogo** | Lista de produtos com status por canal |
| 3 | **Pedidos** | Pedidos recentes, status envio, ações pendentes |
| 4 | **Perfil** | Dados empresa, contrato, suporte |

### Para o Operador F5 (Admin)

| # | Tela | Conteúdo |
|---|------|----------|
| 1 | **Clientes** | Tenants, status, último lançamento |
| 2 | **Lançar métricas** | Tráfego, conversão, posição por SKU/canal |
| 3 | **NF-e** | Upload XML, processamento |
| 4 | **Insights** | Notas de giro → resumo para cliente |

---

## Anti-Patterns (Nunca Fazer)

1. **Dashboard com 12 KPIs** — máximo 4, o resto em drill-down
2. **Menu hamburger com 15 itens** — máximo 4 tabs + overflow
3. **Modais sobre modais** — usar navegação linear
4. **Tabelas com 10+ colunas no mobile** — cards no mobile, tabela no desktop
5. **Onboarding com 8 passos** — máximo 3 passos para primeiro valor
6. **Gráficos decorativos** — só gráfico se muda decisão do cliente
7. **Termos técnicos na UI** — linguagem de dono de fábrica

---

## Fluxo de Onboarding (3 Passos)

```
Passo 1: "Conecte sua empresa"
  → CNPJ, segmento, site (opcional)
  → Tempo: 2 min

Passo 2: "Seus produtos"
  → Upload catálogo OU scrape automático do site
  → IA mostra preview dos primeiros 5 listings
  → Tempo: 5 min

Passo 3: "Escolha seus canais"
  → Toggle ML / Amazon / Shopee / TikTok
  → Estimativa de receita (baseada em benchmark do segmento)
  → CTA: "Publicar →"
  → Tempo: 2 min
```

**Time-to-value target**: < 10 minutos do cadastro ao primeiro listing gerado.

---

## Tokens (do Design System)

Usar exclusivamente tokens de `@f5/ui`:

| Token | Valor | Uso |
|-------|-------|-----|
| `navy` | #0D1B2A | Headers, cards de resultado |
| `blue` | #0066FF | CTAs, links, ícones ativos |
| `cyan` | #00D4FF | Highlights, badges |
| `off-white` | #F4F6F9 | Backgrounds |
| `gray` | #8B9CB6 | Texto secundário |
| `success` | #10B981 | Status positivo |
| `warning` | #F59E0B | Atenção |
| `error` | #EF4444 | Erro |

Spacing: múltiplos de 4px. Border-radius: 8px (cards), 12px (buttons).

---

## Checklist de Review UI

Antes de shippar qualquer tela:

- [ ] Responde uma pergunta clara?
- [ ] KPI principal visível sem scroll?
- [ ] CTA óbvio e acessível com polegar (mobile)?
- [ ] Empty state com direção?
- [ ] Linguagem sem jargão técnico?
- [ ] Máximo 4 elementos de navegação?
- [ ] Funciona em 375px de largura?
- [ ] Feedback para toda ação do usuário?
