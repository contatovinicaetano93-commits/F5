# 🚀 F5 — Guia de Implementação

Esse documento detalha a implementação MVP que foi criada de forma autônoma.

## ✅ O Que Foi Construído

### 1. **Database Schema** (Prisma)
```
User → NotaFiscal → SalesItem
      → DashboardMetrics
      → PaymentSchedule
```

**Tabelas:**
- `User` — Usuários da plataforma
- `NotaFiscal` — Notas fiscais processadas (XML)
- `SalesItem` — Itens individuais de cada NF
- `DashboardMetrics` — Agregações mensais (atualizam após cada NF)
- `PaymentSchedule` — Calendário de recebimentos (D+15, D+60)

### 2. **NF Parser** (XML → Structured Data)
```
input: nota_fiscal.xml (padrão NF-e SEFAZ)
  ↓
[NfParserService.parseXml]
  ↓
output: {
  nfNumber, nfSeries, nfDate,
  emitente, destinatario,
  valorTotal, items[]
}
```

**Suporta:** Formato NF-e padrão SEFAZ (NFe, nfe, nfeProc)

### 3. **Backend Endpoints**

#### Upload Nota Fiscal
```
POST /api/v1/notas-fiscais/upload
Authorization: Bearer JWT
Content-Type: multipart/form-data

file: nota_fiscal.xml
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "cjk...",
    "nfNumber": "123456",
    "itemsCount": 5,
    "valorTotal": 10500.00
  }
}
```

#### Dashboard KPIs
```
GET /api/v1/dashboard
Authorization: Bearer JWT
```

**Resposta:**
```json
{
  "kpis": {
    "vendas": {
      "valor": 50000,
      "variacao": 15,
      "label": "Vendas Este Mês"
    },
    "custos": {
      "valor": 8500,
      "variacao": -5,
      "label": "Custos Operacionais"
    },
    "estoque": {
      "valor": 1250,
      "variacao": 45,
      "label": "Estoque Total"
    },
    "pagamentos": {
      "valor": 35000,
      "variacao": -5000,
      "label": "Pagamentos a Receber"
    }
  },
  "marketplaceDistribution": {
    "mercadoLivre": 60,
    "amazon": 25,
    "shopee": 15
  },
  "period": {
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-06-22T14:30:00Z"
  }
}
```

#### Recent Sales
```
GET /api/v1/dashboard/sales/recent
Authorization: Bearer JWT
```

---

## 🛠️ Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- pnpm ou npm

### 1. Setup Database
```bash
# Instalar PostgreSQL localmente ou via Docker
docker run --name postgres-f5 -e POSTGRES_PASSWORD=f5dev -p 5432:5432 -d postgres:14

# Criar database
psql -U postgres -h localhost
CREATE DATABASE f5_dev;
```

### 2. Instalar Dependências
```bash
cd /home/user/f5

# Instalar tudo
pnpm install

# Ou apenas API
cd services/api
npm install
```

### 3. Configurar Variáveis
```bash
cd services/api

# Copiar template
cp .env.example .env

# Editar .env
DATABASE_URL="postgresql://postgres:f5dev@localhost:5432/f5_dev"
JWT_SECRET="seu-secret-super-secreto-minimo-64-caracteres-abcdefghijklmnopqrstuvwxyz0123456789"
JWT_EXPIRE="7d"
```

### 4. Rodar Migrations
```bash
cd services/api

# Criar schema
npx prisma migrate dev --name init

# Seed com dados de teste (opcional)
npx prisma db seed
```

### 5. Iniciar API
```bash
cd services/api
npm run dev

# Output:
# [Nest] 12345 - 2026-06-22 10:30:00 [NestFactory] Starting Nest application...
# [Nest] 12345 - 2026-06-22 10:30:00 [InstanceLoader] NfModule dependencies initialized
# [Nest] 12345 - 2026-06-22 10:30:00 [RoutesResolver] AuthController {/auth}:
# ✓ API rodando em http://localhost:3001
```

### 6. Iniciar Web (em outro terminal)
```bash
cd apps/web
npm run dev

# Output:
# > next dev
# ▲ Next.js 14.0.4
# ✓ Ready in 1.5s
# ✓ Web rodando em http://localhost:3000
```

---

## 📝 Fluxo Completo: NF → Dashboard

### Step 1: Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@f5.com", "password": "senha123"}'
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "teste@f5.com" }
}
```

### Step 2: Upload Nota Fiscal
```bash
curl -X POST http://localhost:3001/api/v1/notas-fiscais/upload \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@nota_fiscal.xml"
```

**Backend processa:**
1. Parse XML da NF
2. Extrai SKU, quantidade, valor, marketplace
3. Armazena em `NotaFiscal` + `SalesItem`
4. Atualiza `DashboardMetrics` com totalizações do mês
5. Retorna sucesso com ID da NF

### Step 3: Ver Dashboard
```bash
curl -X GET http://localhost:3001/api/v1/dashboard \
  -H "Authorization: Bearer eyJhbGc..."
```

**Resposta:** KPIs calculados com base em todas as NFs do mês

---

## 🔄 Arquitetura de Dados

### Fluxo NF Upload
```
XML File (cliente)
    ↓
POST /notas-fiscais/upload
    ↓
NfController.uploadNF()
    ├→ Validar arquivo (apenas .xml)
    ├→ Ler conteúdo (UTF-8)
    └→ NfParserService.parseXml()
         ├→ xml2js.parseStringPromise()
         ├→ Extrair campos obrigatórios
         ├→ Mapear para structure ParsedNF
         └→ Detectar marketplace
    ├→ NfService.createNotaFiscal()
    │   ├→ Validar duplicação (unique constraint)
    │   ├→ INSERT NotaFiscal
    │   ├→ INSERT SalesItem[] (bulk)
    │   └→ NfService.updateDashboardMetrics()
    │       ├→ SUM(valorTotal) FROM notas_fiscais WHERE nfDate >= startOfMonth
    │       ├→ COUNT(marketplace) distribution
    │       └→ UPSERT DashboardMetrics
    └→ Resposta JSON com sucesso

GET /dashboard
    ↓
DashboardController.getDashboard()
    ↓
DashboardService.getDashboard()
    ├→ SELECT DashboardMetrics WHERE userId = ?
    ├→ Calcular variações (vs mês passado)
    ├→ Agregar marketplace distribution
    └→ Resposta com KPIs formatados
```

### Cálculos Implementados

**Vendas:**
```
thisMonth = SUM(valorTotal) FROM NF WHERE nfDate >= startOfMonth
lastMonth = SUM(valorTotal) FROM NF WHERE nfDate >= startOfLastMonth AND nfDate < startOfMonth
variacao% = ((thisMonth - lastMonth) / lastMonth) * 100
```

**Custos:**
```
custosOperacionais ≈ thisMonth * 0.17
  = 15% comissão marketplace + 2% logística (média)
  Nota: Será refinado com dados reais de marketplace APIs
```

**Estoque:**
```
total = SUM(quantidade) FROM SalesItem WHERE nfDate >= startOfMonth
```

**Marketplace Distribution:**
```
mercadoLivreQt = SUM(valorTotal) WHERE marketplace = 'Mercado Livre'
mercadoLivrePct = (mercadoLivreQt / totalVendas) * 100
(mesmo para Amazon, Shopee)
```

---

## 📦 Pacotes Compartilhados Atualizados

### `@f5/schemas`
```
src/
├── auth.ts          ← Schemas de autenticação
├── product.ts       ← Schemas de produtos
├── order.ts         ← Schemas de pedidos
├── nf.ts           ← ✅ NOVO: Validação de NF
└── dashboard.ts    ← ✅ NOVO: Validação de KPIs
```

**Uso:**
```typescript
import { notaFiscalSchema, dashboardResponseSchema } from '@f5/schemas';

// Validar upload
const validated = notaFiscalSchema.parse(data);

// Validar resposta dashboard
const dashboard = dashboardResponseSchema.parse(apiResponse);
```

---

## 🧪 Testes Manuais

### Teste 1: Upload com XML válido
```bash
# 1. Criar nota_test.xml com estrutura NF-e
# 2. Fazer login
# 3. POST /upload com arquivo
# ✓ Esperado: 200 OK, ID retornado
```

### Teste 2: Dashboard atualiza após NF
```bash
# 1. GET /dashboard (antes) → vendas: 0
# 2. Upload NF com valorTotal: 10000
# 3. GET /dashboard (depois) → vendas: 10000
# ✓ Esperado: Valores atualizados
```

### Teste 3: Duplicação de NF
```bash
# 1. Upload mesma NF 2x
# ✓ Esperado: Primeira sucesso, segunda erro "já foi processada"
```

---

## 🚀 Próximas Fases

### Phase 2: Integração Marketplace (Semanas 3-8)
- [ ] OAuth flow Mercado Livre
- [ ] Sync automático de vendas
- [ ] Captura de comissões reais
- [ ] Webhook handlers

### Phase 3: Dashboard Avançado (Semanas 9+)
- [ ] Gráficos interativos (Recharts)
- [ ] Filtros (período, marketplace)
- [ ] Relatórios PDF/CSV
- [ ] Previsões

### Phase 4: Mobile App
- [ ] Expo setup
- [ ] Mesmos endpoints
- [ ] Offline mode com SQLite

---

## 📞 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
cd services/api
npm install
npx prisma generate
```

### "database connection refused"
```bash
# Verificar PostgreSQL
psql -U postgres -h localhost

# Se não conectar, iniciar Docker
docker start postgres-f5
```

### "JWT_SECRET too short"
```bash
# Gerar novo secret (64+ chars)
openssl rand -base64 48
# Copiar para .env
```

---

## 📚 Referências

- [Prisma Docs](https://www.prisma.io/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [NF-e SEFAZ](https://www.nfe.fazenda.gov.br)
- [Zod Validation](https://zod.dev)

---

**Status:** ✅ MVP Backend Pronto | ⏳ Aguardando integração com Frontend  
**Próximo:** Conectar Dashboard frontend aos endpoints da API
