# F5 API — Backend

NestJS + Fastify backend para F5 (Marketplace Operations Platform).

## 🚀 Estrutura

```
src/
├── auth/           # Autenticação JWT
├── nf/             # Nota Fiscal processing
│   ├── nf.controller.ts      # POST /api/v1/notas-fiscais/upload
│   ├── nf.service.ts         # Lógica de processamento
│   └── nf-parser.service.ts  # Parser XML da NF
├── dashboard/      # KPIs e métricas
│   ├── dashboard.controller.ts  # GET /api/v1/dashboard
│   └── dashboard.service.ts     # Cálculo de métricas
├── prisma/         # Database
└── main.ts         # Entry point
```

## 📦 Setup

### 1. Instalar dependências
```bash
cd services/api
npm install
# ou
pnpm install
```

### 2. Configurar banco de dados

```bash
# Criar arquivo .env
cp .env.example .env

# Editar .env com suas credenciais
DATABASE_URL="postgresql://user:password@localhost:5432/f5_dev"
JWT_SECRET="seu-secret-aqui-minimo-64-caracteres"
```

### 3. Rodar migrations
```bash
npx prisma migrate dev --name init
```

### 4. Iniciar desenvolvimento
```bash
npm run dev
```

API rodará em `http://localhost:3001`

## 📚 Endpoints

### Autenticação
- `POST /auth/login` — Login (email + password)
- `POST /auth/register` — Registro
- `POST /auth/refresh` — Refresh token

### Nota Fiscal
- `POST /api/v1/notas-fiscais/upload` — Upload XML da NF
- `GET /api/v1/notas-fiscais` — Listar NFs do usuário
- `GET /api/v1/notas-fiscais/:id` — Detalhe de uma NF

### Dashboard
- `GET /api/v1/dashboard` — KPIs (Vendas, Custos, Estoque, Pagamentos)
- `GET /api/v1/dashboard/sales/recent` — 10 últimas vendas

## 🔄 Fluxo NF

```
1. Usuário faz login → JWT gerado
2. POST /notas-fiscais/upload (XML file)
3. Backend:
   - Parser XML
   - Extrai SKU, quantidade, valor, marketplace
   - Armazena em PostgreSQL
   - Atualiza DashboardMetrics
4. Frontend: GET /dashboard → mostra dados atualizados
```

## 🗄️ Banco de Dados

### Tabelas principais
- `User` — Usuários da plataforma
- `NotaFiscal` — Notas fiscais processadas
- `SalesItem` — Itens de cada NF
- `DashboardMetrics` — Agregações (atualizado após cada NF)
- `PaymentSchedule` — Calendário de recebimentos

### Migrations
```bash
npx prisma migrate dev           # Rodar migrations
npx prisma migrate reset         # Reset database (dev only)
npx prisma studio               # UI para explorar dados
```

## 🧪 Testes

```bash
npm run test                # Testes unitários
npm run test:e2e           # Testes E2E
npm run test:cov           # Coverage
```

## 📊 Exemplo: Upload de NF

### Request
```bash
curl -X POST http://localhost:3001/api/v1/notas-fiscais/upload \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "file=@nota_fiscal.xml"
```

### Response
```json
{
  "success": true,
  "message": "Nota fiscal processada com sucesso",
  "data": {
    "id": "cjk12345",
    "nfNumber": "123456",
    "itemsCount": 5,
    "valorTotal": 10500.00
  }
}
```

## 🔐 Segurança

- JWT com 7 dias de expiração
- Rate limiting em todos endpoints
- Validação Zod em requests
- CORS configurado
- SQL injection protection (Prisma ORM)

## 🚨 Troubleshooting

### "database connection refused"
- Verificar se PostgreSQL está rodando
- Confirmar DATABASE_URL em .env

### "Prisma Client not found"
```bash
npx prisma generate
```

### "JWT_SECRET too short"
```bash
openssl rand -base64 48
# Copiar para .env
```

## 📝 TODOs

- [ ] Integração com Mercado Livre API
- [ ] Integração com Amazon SP-API
- [ ] Job queue para processamento assíncrono (BullMQ)
- [ ] Webhooks para eventos de marketplace
- [ ] Testes E2E completos
