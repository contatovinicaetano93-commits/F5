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

## 💼 Modelos de Negócio

### 1️⃣ MARCA DO PARCEIRO (White Label)
- F5 opera marketplaces com marca do cliente
- Cliente recebe 95% das vendas
- F5 recebe 5% do GMV

### 2️⃣ PRODUTO CONJUNTO (Co-Creation)
- F5 + Cliente co-criam nova marca
- Split de receita customizado (40-60%)
- Crescimento agressivo

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
5. **Operação 360** — Tecnologia é enabler, não o core business

## 📚 Documentação

- `PITCH_V2.md` — Pitch executivo com modelo de negócio
- `BUSINESS_MODEL.md` — Detalhes de modelos e finanças
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
