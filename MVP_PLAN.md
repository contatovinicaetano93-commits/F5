# 🚀 F5 MVP — Plano de Desenvolvimento

## ⚡ Visão do MVP

**O que é:** Plataforma operacional completa para conectar indústrias a marketplaces  
**Quando:** 6-8 semanas (Jun-Jul 2026)  
**Quem:** 1 indústria piloto (White Label model)  
**Sucesso:** Primeira venda via F5 + Operação 100% funcional

---

## 📋 Escopo MVP

### Phase 1: Foundation (Week 1-2)

#### Backend Setup
- [x] Monorepo estruturado (Turborepo + pnpm)
- [ ] Database setup (PostgreSQL local)
- [ ] Environment variables
- [ ] NestJS base structure
- [ ] Authentication (JWT + refresh tokens)
- [ ] User management (admin, operator, cliente)

#### Frontend Setup
- [x] Next.js 14 App Router
- [ ] Autenticação integrada
- [ ] Design System aplicado
- [ ] Layout base (navbar, sidebar)

#### Mobile Setup
- [x] Expo 51 configured
- [ ] Basic navigation structure
- [ ] Login screen
- [ ] Design System mobile

### Phase 2: Core Features (Week 3-4)

#### Backend
- [ ] Marketplace integrations (ML API)
- [ ] Product catalog CRUD
- [ ] Order management
- [ ] Basic analytics
- [ ] Webhooks para marketplace events

#### Frontend
- [ ] Dashboard
- [ ] Product management
- [ ] Order tracking
- [ ] Reports/Analytics
- [ ] Settings

#### Mobile
- [ ] Mobile dashboard
- [ ] Order notifications
- [ ] Quick actions

### Phase 3: Integration (Week 5-6)

#### ML Integration
- [ ] Sincronização de produtos
- [ ] Sincronização de pedidos
- [ ] Status updates

#### Payment
- [ ] Webhook de recebimento (D+15)
- [ ] Reconciliação financeira
- [ ] Reports de performance

### Phase 4: Testing & Polish (Week 7-8)

#### QA
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security audit
- [ ] Bug fixes

#### Deployment
- [ ] AWS setup
- [ ] CI/CD pipeline
- [ ] Monitoring
- [ ] Go-live

---

## 🏗️ Arquitetura

### Backend (@f5/api - NestJS + Fastify)
```
services/api/
├── src/
│   ├── auth/              # JWT, login, refresh
│   ├── users/             # User management
│   ├── products/          # Catálogo de produtos
│   ├── orders/            # Gestão de pedidos
│   ├── marketplaces/      # Integração ML, Amazon
│   ├── analytics/         # Dados e relatórios
│   ├── webhooks/          # Events from marketplaces
│   └── main.ts
├── package.json
└── tsconfig.json
```

### Frontend (@f5/web - Next.js 14)
```
apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing
│   │   ├── login/            # Login
│   │   ├── dashboard/        # Dashboard
│   │   ├── products/         # Gestão produtos
│   │   ├── orders/           # Gestão pedidos
│   │   └── analytics/        # Reports
│   ├── components/
│   ├── hooks/
│   └── lib/
├── package.json
└── next.config.js
```

### Mobile (@f5/mobile - Expo)
```
apps/mobile/
├── src/
│   ├── app/                  # Expo Router
│   ├── components/
│   ├── screens/
│   └── lib/
├── package.json
└── app.json
```

### Shared Packages
```
packages/
├── schemas/                  # Zod validation
├── core/                     # Hooks, utils, API client
├── ui/                       # Components + design tokens
└── config/                   # Shared configs
```

---

## 🗄️ Database Schema (PostgreSQL)

### Tables
```sql
-- Users
users (id, email, password_hash, name, role, created_at)

-- Clients (indústrias)
clients (id, user_id, name, marketplace_stores)

-- Products
products (id, client_id, sku, name, price, estoque)

-- Orders
orders (id, client_id, marketplace_order_id, status, total)

-- Marketplace Integrations
marketplace_accounts (id, client_id, marketplace, account_id, token)

-- Webhooks Log
webhooks_log (id, marketplace, event_type, payload, created_at)
```

---

## 🔐 Security & Compliance

- [x] TypeScript strict mode
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] CORS configured
- [ ] Input validation (Zod)
- [ ] SQL injection prevention (Prisma)
- [ ] HTTPS only
- [ ] Env variables (no secrets in code)

---

## 📊 Métricas MVP

### Sucesso
- ✅ 1 cliente piloto em produção
- ✅ Integração ML 100% funcional
- ✅ Primeira venda via F5
- ✅ Dashboard operacional
- ✅ <500ms latência
- ✅ 99% uptime

### Performance
- Lighthouse Score: >90
- API response: <200ms p95
- Mobile: <3s load time
- Deploy: <5min

---

## 📅 Timeline

| Week | Backend | Frontend | Mobile | Status |
|------|---------|----------|--------|--------|
| 1-2 | Auth + DB | Setup + Design | Setup | 🚀 |
| 3-4 | APIs + ML | Dashboard | Mobile UI | 🚀 |
| 5-6 | Integration | Features | Integration | ⏳ |
| 7-8 | Testing | Testing | Testing | ⏳ |

---

## 🎯 Próximos Passos Imediatos

1. **Setup Local**
   ```bash
   cd /home/user/f5
   pnpm install
   ```

2. **Database**
   ```bash
   createdb f5_dev
   pnpm db:init
   ```

3. **Environment**
   ```bash
   cp .env.example .env.local
   # Configure: DB_URL, JWT_SECRET, ML_API_KEY
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

---

**Status**: 🚀 Pronto para começar  
**Criado**: 22 de Junho de 2026  
**Versão**: 1.0
