-- ============================================================================
-- F5 — DATABASE SCHEMA (Multi-tenant SaaS)
-- ============================================================================
-- Execute this in Supabase SQL Editor
-- All tables include tenant_id for multi-tenant isolation via RLS
-- ============================================================================

-- ============================================================================
-- 1. TENANTS TABLE (Companies/Industries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenants_cnpj ON public.tenants(cnpj);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants are accessible to authenticated users in same tenant"
  ON public.tenants
  FOR SELECT
  USING (
    id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 2. USERS TABLE (Multi-tenant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operador', 'financeiro', 'viewer')),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_tenant_email ON public.users(tenant_id, email);
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tenant's users"
  ON public.users
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Only admins can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
    AND tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 3. PRODUCTS TABLE (Catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images TEXT[], -- Array of image URLs
  attributes JSONB, -- { "color": ["red", "blue"], "size": ["P", "M", "G"] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX idx_products_sku ON public.products(tenant_id, sku);
CREATE INDEX idx_products_category ON public.products(tenant_id, category);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's products"
  ON public.products
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Only operador+ can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) IN ('admin', 'operador')
    AND tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 4. PRODUCT_VARIANTS TABLE (SKU variants: size, color, etc)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- e.g., "XL-Azul" ou "P-Vermelho"
  sku TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

-- Enable RLS via product_id → products → tenant_id
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view variants of their tenant's products"
  ON public.product_variants
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM public.products
      WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
    )
  );

-- ============================================================================
-- 5. INVENTORY TABLE (Estoque por marketplace)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('mercado_livre', 'shopee', 'amazon', 'magalu')),
  quantity DECIMAL(12, 4) NOT NULL DEFAULT 0,
  reserved DECIMAL(12, 4) NOT NULL DEFAULT 0, -- Quantity reserved for pending orders
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_variant_id, marketplace)
);

CREATE INDEX idx_inventory_product_variant_id ON public.inventory(product_variant_id);
CREATE INDEX idx_inventory_marketplace ON public.inventory(marketplace);

-- Enable RLS via product_variant_id
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view inventory for their tenant's products"
  ON public.inventory
  FOR SELECT
  USING (
    product_variant_id IN (
      SELECT id FROM public.product_variants
      WHERE product_id IN (
        SELECT id FROM public.products
        WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
      )
    )
  );

-- ============================================================================
-- 6. PRICING_POLICIES TABLE (Preço mínimo + margem)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pricing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('mercado_livre', 'shopee', 'amazon', 'magalu')),
  min_price DECIMAL(12, 2) NOT NULL, -- Minimum price allowed
  min_margin_pct DECIMAL(5, 2) NOT NULL, -- Minimum margin percentage (e.g., 15.50)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_variant_id, marketplace)
);

CREATE INDEX idx_pricing_policies_tenant_id ON public.pricing_policies(tenant_id);
CREATE INDEX idx_pricing_policies_marketplace ON public.pricing_policies(marketplace);

-- Enable RLS
ALTER TABLE public.pricing_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pricing policies for their tenant"
  ON public.pricing_policies
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 7. ORDERS TABLE (Unified orders from all marketplaces)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  marketplace_order_id TEXT NOT NULL,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('mercado_livre', 'shopee', 'amazon', 'magalu')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  total_value DECIMAL(12, 2) NOT NULL,
  commission_marketplace DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, marketplace_order_id, marketplace)
);

CREATE INDEX idx_orders_tenant_id ON public.orders(tenant_id);
CREATE INDEX idx_orders_marketplace ON public.orders(marketplace);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's orders"
  ON public.orders
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 8. ORDER_ITEMS TABLE (Items in each order)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  quantity DECIMAL(12, 4) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_variant_id ON public.order_items(product_variant_id);

-- Enable RLS via order_id
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items from their tenant's orders"
  ON public.order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
    )
  );

-- ============================================================================
-- 9. MARKETPLACE_CREDENTIALS TABLE (OAuth tokens - encrypted)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL CHECK (marketplace IN ('mercado_livre', 'shopee', 'amazon', 'magalu')),
  access_token TEXT NOT NULL, -- Encrypted in DB
  refresh_token TEXT, -- Encrypted in DB
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'invalid')),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, marketplace)
);

CREATE INDEX idx_marketplace_credentials_tenant_id ON public.marketplace_credentials(tenant_id);

-- Enable RLS
ALTER TABLE public.marketplace_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view marketplace credentials"
  ON public.marketplace_credentials
  FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
    AND tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 10. SYNC_LOGS TABLE (Audit trail for sync operations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inventory', 'orders', 'pricing')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error TEXT,
  records_processed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_tenant_id ON public.sync_logs(tenant_id);
CREATE INDEX idx_sync_logs_marketplace ON public.sync_logs(marketplace);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sync logs for their tenant"
  ON public.sync_logs
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 11. DASHBOARD_METRICS TABLE (Aggregated KPIs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  total_sales_month DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_costs DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_inventory DECIMAL(12, 4) NOT NULL DEFAULT 0,
  payments_pending DECIMAL(12, 2) NOT NULL DEFAULT 0,
  mercado_livre_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  shopee_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  amazon_pct DECIMAL(5, 2) NOT NULL DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dashboard_metrics_tenant_id ON public.dashboard_metrics(tenant_id);

-- Enable RLS
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metrics for their tenant"
  ON public.dashboard_metrics
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- 12. ALERT_NOTIFICATIONS TABLE (Real-time alerts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stockout', 'low_reputation', 'sync_failed', 'high_return', 'order_cancelled')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_notifications_tenant_id ON public.alert_notifications(tenant_id);
CREATE INDEX idx_alert_notifications_read ON public.alert_notifications(read);
CREATE INDEX idx_alert_notifications_created_at ON public.alert_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts for their tenant"
  ON public.alert_notifications
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1)
  );

-- ============================================================================
-- FINAL: Disable anonymous access (use anon key only for intended endpoints)
-- ============================================================================

-- Force RLS on all tables (deny all by default)
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.inventory FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_policies FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- Schema migration complete! ✅
-- ============================================================================
