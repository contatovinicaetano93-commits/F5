# F5 — Row Level Security (RLS) Strategy

**Objetivo:** Implementar multi-tenant seguro com Supabase RLS

## Modelo de Isolamento

Todas as tabelas possuem `tenant_id` como chave de particionamento.

```sql
-- Exemplo: tabela products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  ...
  CONSTRAINT products_tenant_sku_unique UNIQUE (tenant_id, sku)
);
```

## RLS Policies

### 1. SELECT Policy (Ler dados)
```sql
CREATE POLICY "Users can select their tenant's products"
ON products
FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id FROM users 
    WHERE id = auth.uid()
  )
);
```

**Lógica:** User só vê produtos do seu tenant_id

### 2. INSERT Policy (Criar dados)
```sql
CREATE POLICY "Users can insert products in their tenant"
ON products
FOR INSERT
WITH CHECK (
  tenant_id = (
    SELECT tenant_id FROM users 
    WHERE id = auth.uid()
  )
  AND (
    SELECT role FROM users WHERE id = auth.uid()
  ) IN ('admin', 'operador')
);
```

**Lógica:** Apenas admin e operador podem criar produtos

### 3. UPDATE Policy
```sql
CREATE POLICY "Users can update their tenant's products"
ON products
FOR UPDATE
USING (
  tenant_id = (
    SELECT tenant_id FROM users 
    WHERE id = auth.uid()
  )
  AND (
    SELECT role FROM users WHERE id = auth.uid()
  ) IN ('admin', 'operador')
)
WITH CHECK (
  tenant_id = (
    SELECT tenant_id FROM users 
    WHERE id = auth.uid()
  )
);
```

### 4. DELETE Policy
```sql
CREATE POLICY "Only admins can delete products"
ON products
FOR DELETE
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
```

## Aplicar RLS

```sql
-- Habilitar RLS na tabela
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Desabilitar acesso padrão (deny all)
ALTER TABLE products FORCE ROW LEVEL SECURITY;
```

## JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "user@company.com",
  "tenant_id": "tenant-uuid",
  "role": "admin",
  "exp": 1234567890
}
```

**Criação via Supabase Auth:**
```sql
-- Trigger para adicionar tenant_id ao JWT
CREATE OR REPLACE FUNCTION public.custom_claims(claims jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  claims := jsonb_set(claims, '{tenant_id}', 
    to_jsonb((SELECT tenant_id FROM users WHERE id = auth.uid())));
  RETURN claims;
END;
$$;
```

## Testing RLS

### Test 1: User A vê apenas dados do Tenant A
```typescript
// User A (tenant_id = 'tenant-a')
const { data } = await supabase
  .from('products')
  .select('*');

// Retorna: apenas produtos com tenant_id = 'tenant-a'
```

### Test 2: User B NÃO vê dados do Tenant A
```typescript
// User B (tenant_id = 'tenant-b')
// Mesmo que tente um SELECT direto:
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('tenant_id', 'tenant-a');

// Retorna: [] (vazio) ou erro, dependendo de policy
```

### Test 3: User sem admin NÃO consegue deletar
```typescript
// User com role = 'operador'
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', 'product-id');

// Retorna: error "permission denied"
```

## Performance Considerations

1. **Índices:** Sempre indexar `tenant_id` e colunas frequentemente filtradas
   ```sql
   CREATE INDEX products_tenant_id_idx ON products(tenant_id);
   CREATE INDEX products_tenant_sku_idx ON products(tenant_id, sku);
   ```

2. **RLS Overhead:** RLS adiciona ~5-10% de overhead. Aceito tradeoff.

3. **Caching:** Cache na aplicação reduz queries RLS.

## Security Checklist

- [ ] RLS habilitada em TODAS as tabelas
- [ ] Todas as tabelas possuem `tenant_id`
- [ ] JWT contém `tenant_id`
- [ ] Policies testadas para todos os roles
- [ ] Índices criados em `tenant_id`
- [ ] Admin dashboard usa `anon` key (não `service_role`!)
- [ ] Zero hardcoded tenant_ids em SQL

## Próximo Passo

**Step 6:** Implementar layout base do dashboard

---

**Referência:** https://supabase.com/docs/guides/auth/row-level-security
