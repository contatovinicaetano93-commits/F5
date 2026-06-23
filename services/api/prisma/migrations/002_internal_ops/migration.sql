-- F5 internal operations: tenants, catalog, manual metrics, insights

CREATE TYPE "UserRole" AS ENUM ('admin', 'operator', 'client_viewer');
CREATE TYPE "TenantSegment" AS ENUM ('PET', 'SAUDE', 'PAPEL', 'PARAFUSO');
CREATE TYPE "OperatingScenario" AS ENUM ('BRACO_ONLINE', 'SOCIO_DIGITAL', 'COMPRAR_REVENDER', 'AMAZON_1P');
CREATE TYPE "Marketplace" AS ENUM ('mercado_livre', 'amazon', 'shopee', 'tiktok', 'outros');

CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "segment" "TenantSegment" NOT NULL,
    "scenario" "OperatingScenario" NOT NULL DEFAULT 'BRACO_ONLINE',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "marketplace" "Marketplace" NOT NULL DEFAULT 'mercado_livre',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ProductMetric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "unitsSold" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "searchPosition" INTEGER,
    "conversionRate" DECIMAL(5,4),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductMetric_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductMetric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductMetric_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "InsightNote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "authorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "weekOf" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InsightNote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InsightNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InsightNote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InsightNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING (
  CASE
    WHEN "role" = 'admin' THEN 'admin'::"UserRole"
    ELSE 'operator'::"UserRole"
  END
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'operator';
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NotaFiscal" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DashboardMetrics" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "DashboardMetrics" DROP CONSTRAINT IF EXISTS "DashboardMetrics_userId_key";
ALTER TABLE "DashboardMetrics" ADD CONSTRAINT "DashboardMetrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DashboardMetrics" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "PaymentSchedule" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentSchedule" DROP COLUMN IF EXISTS "userId";

CREATE UNIQUE INDEX "Product_tenantId_sku_key" ON "Product"("tenantId", "sku");
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX "ProductMetric_tenantId_idx" ON "ProductMetric"("tenantId");
CREATE INDEX "ProductMetric_productId_idx" ON "ProductMetric"("productId");
CREATE INDEX "ProductMetric_periodStart_idx" ON "ProductMetric"("periodStart");
CREATE INDEX "InsightNote_tenantId_idx" ON "InsightNote"("tenantId");
CREATE INDEX "InsightNote_productId_idx" ON "InsightNote"("productId");
CREATE INDEX "Tenant_segment_idx" ON "Tenant"("segment");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "NotaFiscal_tenantId_idx" ON "NotaFiscal"("tenantId");
CREATE UNIQUE INDEX "DashboardMetrics_tenantId_key" ON "DashboardMetrics"("tenantId");
CREATE INDEX "PaymentSchedule_tenantId_idx" ON "PaymentSchedule"("tenantId");
