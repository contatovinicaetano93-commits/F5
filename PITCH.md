# 🚀 F5 — Pitch do Projeto

## Visão Executiva

**F5** é uma plataforma completa, moderna e escalável desenvolvida do zero em 2026 com a mais recente stack de tecnologia.

Um projeto **totalmente independente** de imobi (fintech) e amet, com sua própria estrutura, repositório Git e estratégia de deployment.

---

## 💡 O Que é F5?

F5 é uma plataforma **web + mobile + api** que será expandida conforme as necessidades comerciais evoluem.

Diferente de imobi (que é fintech), F5 é construída para ser **flexível e extensível** em qualquer domínio.

### Características Principais

✅ **Stack Moderno**
- Frontend: Next.js 14 (React 18) com SSR/Streaming
- Mobile: Expo 51 + React Native (iOS/Android)
- Backend: NestJS + Fastify (ultra-rápido)
- Database: PostgreSQL + Redis
- Monorepo: Turborepo + pnpm

✅ **Independência Total**
- Repositório Git separado
- Pacotes internos (@f5/schemas, @f5/core, @f5/ui)
- Zero dependências de outros projetos
- Deployment autônomo

✅ **Pronto para Produção**
- TypeScript em 100% do código
- Type-safe schemas (Zod)
- CI/CD ready
- Monitoring & logging structure
- Error handling patterns

✅ **Escalabilidade**
- Job queues (BullMQ)
- Caching strategy (Redis)
- API rate limiting
- WebSocket support (Fastify)

---

## 📊 Estrutura do Projeto

```
f5/
├── apps/
│   ├── web/          ← Next.js frontend
│   └── mobile/       ← Expo + React Native
├── services/
│   └── api/          ← NestJS + Fastify backend
├── packages/
│   ├── schemas/      ← Zod validation (F5 only)
│   ├── core/         ← Utils & hooks (F5 only)
│   ├── ui/           ← UI components (F5 only)
│   └── config/       ← Shared configs
└── turbo.json        ← Monorepo orchestration
```

**Cada camada é independente mas orquestrada pelo Turborepo.**

---

## 🎯 Roadmap

### Phase 1: Foundation (Atual - 2026-06-22)
- [x] Estrutura monorepo criada
- [x] Pacotes base configurados
- [ ] Setup inicial de cada app
- [ ] First E2E test

### Phase 2: MVP (2026-06-29)
- [ ] Web app com autenticação
- [ ] Mobile app com login
- [ ] API endpoints básicos
- [ ] Database schema definido

### Phase 3: Features (2026-07-13)
- [ ] Business logic implementation
- [ ] Advanced UI components
- [ ] Performance optimization
- [ ] Load testing

### Phase 4: Production (2026-07-27)
- [ ] AWS deployment setup
- [ ] Monitoring & alerting
- [ ] Security audit
- [ ] Go-live

---

## 💰 Benefícios da Arquitetura

| Benefício | Detalhe |
|-----------|---------|
| **Velocidade** | Turborepo parallel builds, caching, hot reload |
| **Segurança** | TypeScript strict mode, input validation, rate limiting |
| **Escalabilidade** | Microservices-ready, job queues, Redis caching |
| **Manutenibilidade** | Monorepo simplifica sincronização de tipos |
| **Independência** | Sem acoplamento com imobi/amet, deploy autônomo |
| **DX (Developer Experience)** | TypeScript everywhere, modern tooling, fast feedback loop |

---

## 🔐 Princípios Fundacionais

1. **Independência Absoluta**
   - Sem imports de `@imobi/*` ou `@amet/*`
   - Git repository completamente separado
   - Deployment pipeline próprio

2. **Type Safety**
   - TypeScript strict mode
   - Zod schemas como source of truth
   - Runtime validation em todas as boundaries

3. **Performance First**
   - Next.js App Router (streaming, suspense)
   - Redis caching strategy
   - Fastify para low-latency APIs

4. **Developer Experience**
   - Monorepo com Turborepo
   - pnpm workspaces
   - Shared configs, independent features
   - Clear error messages & logging

---

## 🚀 Como Começar

### Setup Local

```bash
# Clonar repositório
git clone <f5-repo-url> f5
cd f5

# Instalar dependencies
pnpm install

# Rodar tudo em paralelo
pnpm dev

# Build para produção
pnpm build
```

### Desenvolvimento

Cada workspace rodando independentemente:

```bash
# Em outro terminal
cd apps/web && pnpm dev
cd services/api && pnpm dev
cd apps/mobile && pnpm dev
```

---

## 📈 Success Metrics

Ao lançar F5, esperamos:

- ✅ **Performance**: Lighthouse score > 90
- ✅ **Reliability**: 99.5% uptime
- ✅ **Load**: Handle 1000+ concurrent users
- ✅ **Development**: New feature em < 1 sprint
- ✅ **Maintainability**: Zero cross-project dependencies

---

## 🎓 Lições Aprendidas (imobi → f5)

### Do que imobi faz bem
✅ Schemas Zod como source of truth
✅ Monorepo Turborepo para sync de tipos
✅ API rate limiting desde o início
✅ Job queues (BullMQ) para tasks assíncronas

### Melhorias para F5
✅ Completamente independente (zero coupling)
✅ Modular desde o início (cada feature isolado)
✅ Testing strategy desde day 1
✅ Monitoring & observability built-in

---

## ⚙️ Tecnologias

### Frontend
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS (styling)
- Zod (validation)
- React Hook Form

### Mobile
- Expo 51
- React Native
- TypeScript
- Expo Router

### Backend
- NestJS 10
- Fastify (framework)
- PostgreSQL 14+
- Prisma ORM
- Redis (caching/queues)
- BullMQ (job queues)

### DevOps
- Docker (containerization)
- AWS (EC2, RDS, S3)
- GitHub Actions (CI/CD)
- Vercel (web hosting)
- EAS Build (mobile)

---

## 📞 Contato & Suporte

- **Repository**: https://github.com/contatovinicaetano93-commits/f5
- **Docs**: Vide CLAUDE.md e README.md
- **Issues**: GitHub Issues com `[F5]` prefix

---

**Status**: 🚀 Ready for development  
**Created**: 2026-06-22  
**Next**: Phase 1 setup + First features

---

*F5 — Built for the future, independent by design.*
