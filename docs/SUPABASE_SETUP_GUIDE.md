# 🚀 Supabase Setup Guide — Steps 11-20

**Objetivo:** Criar e popular o banco de dados F5 no Supabase  
**Tempo estimado:** 15-20 minutos  
**Pré-requisito:** Projeto Supabase criado

---

## 📋 Passo-a-Passo

### PASSO 1: Acessar Supabase SQL Editor

1. Ir para https://supabase.com/dashboard
2. Selecionar seu projeto F5
3. Clicar em **SQL Editor** (menu esquerdo)
4. Clicar em **New Query**

---

### PASSO 2: Copiar Schema SQL

1. Abrir arquivo: `services/supabase/migrations/001_init_schema.sql`
2. Copiar **TODO O CONTEÚDO** (Ctrl+A → Ctrl+C)
3. Voltar para Supabase SQL Editor
4. Colar no editor (Ctrl+V)

---

### PASSO 3: Executar Schema

1. Clicar em botão **RUN** (canto direito superior)
2. Aguardar ~5-10 segundos
3. ✅ Deve aparecer mensagem: "Schema migration complete!"

**Se houver erro:**
- [ ] Verificar se projeto Supabase está ativo
- [ ] Verificar se há espaço em breve no código SQL
- [ ] Copiar erro e pesquisar no Google/Supabase docs

---

### PASSO 4: Verificar Tabelas Criadas

1. No menu **Table Editor** (esquerdo)
2. Deve aparecer as 12 tabelas:
   - ✅ tenants
   - ✅ users
   - ✅ products
   - ✅ product_variants
   - ✅ inventory
   - ✅ pricing_policies
   - ✅ orders
   - ✅ order_items
   - ✅ marketplace_credentials
   - ✅ sync_logs
   - ✅ dashboard_metrics
   - ✅ alert_notifications

---

### PASSO 5: Criar Usuário no Auth

1. Ir para **Authentication** → **Users** (menu esquerdo)
2. Clicar em **Add User**
3. Preencher:
   - **Email:** seu@email.com
   - **Password:** (gerar segura)
   - **Auto confirm user:** ✅
4. Clicar **Create User**
5. **Copiar UUID do user** (canto direito) — você vai precisar

---

### PASSO 6: Copiar e Adapterar Seed Data

1. Abrir arquivo: `services/supabase/seed.sql`
2. Encontrar o Step 2 (comentado):
   ```sql
   /*
   INSERT INTO public.users (id, email, role, tenant_id, status)
   VALUES (
     'USER_UUID_HERE', -- from Supabase Auth
     'admin@industrial.com',
     'admin',
     'TENANT_UUID_HERE', -- from step 1
     'active'
   );
   */
   ```
3. Descomentar e substituir:
   - `USER_UUID_HERE` → UUID do user (do Passo 5)
   - `TENANT_UUID_HERE` → UUID do tenant (será gerado no próximo passo)

---

### PASSO 7: Copiar Seed Data

1. Ir para SQL Editor → **New Query**
2. Copiar **TODO O CONTEÚDO** de `seed.sql`
3. Colar no editor
4. **ATENÇÃO:** Antes de rodar, fazer o Passo 6 acima
5. Clicar **RUN**
6. Na primeira query, vai aparecer:
   ```
   tenant_id
   ----
   abc-123-def-456
   ```
7. **COPIAR ESTE UUID** para o Passo 6

---

### PASSO 8: Popular User + Tenant

1. Nova query, copiar o SQL preparado no Passo 6
2. **Descomentar** (remover `/*` e `*/`)
3. Rodar
4. ✅ User criado com tenant associado

---

### PASSO 9: Verificar Dados

No **Table Editor**:

**tenants:**
- ✅ 1 registro: "Indústria Teste XYZ" | CNPJ: "12.345.678/0001-90"

**users:**
- ✅ 1 registro: seu@email.com | role: admin

**products:**
- ✅ 3 registros: Ventilador, Luminária, Extensão

**orders:**
- ✅ 3 registros: ML, Shopee, Amazon

---

## 🔐 Verificar RLS Policies

1. Abrir tabela **products** (Table Editor)
2. Clicar em **Policies** (tab superior)
3. Deve aparecer:
   - ✅ "Users can view their tenant's products"
   - ✅ "Only operador+ can insert products"

**Isso significa:** RLS está ativo ✅

---

## 📊 Executar Queries de Teste

### Teste 1: Ver produtos (como seu user)

```sql
SELECT * FROM public.products;
-- Deve retornar: 3 produtos
```

### Teste 2: Ver ordersunificados (como seu user)

```sql
SELECT marketplace, status, customer_name, total_value
FROM public.orders
ORDER BY created_at DESC;
-- Deve retornar: 3 orders (ML, Shopee, Amazon)
```

### Teste 3: Estoque por marketplace

```sql
SELECT
  pv.sku,
  i.marketplace,
  i.quantity,
  i.reserved
FROM public.inventory i
JOIN public.product_variants pv ON pv.id = i.product_variant_id
ORDER BY pv.sku, i.marketplace;
-- Deve retornar: 9 registros (3 produtos × 3 marketplaces)
```

### Teste 4: Dashboard Metrics

```sql
SELECT
  total_sales_month,
  total_costs,
  mercado_livre_pct,
  shopee_pct,
  amazon_pct
FROM public.dashboard_metrics
WHERE tenant_id = (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90');
```

---

## 🔗 Conectar ao Next.js

### 1. Copiar Credenciais Supabase

No Supabase dashboard:
1. Settings → API
2. Copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Atualizar .env.local

```bash
cd apps/web
# Editar .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Testar Conexão

```bash
pnpm dev
# Ir para http://localhost:3000/login
# Fazer login com: seu@email.com / sua-senha
# ✅ Deve redirecionar para dashboard
```

---

## ⚠️ Troubleshooting

### Erro: "Policy violation"

**Causa:** RLS está bloqueando query  
**Solução:**
1. Verificar se você está logado como user correto
2. Verificar se `tenant_id` no JWT match com dados

### Erro: "Function not found"

**Causa:** Schema não foi criado completamente  
**Solução:**
1. Voltar ao SQL Editor
2. Rodar schema novamente
3. Verificar se todas as tabelas aparecem em Table Editor

### Dados não aparecem

**Causa:** RLS filtrando por tenant_id  
**Solução:**
1. Fazer query teste (veja seção acima)
2. Verificar `tenant_id` do seu user:
   ```sql
   SELECT tenant_id FROM public.users WHERE email = 'seu@email.com';
   ```

---

## ✅ Checklist Final

- [ ] Schema SQL rodou sem erros
- [ ] 12 tabelas criadas
- [ ] Usuário criado no Auth
- [ ] Seed data populado
- [ ] RLS policies ativas
- [ ] Testes de query executados
- [ ] Credenciais Supabase copiadas
- [ ] .env.local atualizado
- [ ] Login funciona no Next.js

---

## 📞 Próximas Etapas

Depois de tudo configurado:

1. **PHASE 2 Conclusão:** Verificar que tudo está funcionando
2. **PHASE 3 (Steps 21-30):** Implementar sincronização de estoque
3. **PHASE 4 (Steps 31-40):** Criar dashboard com KPIs

---

**Status:** Pronto para rodar!  
**Tempo total:** ~15-20 minutos  
**Próximo:** Testar conexão Next.js + Supabase

