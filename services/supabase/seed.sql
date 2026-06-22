-- ============================================================================
-- F5 — SEED DATA (Test data for development)
-- ============================================================================
-- Run this AFTER running 001_init_schema.sql
-- ============================================================================

-- Step 1: Create test tenant
INSERT INTO public.tenants (name, cnpj, plan, status)
VALUES (
  'Indústria Teste XYZ',
  '12.345.678/0001-90',
  'pro',
  'active'
) RETURNING id AS tenant_id;

-- Note: Copy the tenant_id from the response above and paste it below

-- Step 2: Create test user (admin)
-- First, you need to create a user via Supabase Auth dashboard
-- Then run this (replace the UUIDs):
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

-- Step 3: Create sample products
INSERT INTO public.products (tenant_id, sku, name, description, category, images)
VALUES
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'ELETRO-001',
    'Ventilador Industrial Premium',
    'Ventilador de parede 50cm com 3 velocidades',
    'Eletrodomésticos',
    ARRAY['https://via.placeholder.com/300?text=Ventilador']
  ),
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'ELETRO-002',
    'Luminária LED 20W',
    'Luminária branca fria 20W, bivolt',
    'Iluminação',
    ARRAY['https://via.placeholder.com/300?text=Luminaria']
  ),
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'ELETRO-003',
    'Extensão Elétrica 10m',
    'Extensão com proteção 10 metros, 10A',
    'Acessórios',
    ARRAY['https://via.placeholder.com/300?text=Extensao']
  );

-- Step 4: Create product variants
INSERT INTO public.product_variants (product_id, variant_name, sku)
SELECT id, 'Padrão', sku || '-V1' FROM public.products
WHERE tenant_id = (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90');

-- Step 5: Create inventory for each variant (simulating 3 marketplaces)
INSERT INTO public.inventory (product_variant_id, marketplace, quantity, reserved)
SELECT
  pv.id,
  marketplace,
  FLOOR(RANDOM() * 100 + 50)::DECIMAL, -- Random quantity 50-150
  FLOOR(RANDOM() * 20)::DECIMAL -- Random reserved 0-20
FROM public.product_variants pv
CROSS JOIN (VALUES ('mercado_livre'), ('shopee'), ('amazon')) AS mp(marketplace)
WHERE pv.product_id IN (
  SELECT id FROM public.products
  WHERE tenant_id = (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90')
);

-- Step 6: Create pricing policies
INSERT INTO public.pricing_policies (tenant_id, product_variant_id, marketplace, min_price, min_margin_pct)
SELECT
  p.tenant_id,
  pv.id,
  marketplace,
  FLOOR(RANDOM() * 100 + 50)::DECIMAL, -- Min price R$ 50-150
  (RANDOM() * 10 + 15)::DECIMAL -- Min margin 15-25%
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
CROSS JOIN (VALUES ('mercado_livre'), ('shopee'), ('amazon')) AS mp(marketplace)
WHERE p.tenant_id = (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90');

-- Step 7: Create sample orders
INSERT INTO public.orders (tenant_id, marketplace_order_id, marketplace, status, customer_name, customer_email, total_value, commission_marketplace)
VALUES
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'ML-2026-06-001',
    'mercado_livre',
    'processing',
    'João Silva',
    'joao@email.com',
    299.90,
    45.00
  ),
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'SHOPEE-2026-06-001',
    'shopee',
    'shipped',
    'Maria Santos',
    'maria@email.com',
    199.90,
    29.99
  ),
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'AMZN-2026-06-001',
    'amazon',
    'delivered',
    'Carlos Lima',
    'carlos@email.com',
    549.90,
    82.49
  );

-- Step 8: Create order items
INSERT INTO public.order_items (order_id, product_variant_id, quantity, unit_price, subtotal)
SELECT
  o.id,
  pv.id,
  2,
  150.00,
  300.00
FROM public.orders o
CROSS JOIN public.product_variants pv
WHERE o.marketplace_order_id = 'ML-2026-06-001'
LIMIT 1;

INSERT INTO public.order_items (order_id, product_variant_id, quantity, unit_price, subtotal)
SELECT
  o.id,
  pv.id,
  1,
  200.00,
  200.00
FROM public.orders o
CROSS JOIN public.product_variants pv
WHERE o.marketplace_order_id = 'SHOPEE-2026-06-001'
LIMIT 1;

-- Step 9: Create dashboard metrics
INSERT INTO public.dashboard_metrics (tenant_id, total_sales_month, total_costs, total_inventory, payments_pending, mercado_livre_pct, shopee_pct, amazon_pct)
VALUES (
  (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
  1049.70, -- Total from orders
  157.48, -- Commission sum
  450, -- Total inventory units
  524.85, -- 50% pending payment
  40,
  35,
  25
);

-- Step 10: Create sync logs
INSERT INTO public.sync_logs (tenant_id, marketplace, type, status, records_processed)
VALUES
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'mercado_livre',
    'inventory',
    'success',
    15
  ),
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'shopee',
    'orders',
    'success',
    3
  ),
  (
    (SELECT id FROM public.tenants WHERE cnpj = '12.345.678/0001-90'),
    'amazon',
    'pricing',
    'success',
    9
  );

-- ============================================================================
-- Seed data complete! ✅
-- You now have test data in your database
-- ============================================================================

-- Query to verify data was inserted:
SELECT
  t.name AS tenant,
  COUNT(DISTINCT p.id) AS products,
  COUNT(DISTINCT i.id) AS inventory_records,
  COUNT(DISTINCT o.id) AS orders
FROM public.tenants t
LEFT JOIN public.products p ON p.tenant_id = t.id
LEFT JOIN public.inventory i ON i.product_variant_id IN (
  SELECT id FROM public.product_variants WHERE product_id = p.id
)
LEFT JOIN public.orders o ON o.tenant_id = t.id
WHERE t.cnpj = '12.345.678/0001-90'
GROUP BY t.name;
