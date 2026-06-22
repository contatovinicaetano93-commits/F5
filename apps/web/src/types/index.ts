// Multi-tenant types

export type UserRole = 'admin' | 'operador' | 'financeiro' | 'viewer';

export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  plan: 'starter' | 'pro' | 'enterprise';
  logo_url?: string;
  status: 'active' | 'inactive' | 'trial';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  tenant: Tenant;
  accessToken: string;
  expiresAt: number;
}

export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  images?: string[];
  attributes?: Record<string, string>[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  sku: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_variant_id: string;
  marketplace: 'mercado_livre' | 'shopee' | 'amazon' | 'magalu';
  quantity: number;
  reserved: number;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  marketplace_order_id: string;
  marketplace: 'mercado_livre' | 'shopee' | 'amazon' | 'magalu';
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  customer_name: string;
  customer_email?: string;
  total_value: number;
  commission_marketplace: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface PricingPolicy {
  id: string;
  tenant_id: string;
  product_variant_id: string;
  marketplace: 'mercado_livre' | 'shopee' | 'amazon' | 'magalu';
  min_price: number;
  min_margin_pct: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceCredential {
  id: string;
  tenant_id: string;
  marketplace: 'mercado_livre' | 'shopee' | 'amazon' | 'magalu';
  access_token: string; // Encrypted in DB
  refresh_token?: string; // Encrypted in DB
  status: 'active' | 'expired' | 'invalid';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  tenant_id: string;
  marketplace: string;
  type: 'inventory' | 'orders' | 'pricing';
  status: 'pending' | 'success' | 'failed';
  error?: string;
  records_processed?: number;
  created_at: string;
}

// Dashboard types

export interface MarginRealRow {
  sku: string;
  product_name: string;
  gmv_bruto: number;
  comissao_marketplace: number;
  comissao_pct: number;
  frete: number;
  devolucoes: number;
  devolucoes_pct: number;
  ads: number;
  lucro_real: number;
  margem_real_pct: number;
  marketplace: string;
}

export interface DashboardKPIs {
  gmv_total: number;
  gmv_pct_change: number;
  estoque_total: number;
  estoque_baixo_count: number;
  pedidos_novos: number;
  pedidos_processando: number;
  receita_liquida: number;
  margem_media_pct: number;
}

export interface ReputationMetrics {
  marketplace: string;
  rating: number; // 0-5
  review_count: number;
  positive_pct: number;
  cancelation_rate: number;
  return_rate: number;
  response_time_hours: number;
}

export interface AlertNotification {
  id: string;
  tenant_id: string;
  type: 'stockout' | 'low_reputation' | 'sync_failed' | 'high_return' | 'order_cancelled';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  read: boolean;
  created_at: string;
}
