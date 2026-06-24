# STEP 30: Sincronização — Fluxos Detalhados

> ⚠️ **DOCUMENTO LEGADO** — Descreve visão com sync API marketplace (5–15 min).  
> **Não é o modelo atual.** Ver `docs/OPERATING_MODEL.md` e `docs/ARCHITECTURE_STRATEGY.md` v2.  
> MVP atual: NF-e + lançamento manual + operação humana nos marketplaces.

**Status:** 📦 Arquivado (referência histórica)  
**Componentes:** InventorySyncService + OrdersSyncService + CategoryMappingService + SyncQueueService  
**Horários:** Inventário a cada 5min | Pedidos a cada 15min

---

## 📋 Visão Geral dos Fluxos

```
┌─────────────────────────────────────────────────────────────────┐
│                      F5 SYNC ARCHITECTURE                        │
│                                                                   │
│  Marketplace APIs                                                │
│  ├─ Mercado Livre                                               │
│  ├─ Shopee                                                       │
│  ├─ Amazon              ←→  SYNC WORKERS (Cron)                │
│  └─ Magalu              ←→  (Inventory: 5min | Orders: 15min)   │
│                                                                   │
│  Real-time Webhooks ────→ Webhook Handler                       │
│                                ↓                                 │
│                          Local Database (Supabase)              │
│                          (Source of Truth)                      │
│                                ↓                                 │
│                          Dashboard + APIs                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ FLUXO: Sincronização de Estoque (Inventory Sync)

### Arquitetura
```
MARKETPLACE API                    LOCAL DB
     ↓                             ↓
  (fetch)                        (read)
     ↓                             ↓
┌──────────────────────────────────────────┐
│     InventorySyncService                 │
│  (syncMarketplaceInventory)              │
│                                          │
│  1. Get credentials (encrypted)          │
│  2. Fetch remote inventory               │
│  3. For each SKU:                        │
│     - Find local variant                 │
│     - Upsert into inventory table        │
│  4. Update last_sync timestamp           │
│  5. Log operation (sync_logs)            │
└──────────────────────────────────────────┘
     ↓                             ↓
  (return)                      (persisted)
     ↓                             ↓
  SUCCESS/FAIL                    DB Updated
```

### Diagrama Sequencial (5 min CRON)
```
Time  Event                         Action
────  ────────────────────────────  ──────────────────────────
T+0   @Cron triggers (EVERY_5_MIN)  Worker starts
      Get all active tenants        Read from DB
      
T+1   For each tenant:
      - Get list of marketplaces    ['ML', 'Shopee', 'Amazon', 'Magalu']
      
T+2   For each marketplace:
      - Fetch credentials           Decrypt from marketplace_credentials
      - Validate (status=active)    Check if auth still valid
      - Call fetchMarketplaceInventory() Mock API call (200ms simulated)
      
T+3   For each marketplace item:
      - Find variant by SKU         Query productVariants table
      - Upsert to inventory         Create or update record
      - Validate availability       Check stock >= reserved
      
T+4   Update last_sync             marketplace_credentials.last_sync = NOW()
      
T+5   Log result                   INSERT into sync_logs
                                   {status, error, records_processed}
      
T+6   Return SyncResult            {marketplace, success, recordsProcessed, duration}
      
T+7   Log output                   ✅ [mercado_livre] Synced 15 items in 4523ms
```

### Exemplo de Dados (Mock)
```sql
-- ENTRADA (Marketplace API response)
{
  "items": [
    {"sku": "ELETRO-001-V1", "quantity": 45},
    {"sku": "ELETRO-002-V1", "quantity": 78},
    {"sku": "ELETRO-003-V1", "quantity": 120}
  ]
}

-- SAÍDA (Local inventory table)
UPDATE inventory SET
  quantity = 45,
  reserved = 0,
  updated_at = NOW()
WHERE product_variant_id = (SELECT id FROM product_variants WHERE sku = 'ELETRO-001-V1')
  AND marketplace = 'mercado_livre';
```

### Gestão de Estoque: Quantidade vs Reserva
```
Total Disponível = Quantidade - Reserva

Exemplo:
  quantity = 100
  reserved = 30 (pedido pendente)
  
  Disponível = 100 - 30 = 70 unidades

Fluxo de Pedido:
  1. Novo pedido chegou (quantity=20)
  2. Validar: available (70) >= requested (20) ✅
  3. Reservar: reserved += 20 (agora 50)
  4. Pedido processado, libera: reserved -= 20 (volta a 30)
```

---

## 2️⃣ FLUXO: Sincronização de Pedidos (Orders Sync)

### Arquitetura
```
MARKETPLACE API              LOCAL DB
  (new orders)              (orders table)
     ↓                         ↓
  (fetch)                    (read)
     ↓                         ↓
┌──────────────────────────────────────────┐
│    OrdersSyncService                     │
│  (syncMarketplaceOrders)                 │
│                                          │
│  1. Get credentials (encrypted)          │
│  2. Fetch remote orders (new + updated)  │
│  3. For each order:                      │
│     - Check if exists (by unique ID)     │
│     - CREATE or UPDATE                   │
│     - Create order_items                 │
│  4. Update last_sync timestamp           │
│  5. Log operation (sync_logs)            │
└──────────────────────────────────────────┘
     ↓                         ↓
  (return)                  (persisted)
     ↓                         ↓
  UNIFIED FEED            Orders + Items
```

### Diagrama Sequencial (15 min CRON)
```
Time   Event                             Action
──────  ──────────────────────────────── ──────────────────────────
T+0    @Cron triggers (EVERY_15_MIN)    Worker starts
       
T+1    Get all active tenants            Read from tenants table
       
T+2    For each tenant:
       - Get list of marketplaces        ['ML', 'Shopee', 'Amazon', 'Magalu']
       
T+3    For each marketplace:
       - Fetch credentials               Decrypt from marketplace_credentials
       - Validate (status=active)        Check if auth still valid
       - Call fetchMarketplaceOrders()   Mock API call (200ms per marketplace)
       
T+4    For each remote order:
       - Generate unique ID key:         {tenantId_marketplaceOrderId_marketplace}
       - Query existing order            Check if already in DB
       
T+5    If EXISTS (same order):
       - Update status field             orders.status = remote.status
       - Update timestamp                orders.updated_at = NOW()
       - Count as updatedOrders++
       
       If NOT EXISTS:
       - Create order record             Insert with all fields
       - For each item in order:
         * Find variant by SKU           Query productVariants
         * Create order_item record      Link to order + variant
       - Count as newOrders++
       
T+6    Update last_sync                  marketplace_credentials.last_sync = NOW()
       
T+7    Log result                        INSERT into sync_logs
                                         {status, error, records_processed}
       
T+8    Return SyncResult                 {marketplace, success, newOrders, updatedOrders}
       
T+9    Log output                        ✅ [shopee] New: 5, Updated: 2 in 1234ms
```

### Fluxo de Webhook (Real-time)
```
Marketplace sends webhook →  POST /webhook/orders
                                   ↓
                         handleOrderWebhook()
                                   ↓
                         1. Find existing order
                                   ↓
                    IF EXISTS → Update status
                         ↓
                    IF NOT → Create order + items
                         ↓
                         Return {action, orderId}
```

### Exemplo de Dados (Webhook)
```json
POST /webhook/orders
{
  "marketplace_order_id": "ML-2026-06-001",
  "status": "new",
  "customer_name": "João Silva",
  "customer_email": "joao@email.com",
  "total_value": 299.90,
  "commission": 45.0,
  "items": [
    {
      "sku": "ELETRO-001-V1",
      "quantity": 2,
      "unit_price": 142.45
    }
  ]
}

-- Resultado:
INSERT INTO orders (
  tenant_id, marketplace_order_id, marketplace, status,
  customer_name, customer_email, total_value, commission_marketplace
) VALUES (
  'tenant-123', 'ML-2026-06-001', 'mercado_livre', 'new',
  'João Silva', 'joao@email.com', 299.90, 45.0
);

INSERT INTO order_items (
  order_id, product_variant_id, quantity, unit_price, subtotal
) VALUES (
  'order-abc-123', 'variant-xyz-789', 2, 142.45, 284.90
);
```

---

## 3️⃣ FLUXO: Feed Unificado de Pedidos (Unified Orders Feed)

### Problema Resolvido
```
Sem unificação:
  - Query ML table
  - Query Shopee table
  - Query Amazon table
  - Query Magalu table
  → Pior UX (dados fragmentados)

Com unificação:
  - 1 Query na tabela 'orders' com JOIN
  - Todos os marketplaces misturados
  - Ordenado por data (DESC)
  → Melhor UX (feed único cronológico)
```

### Arquitetura
```
Dashboard                         Database
    ↓                               ↓
  Call getUnifiedFeed()          SELECT orders
  {tenantId, limit, offset}         ↓
    ↓                            Filter by tenant_id
    ↓                            Join with order_items
    ↓                            Join with product_variants
    ↓                            Join with products
    ↓                            Order by created_at DESC
    ↓                            Limit + Offset
    ↓                            ↓
   RESPONSE:                   Return enriched data
   {
     orders: [{
       id, marketplace, status,
       customer_name, total_value,
       items: [{sku, qty, price, product: {...}}]
     }],
     total: 42,
     limit: 50,
     offset: 0
   }
```

### Exemplo SQL
```sql
SELECT
  o.id, o.marketplace, o.status, o.customer_name,
  o.total_value, o.commission_marketplace,
  o.created_at,
  json_agg(json_build_object(
    'sku', pv.sku,
    'quantity', oi.quantity,
    'unit_price', oi.unit_price,
    'product_name', p.name
  )) as items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN product_variants pv ON pv.id = oi.product_variant_id
LEFT JOIN products p ON p.id = pv.product_id
WHERE o.tenant_id = 'tenant-123'
GROUP BY o.id, o.marketplace, o.status, o.customer_name, o.total_value
ORDER BY o.created_at DESC
LIMIT 50 OFFSET 0;
```

---

## 4️⃣ FLUXO: Validação de Estoque (Stock Validation)

### Problema Resolvido
```
SEM validação:
  Pedido 1 chega: pede 50 unidades (em estoque 60) ✅
  Pedido 2 chega: pede 30 unidades (mesma SKU) ❌ OVERSELLING!

COM validação + reserva:
  Pedido 1: disponível = 60 - 0 = 60 ✅ Reserva 50 (reserved=50)
  Pedido 2: disponível = 60 - 50 = 10 ❌ Rejeita 30
```

### Arquitetura
```
New Order Event                    Validation
       ↓                               ↓
  Webhook/Cron                   validateStockAvailable(
  triggers                        variantId, marketplace, qty
                                  )
       ↓                               ↓
  Get inventory record:           available = quantity - reserved
  {quantity, reserved}            return (available >= qty)
       ↓                               ↓
  IF available >= qty:            ✅ Continue
    - Reserve stock               reserved += qty
    - Create order                Insert order
    - Log success
       ↓
  ELSE:
    - Detect conflict
    - Log rejection
    - Return error
```

### Exemplo Numérico
```
Cenário: iPhone 13 - Blue - 128GB
  quantity = 100 (estoque real)
  reserved = 30 (pedidos em processamento)
  
  disponível = 100 - 30 = 70
  
Novo pedido pede: 50 unidades
  Validação: 70 >= 50? ✅ SIM
  Ação: Reserve 50 → reserved = 80
  
Outro pedido pede: 25 unidades (simultâneo)
  Validação: 70 >= 25? ✅ SIM (ambos passam!)
  Ação: Reserve 25 → reserved = 55
  
  ⚠️ PROBLEMA: Alocamos 50+25=75, mas só temos 70 disponíveis!
  
SOLUÇÃO: Usar transaction + row lock:
  - Lock inventory record
  - Check available
  - Reserve atomicamente
  - Unlock
```

---

## 5️⃣ FLUXO: Fila de Retry (Queue System - BullMQ)

### Problema Resolvido
```
SEM fila:
  Sync falha → Próximo cron em 5 min → Dados desatualizados

COM fila de retry:
  Sync falha → Retry em 1s → Falha → Retry em 5s → Falha
           → Retry em 25s → Sucesso ✅
```

### Arquitetura
```
Cron Trigger               Queue Service              Redis
      ↓                         ↓                       ↓
   syncAll()             enqueueSyncJob()        Job storage
      ↓                         ↓                       ↓
  Try sync             Add to BullMQ            Queue structure
      ↓                         ↓                       ↓
  IF success:          Process immediately           ✅
  - Return result
      ↓
  IF failed:
  - Add to queue      Add retry job (BullMQ)    With backoff:
  - Exponential       - attempts: 4             1s → 5s → 25s → 125s
    backoff           - backoff: exponential
                      - removeOnComplete: 1h
                      - removeOnFail: 24h
```

### Configuração
```typescript
defaultJobOptions: {
  attempts: 4,              // 1 tentativa + 3 retries = 4 total
  backoff: {
    type: 'exponential',
    delay: 1000            // Começa em 1s
  },
  // Delay progression:
  // Attempt 1: Imediato
  // Attempt 2: 1s
  // Attempt 3: 5s (1s * 5^1)
  // Attempt 4: 25s (1s * 5^2)
}
```

---

## 6️⃣ FLUXO: Mapeamento de Categorias (Category Mapping)

### Problema Resolvido
```
Marketplace usam categorias diferentes:
  ML: categoria_id = "1000" → "Eletrodomésticos"
  Shopee: category_id = "1001" → "Home Appliances"
  Amazon: browse_node_id = "1002" → "Small Appliances"
  Magalu: genre_id = "1003" → "Eletrodomésticos"
  
Solução: Mapeamento bidirecional
```

### Arquitetura
```
Product                    Category Mapping       Marketplaces
{category:                     ↓                       ↓
 "Eletrodomésticos"}      translateCategory()    mercado_livre: 1000
         ↓                      ↓                 shopee: 1001
  publishProduct()         Check default map     amazon: 1002
         ↓                 If not found:          magalu: 1003
  For each marketplace:    Query DB
         ↓                 Fallback: NULL
  Validate category        ↓
         ↓                Return ID or null
  Publish with mapped ID
```

### Cache Strategy
```
Memory (In-App):
  defaultMappings = {
    'Eletrodomésticos': {
      'mercado_livre': '1000',
      'shopee': '1001',
      ...
    }
  }
  → Instant lookup (O(1))

Database:
  category_mappings table
  → For custom mappings
  → Query on demand
  
Validation:
  validateCategory(category, [marketplaces])
  → Check all marketplaces have mapping
  → Return missing mappings for admin to fix
```

---

## 📊 Performance Targets

| Fluxo | Frequency | Target Duration | Timeout |
|-------|-----------|-----------------|---------|
| Inventory Sync | 5 min | < 30s | 60s |
| Orders Sync | 15 min | < 60s | 120s |
| Webhook Handler | Real-time | < 2s | 10s |
| Stock Validation | On-demand | < 100ms | 1s |
| Category Lookup | On-demand | < 50ms | 500ms |

---

## 🚨 Error Handling

### Sincronização Falha
```
Cenário: Marketplace API timeout
  
  1. syncMarketplaceInventory() → Timeout error
  2. Catch error → Log to sync_logs {status: 'failed', error: 'timeout'}
  3. Return {success: false, error, duration}
  4. Cron continues (não bloqueia outros marketplaces)
  5. Next cron: Retry automático em 5 min
  6. BullMQ queue: Se manual trigger, retry com backoff
```

### Credenciais Inválidas
```
  1. Fetch credentials → status = 'expired'
  2. Skip this marketplace
  3. Log to sync_logs {status: 'failed', error: 'No active credentials'}
  4. Admin recebe alerta (alert_notifications)
  5. Admin reatualiza OAuth token
```

---

## ✅ Checklist PHASE 3

- [x] STEP 21: Worker de estoque (EVERY_5_MINUTES)
- [x] STEP 22: API manual de estoque
- [x] STEP 23: Mapeamento de categorias
- [x] STEP 24: Worker de pedidos (EVERY_15_MINUTES)
- [x] STEP 25: Webhook handler
- [x] STEP 26: Validação de estoque (available = qty - reserved)
- [x] STEP 27: Fila BullMQ com retry exponencial
- [x] STEP 28: Detecção de conflitos de estoque
- [x] STEP 29: E2E tests (sync.e2e.spec.ts)
- [x] STEP 30: Documentação detalhada (este arquivo)

---

## 🎯 Próximas Fases

### PHASE 4 (Steps 31-40): Dashboard & KPIs
- Dashboard homepage com 4 KPI cards
- Painel de Margem Real por SKU (KPI prioritário)
- Gráficos de tendência por marketplace
- Alertas em tempo real

### PHASE 5 (Steps 41-50): Integração Real
- OAuth com Mercado Livre
- Conector Shopee
- Precificação dinâmica
- Bulk announcement engine
- Deploy produção

---

**Status:** ✅ PHASE 3 Completa  
**Tempo total:** ~6 horas  
**Linhas de código:** 1500+ (services/api/src/sync/)
