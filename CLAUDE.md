# F5 — Guia do Projeto

## 🎯 O que é F5?

**F5** conecta indústrias brasileiras ao mercado digital através de:
- Consultoria estratégica + operação 360 em marketplaces
- Plataforma tech (web + mobile + api)
- Receebimento rápido (D+15 Mercado Livre, D+60 Amazon)

**Tagline**: INDÚSTRIA NO DIGITAL

## ⚠️ INDEPENDÊNCIA TOTAL

Este projeto é **completamente independente** de imobi e amet.

- ✅ Repositório Git separado
- ✅ Monorepo próprio (Turborepo + pnpm)
- ✅ Pacotes internos (@f5/*)
- ✅ Zero dependências de outros projetos
- ✅ Deployment independente

## 💼 Os 4 Cenários de Operação (Raul, jun/2026)

Para **cada cliente**, a F5 escolhe o **melhor cenário** — não aplicamos o mesmo modelo para todos.

| # | Cenário | Resumo | Receita F5 |
|---|---------|--------|------------|
| **1** | **Braço do online** | Operamos a conta ML (3P) do cliente; comissão | % comissão |
| **2** | **Distribuidor / Sócio** | Sociedade em operação 100% online | Split |
| **3** | **Comprar e revender** | Compramos, estocamos, vendemos | Margem |
| **4** | **Amazon 1P** | Cadastramos o cliente para Amazon comprar dele; comissão | % comissão |

**Plataforma F5** (KPIs + controle financeiro) acompanha **todos** os cenários.  
**Operação marketplace** = manual F5. **Integrações API** = mínimas.

Detalhes: `docs/OPERATING_MODEL.md`  
Drive gestão: https://drive.google.com/drive/folders/1OtIFt1GdenuExvwGvYMnw9SXJMVl5Cfu

## 🏪 Plataformas Operadas

- Amazon (1P - Venda Direta)
- Mercado Livre (3P - Intermediário)
- Shopee (3P/1P)
- TikTok Shop (3P)

## Stack Técnico

- **Web**: Next.js 14 (App Router) — `apps/web`
- **Mobile**: Expo 51 + Expo Router — `apps/mobile`
- **API**: NestJS + Fastify — `services/api`
- **DB**: PostgreSQL + Prisma ORM
- **Cache**: Redis + BullMQ
- **Storage**: AWS S3

## 🎨 Identidade Visual

- **Tagline**: INDÚSTRIA NO DIGITAL
- **Cores**: Navy #0D1B2A, Blue #0066FF, Cyan #00D4FF
- **Tipografia**: Inter (Extra Bold → Regular)
- **Personalidade**: Moderna, tecnológica (ref: Accenture, McKinsey)

## 📦 Pacotes Compartilhados (F5 only)

- `@f5/schemas` — Zod validation
- `@f5/core` — Utils, hooks, api-client
- `@f5/ui` — UI components + design tokens
- `@f5/config` — Shared configs

## Comandos Essenciais

```bash
pnpm install          # instala tudo
pnpm dev              # inicia web + api em paralelo
pnpm build            # build de produção
pnpm type-check       # TypeScript em todos os pacotes
pnpm test             # rodar testes
```

## Regras Críticas

1. **Nunca importar de imobi ou amet** — use apenas @f5/* ou node_modules
2. **Nunca compartilhar código** com outros projetos
3. **Git sempre separado** — commit/push apenas para f5 repo
4. **.env nunca commitado** — use .env.example
5. **Operação 360** — Tecnologia é enabler; operação marketplace é manual F5
6. **Mínimas integrações** — não depender de API de marketplace no MVP

## 👥 Portfólio de Clientes (Jun/2026)

| Segmento | Cliente | Catálogo | Cenário sugerido |
|----------|---------|----------|------------------|
| PET | Nutripássaros | ✅ | 4 — Amazon 1P (+ ML se fizer sentido) |
| PET | Extrutécnica / Colosso | ✅ | 4 — 1P ou 2 — Sócio |
| PET | Tapetes (import) | 🔄 | 3 — Comprar e revender |
| PAPEL | Sirius | ✅ | 1 — Braço online (a validar) |
| SAÚDE | Medway | ✅ | 1 — Braço online / 4 — 1P |
| PARAFUSO | — | — | A definir (1P incerto) |

**Prioridade P0**: Nutripássaros + Extrutécnica (catálogo e site prontos)  
**Grupo WhatsApp**: "F5 mkt place" (Vinicius Caetano)

## 📚 Documentação

- `PITCH_V3.md` — Pitch atualizado com portfólio e AI-first
- `PITCH_V2.md` — Pitch executivo com modelo de negócio
- `BUSINESS_MODEL.md` — Detalhes de modelos e finanças
- `docs/OPERATING_MODEL.md` — **Modelo operacional (contador + KPIs + manual)**
- `docs/ARCHITECTURE_STRATEGY.md` — Arquitetura alinhada ao modelo (mínimas integrações)
- `docs/UI_UX_PRINCIPLES.md` — Simplicidade e objetividade na interface
- `docs/APRESENTACAO_CLIENTE.md` — Roteiro call com indústria (sem sigilos)
- `pitch_comercial_f5.html` — **Pitch comercial (PDF)** — uso em calls com indústria
- `PITCH_COMERCIAL_F5.md` — Texto do pitch comercial
- `apresentacao_cliente.html` — Versão anterior do deck cliente
- `docs/internal/TABELA_PRECO_TEMPLATE.md` — **INTERNO** — planilha de preço e cenários
- `PRESENTATION_COMERCIAL.md` — Apresentação comercial
- `DESIGN_SYSTEM.md` — Identidade visual e componentes
- `SETUP_INSTRUCTIONS.md` — Instruções de setup

## Repositórios

| Projeto | Repo | Status |
|---------|------|--------|
| imobi | contatovinicaetano93-commits/imobi | ✅ Fintech |
| amet | contatovinicaetano93-commits/amet | 🚀 Em setup |
| f5 | contatovinicaetano93-commits/f5 | 🚀 Em setup |

---

**Princípio**: Cada projeto é autossuficiente e pode ser deployado, testado e mantido independentemente.

F5 é diferente: não é SaaS puro, é **operação + software**.
