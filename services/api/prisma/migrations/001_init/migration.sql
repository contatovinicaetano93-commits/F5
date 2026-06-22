-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nfNumber" TEXT NOT NULL,
    "nfSeries" TEXT NOT NULL,
    "nfDate" TIMESTAMP(3) NOT NULL,
    "emitente" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "valorBaseIcms" DECIMAL(12,2) NOT NULL,
    "valorIcms" DECIMAL(12,2) NOT NULL,
    "xmlContent" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "NotaFiscal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notaFiscalId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" DECIMAL(12,4) NOT NULL,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "marketplace" TEXT,

    CONSTRAINT "SalesItem_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DashboardMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "totalVendasMes" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCustos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEstoque" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "pagamentosReceber" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mercadoLivrePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "amazonPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "shopeePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL,
    "dataRecebimento" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "NotaFiscal_userId_idx" ON "NotaFiscal"("userId");

-- CreateIndex
CREATE INDEX "NotaFiscal_nfDate_idx" ON "NotaFiscal"("nfDate");

-- CreateUnique
CREATE UNIQUE INDEX "NotaFiscal_nfNumber_nfSeries_emitente_key" ON "NotaFiscal"("nfNumber", "nfSeries", "emitente");

-- CreateIndex
CREATE INDEX "SalesItem_notaFiscalId_idx" ON "SalesItem"("notaFiscalId");

-- CreateIndex
CREATE INDEX "SalesItem_sku_idx" ON "SalesItem"("sku");

-- CreateIndex
CREATE INDEX "DashboardMetrics_userId_idx" ON "DashboardMetrics"("userId");

-- CreateIndex
CREATE INDEX "PaymentSchedule_userId_idx" ON "PaymentSchedule"("userId");

-- CreateIndex
CREATE INDEX "PaymentSchedule_dataRecebimento_idx" ON "PaymentSchedule"("dataRecebimento");
