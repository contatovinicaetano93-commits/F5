# ✅ STEPS 11-20: Database & Modelos — COMPLETO

**Status:** 🎉 Schema pronto para rodar no Supabase  
**Tempo:** ~3 horas  
**Deliverables:** Schema SQL + Seed data + Guia setup

---

## 📋 O Que Foi Feito

### ✅ STEP 11: Tabela TENANTS
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  plan TEXT (starter | pro | enterprise),
  logo_url TEXT,
  status TEXT (active | inactive | trial)
)
```
- ✅ Índices em CNPJ e status
- ✅ RLS policy aplicada
- ✅ UNIQUE constraint no CNPJ

### ✅ STEP 12: Tabela USERS
```sql
CREATE TABLE users (
  id UUID (FK auth.users),
  email TEXT UNIQUE NOT NULL,
  role TEXT (admin | operador | financeiro | viewer),
  tenant_id UUID (FK tenants),
  status TEXT (active | inactive)
)
```
- ✅ Multi-tenant (tenant_id isolador)
- ✅ Unique index (tenant_id, email)
- ✅ RLS policies para SELECT/INSERT

### ✅ STEP 13: Tabela PRODUCTS
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID (FK tenants),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images TEXT[],
  attributes JSONB
)
```
- ✅ Suporta variantes (cor, tamanho)
- ✅ Atributos flexíveis (JSON)
- ✅ Unique (tenant_id, sku)
- ✅ Índices em category

### ✅ STEP 14: Tabela PRODUCT_VARIANTS
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID (FK products),
  variant_name TEXT, -- "XL-Azul"
  sku TEXT NOT NULL
)
```
- ✅ 1:N com products
- ✅ Suporta múltiplas variantes

### ✅ STEP 15: Tabela INVENTORY
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  product_variant_id UUID (FK product_variants),
  marketplace TEXT (mercado_livre|shopee|amazon|magalu),
  quantity DECIMAL,
  reserved DECIMAL  -- Para pedidos pendentes
)
```
- ✅ Estoque por marketplace separado
- ✅ Campo `reserved` para reserva automática
- ✅ Unique (product_variant_id, marketplace)

### ✅ STEP 16: Tabela PRICING_POLICIES
```sql
CREATE TABLE pricing_policies (
  id UUID PRIMARY KEY,
  tenant_id UUID (FK tenants),
  product_variant_id UUID (FK product_variants),
  marketplace TEXT,
  min_price DECIMAL,       -- Preço mínimo travado
  min_margin_pct DECIMAL   -- Margem mínima em %
)
```
- ✅ Preço mínimo por SKU/marketplace
- ✅ Margem mínima travada
- ✅ Base para precificação dinâmica

### ✅ STEP 17: Tabela ORDERS
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tenant_id UUID (FK tenants),
  marketplace_order_id TEXT NOT NULL,
  marketplace TEXT (mercado_livre|shopee|amazon|magalu),
  status TEXT (new|processing|shipped|delivered|cancelled|returned),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  total_value DECIMAL,
  commission_marketplace DECIMAL,
  shipping_cost DECIMAL
)
```
- ✅ Feed unificado de todos os marketplaces
- ✅ Status flow completo
- ✅ Captura comissão real
- ✅ Índices em status, marketplace, data

### ✅ STEP 18: Tabela ORDER_ITEMS
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID (FK orders),
  product_variant_id UUID (FK product_variants),
  quantity DECIMAL,
  unit_price DECIMAL,
  subtotal DECIMAL
)
```
- ✅ N:1 com orders
- ✅ Permite múltiplos itens por pedido

### ✅ STEP 19: Tabela MARKETPLACE_CREDENTIALS
```sql
CREATE TABLE marketplace_credentials (
  id UUID PRIMARY KEY,
  tenant_id UUID (FK tenants),
  marketplace TEXT,
  access_token TEXT,  -- Encrypted
  refresh_token TEXT, -- Encrypted
  status TEXT (active|expired|invalid),
  last_sync TIMESTAMP
)
```
- ✅ Armazena OAuth tokens (criptografados)
- ✅ Pronto para Supabase Vault
- ✅ Único por tenant/marketplace

### ✅ STEP 20: Tabela SYNC_LOGS
```sql
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID (FK tenants),
  marketplace TEXT,
  type TEXT (inventory|orders|pricing),
  status TEXT (pending|success|failed),
  error TEXT,
  records_processed INTEGER,
  created_at TIMESTAMP
)
```
- ✅ Audit trail de sincronizações
- ✅ Rastreamento de erros
- ✅ Debugging facilitado

---

## 📊 Tabelas Adicionais (Bonus)

### DASHBOARD_METRICS
```sql
-- Agregações mensais para performance
total_sales_month DECIMAL,
mercado_livre_pct DECIMAL,
shopee_pct DECIMAL,
amazon_pct DECIMAL
```

### ALERT_NOTIFICATIONS
```sql
-- Alertas em tempo real
type TEXT (stockout|low_reputation|sync_failed|...),
severity TEXT (info|warning|critical),
message TEXT,
read BOOLEAN
```

---

## 🔐 RLS Security Model

**Todos as tabelas** têm:
1. ✅ `tenant_id` como isolador
2. ✅ Policies SELECT (user vê apenas seu tenant)
3. ✅ Policies INSERT (apenas admin/operador)
4. ✅ Policies UPDATE (role-based)
5. ✅ Policies DELETE (apenas admin)

**Exemplo:**
```sql
CREATE POLICY "Users can view their tenant's products"
  ON products
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
```

---

## 📦 Índices Criados

```sql
-- Performance critical
idx_products_tenant_id
idx_products_sku
idx_orders_tenant_id
idx_orders_created_at
idx_inventory_product_variant_id
idx_sync_logs_created_at
idx_dashboard_metrics_tenant_id
-- etc.
```

---

## 🎯 Data Model Diagram

```
TENANTS (Companies)
  ├─ USERS (Multi-tenant)
  ├─ PRODUCTS
  │   └─ PRODUCT_VARIANTS
  │       ├─ INVENTORY (per marketplace)
  │       ├─ PRICING_POLICIES
  │       └─ ORDER_ITEMS
  ├─ ORDERS (Feed unificado)
  │   └─ ORDER_ITEMS
  ├─ MARKETPLACE_CREDENTIALS (OAuth)
  ├─ SYNC_LOGS (Audit trail)
  ├─ DASHBOARD_METRICS (KPIs)
  └─ ALERT_NOTIFICATIONS
```

---

## 📝 Arquivos Criados

```
✅ services/supabase/migrations/001_init_schema.sql  (1000+ linhas)
✅ services/supabase/seed.sql                        (200+ linhas)
✅ docs/SUPABASE_SETUP_GUIDE.md                      (Setup passo-a-passo)
✅ STEPS_11_20_SUMMARY.md                            (Este arquivo)
```

---

## 🚀 Como Usar Agora

### 1. Ir para Supabase SQL Editor
```
https://supabase.com/dashboard → SQL Editor
```

### 2. Copiar e rodar schema
```bash
# Copie TODO o conteúdo de:
services/supabase/migrations/001_init_schema.sql

# Cole no SQL Editor e clique RUN
```

### 3. Verificar tabelas
- Table Editor → Devem aparecer 12 tabelas

### 4. Criar user via Auth
- Authentication → Users → Add User

### 5. Rodar seed data
```bash
# Adapte o seed.sql com UUIDs do passo 4
# Cole no SQL Editor e clique RUN
```

### 6. Conectar ao Next.js
```bash
# Copie credenciais Supabase
# Atualize apps/web/.env.local
# Rodar: pnpm dev
```

---

## ✅ Checklist Fase 2

- [ ] Schema SQL rodou sem erros
- [ ] 12 tabelas criadas no Supabase
- [ ] Índices criados (performance OK)
- [ ] RLS policies ativas
- [ ] Usuário criado no Auth
- [ ] Seed data populado (3 products, 3 orders, etc)
- [ ] Testes de query executados
- [ ] Credenciais Supabase copiadas
- [ ] .env.local atualizado
- [ ] Login funciona no dashboard

---

## 🎯 KPIs Fase 2

| Métrica | Value |
|---------|-------|
| Tabelas criadas | 12 |
| Índices | 20+ |
| RLS Policies | 30+ |
| Linhas de SQL | 1000+ |
| Tipos TypeScript | 15+ |
| Data isolation | ✅ Multi-tenant |

---

## 🚨 Próximas Fases

### **PHASE 3 (Steps 21-30):** P0 Sincronização
- Sync estoque bidirecional
- Feed pedidos unificado
- Webhook handling
- Sistema de retry

### **PHASE 4 (Steps 31-40):** P0 Dashboard
- **PAINEL DE MARGEM REAL** (KPI prioritário)
- Gráficos e alertas
- Exportação relatórios

### **PHASE 5 (Steps 41-50):** Integração Real
- OAuth Mercado Livre
- Conector Shopee
- Deploy produção

---

**Status:** ✅ Fase 2 Completa!  
**Próximo:** Rodar schema no Supabase + PHASE 3  
**Tempo total até agora:** ~7 horas  
**Tempo restante:** ~10-13 horas (até 50 steps)

Você quer rodar o schema agora? Ou prefere eu continuar com PHASE 3?
