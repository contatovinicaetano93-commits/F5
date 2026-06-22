# 🚀 F5 MVP — Plano Revisado
## Dashboard Operacional + Landing Page MKT

---

## 🎯 Visão Corrigida

**F5** = Plataforma que conecta dados de vendas em marketplaces com operação real

### Dois Contextos:

1. **Landing Page (Público/MKT)**
   - Apresentação do serviço
   - Call-to-action para demo
   - Informações sobre planos

2. **Dashboard (Usuário Logado)**
   - Acompanhamento de vendas
   - Custos operacionais
   - Estoque
   - Pagamentos a receber
   - Relatórios e analytics

### Fonte de Dados:
- Nota fiscal emitida (principal)
- APIs de marketplace (futuro)
- Upload manual (MVP)

---

## 📋 MVP Scope (6-8 semanas)

### Phase 1: Foundation (Week 1-2)

#### Landing Page
- [x] Design System pronto
- [ ] Hero section
- [ ] Seções de features
- [ ] Pricing
- [ ] CTA para login/demo
- [ ] Footer

#### Autenticação
- [x] Schemas (Zod)
- [ ] JWT + refresh tokens
- [ ] Password hashing
- [ ] Email verification (opcional)

#### Database
- [ ] PostgreSQL setup (local)
- [ ] Prisma schema
- [ ] Users table
- [ ] Clients table

### Phase 2: Dashboard Essencial (Week 3-4)

#### Backend APIs
- [ ] GET /dashboard (summary)
- [ ] GET /sales (vendas)
- [ ] GET /costs (custos)
- [ ] GET /inventory (estoque)
- [ ] GET /payments (pagamentos a receber)
- [ ] POST /nf-upload (importar nota fiscal)

#### Frontend Dashboard
- [ ] Layout base (navbar + sidebar)
- [ ] Summary cards (KPIs)
- [ ] Sales chart (gráfico vendas)
- [ ] Costs table
- [ ] Inventory list
- [ ] Payments list
- [ ] Export CSV

### Phase 3: Data Management (Week 5-6)

#### NF Upload
- [ ] PDF/XML parser
- [ ] Data extraction
- [ ] Database storage
- [ ] Validation

#### Marketplace Integration (Futuro)
- [ ] ML API conectado
- [ ] Auto-sync de dados
- [ ] Webhook handlers

### Phase 4: Polish & Deploy (Week 7-8)

#### QA
- [ ] E2E tests
- [ ] Performance
- [ ] Security audit
- [ ] Bug fixes

#### Deployment
- [ ] AWS setup
- [ ] CI/CD
- [ ] Monitoring
- [ ] Go-live

---

## 🏗️ Arquitetura Revisada

### Frontend - Estrutura de Rotas

```
apps/web/
├── src/app/
│   ├── page.tsx              # Landing page (público)
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── signup/
│   │   └── page.tsx          # Signup
│   ├── (dashboard)/          # Grupo protegido
│   │   ├── layout.tsx        # Dashboard layout
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Dashboard principal
│   │   ├── sales/
│   │   │   └── page.tsx      # Vendas
│   │   ├── costs/
│   │   │   └── page.tsx      # Custos
│   │   ├── inventory/
│   │   │   └── page.tsx      # Estoque
│   │   ├── payments/
│   │   │   └── page.tsx      # Pagamentos
│   │   └── reports/
│   │       └── page.tsx      # Relatórios
│   └── api/
│       └── auth/
│           └── route.ts      # API endpoints
```

### Backend - API Routes

```
services/api/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── auth.guard.ts
│   ├── users/
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── dashboard/
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   ├── sales/
│   │   ├── sales.controller.ts
│   │   ├── sales.service.ts
│   │   └── sales.module.ts
│   ├── costs/
│   │   ├── costs.controller.ts
│   │   └── costs.service.ts
│   ├── inventory/
│   │   ├── inventory.controller.ts
│   │   └── inventory.service.ts
│   ├── payments/
│   │   ├── payments.controller.ts
│   │   └── payments.service.ts
│   ├── nf-upload/
│   │   ├── nf-upload.controller.ts
│   │   ├── nf-parser.service.ts
│   │   └── nf-upload.service.ts
│   └── main.ts
```

### Database Schema

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  name VARCHAR,
  created_at TIMESTAMP
)

-- Clients (empresas/indústrias)
clients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  name VARCHAR,
  cnpj VARCHAR UNIQUE,
  created_at TIMESTAMP
)

-- Sales (Vendas)
sales (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients,
  nf_number VARCHAR,
  marketplace VARCHAR,
  quantity INT,
  total_value DECIMAL,
  date DATE,
  created_at TIMESTAMP
)

-- Costs (Custos)
costs (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients,
  category VARCHAR,
  amount DECIMAL,
  description VARCHAR,
  date DATE,
  created_at TIMESTAMP
)

-- Inventory (Estoque)
inventory (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients,
  sku VARCHAR,
  name VARCHAR,
  quantity INT,
  cost_unit DECIMAL,
  price_unit DECIMAL,
  last_updated TIMESTAMP
)

-- Payments (Pagamentos a Receber)
payments (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients,
  nf_number VARCHAR,
  due_date DATE,
  amount DECIMAL,
  status VARCHAR,
  marketplace VARCHAR,
  created_at TIMESTAMP
)

-- NF Files (Armazenar dados de NF)
nf_files (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients,
  nf_number VARCHAR,
  file_url VARCHAR,
  parsed_data JSONB,
  created_at TIMESTAMP
)
```

---

## 🎨 Landing Page - Seções

1. **Hero**
   - INDÚSTRIA NO DIGITAL
   - Tagline + CTA

2. **O Problema**
   - Desafios das indústrias

3. **Solução**
   - O que F5 resolve

4. **Features**
   - Dashboard
   - Vendas em tempo real
   - Custos
   - Estoque
   - Pagamentos

5. **Pricing**
   - White Label: R$ 500-2000/mês
   - Produto Conjunto: Split

6. **CTA Final**
   - Login / Demo

---

## 📊 Dashboard - Componentes Principais

### Header/Navigation
- Logo F5
- Menu
- User dropdown

### Sidebar
- Dashboard
- Vendas
- Custos
- Estoque
- Pagamentos
- Relatórios
- Settings

### Dashboard Home
```
┌─────────────────────────────────────────┐
│  KPI Cards                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Vendas   │ │ Custos   │ │ Estoque  ││
│  │ R$ 50k   │ │ R$ 8k    │ │ 1.250 un││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  Gráfico de Vendas (últimos 30 dias)   │
│                                         │
│  [Chart Area]                           │
├─────────────────────────────────────────┤
│  Últimos Pagamentos a Receber           │
│  ┌───────────────────────────────────┐ │
│  │ NF-001 | R$ 5.000 | 15/07/26 | ⏳ │ │
│  │ NF-002 | R$ 3.500 | 20/07/26 | ⏳ │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🎯 MVP Success Criteria

- ✅ Landing page funcional
- ✅ Login/Signup funcionando
- ✅ Dashboard mostrando vendas, custos, estoque, pagamentos
- ✅ Upload de NF (manual ou automático)
- ✅ Gráficos básicos
- ✅ 1 cliente piloto usando

---

## 📅 Timeline

| Week | Landing | Auth | Dashboard | NF Upload | Deploy |
|------|---------|------|-----------|-----------|--------|
| 1-2 | 🚀 | 🚀 | - | - | - |
| 3-4 | ✅ | ✅ | 🚀 | 🚀 | - |
| 5-6 | ✅ | ✅ | ✅ | ✅ | 🚀 |
| 7-8 | ✅ | ✅ | ✅ | ✅ | ✅ |

---

**Status**: 🚀 Pronto para começar a landing page  
**Foco**: Landing MKT + Dashboard operacional  
**Integração**: MVP com nota fiscal, marketplaces depois

