# F5 — Plano de Construção (50 Steps)

**Objetivo:** Sistema completo Indústria → Marketplace com Dashboard Operacional  
**Stack:** Next.js + Supabase + Vercel  
**Público:** Indústrias brasileiras  
**Modelo:** Multi-tenant SaaS com RLS

---

## 📊 Estrutura do Plano

```
FASE 1: Arquitetura & Setup (Steps 1-10)          [1-2 dias]
FASE 2: Database & Modelos (Steps 11-20)         [2-3 dias]
FASE 3: P0 Sincronização (Steps 21-30)           [3-4 dias]
FASE 4: P0 Dashboard (Steps 31-40)                [2-3 dias]
FASE 5: Integração Real (Steps 41-50)            [3-4 dias]

TOTAL ESTIMADO: 11-17 dias (autônomo)
```

---

## ⚙️ FASE 1: Arquitetura & Setup (Steps 1-10)

### Step 1: Definir estrutura de diretórios Next.js + Supabase
**O quê:** Criar monorepo F5 com apps/web (Next.js), services/api, packages/schemas  
**Aceitação:** Estrutura pronta com tsconfig.json, eslint.config.js  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 2: Configurar Supabase (banco de dados PostgreSQL)
**O quê:** Criar projeto Supabase, conectar via connection string  
**Aceitação:** `SUPABASE_URL` e `SUPABASE_KEY` rodando  
**Tempo:** 30min  
**Bloqueador:** Acesso Supabase

### Step 3: Implementar autenticação Supabase + Next.js (multi-tenant)
**O quê:** Auth.js v5 ou Supabase Auth com role-based access (admin, operador, financeiro)  
**Aceitação:** Login funcional, JWT com tenant_id no payload  
**Tempo:** 2h  
**Bloqueador:** Nenhum

### Step 4: Setup de variáveis de ambiente (.env.local, .env.example)
**O quê:** Todos os secrets para Supabase, API Keys, marketplaces  
**Aceitação:** `.env.example` documentado, `.env.local` gitignored  
**Tempo:** 30min  
**Bloqueador:** Nenhum

### Step 5: Criar esquema de permissões RLS (Row Level Security) no Supabase
**O quê:** Policies para multi-tenant (cada user vê apenas dados do seu tenant)  
**Aceitação:** SELECT/INSERT/UPDATE/DELETE com tenant_id filtrado  
**Tempo:** 1h  
**Bloqueador:** Entender RLS Supabase

### Step 6: Implementar layout base Next.js (sidebar, header, breadcrumb)
**O quê:** Componentes reutilizáveis, tema F5 (Navy, Blue, Cyan)  
**Aceitação:** Dashboard master layout pronto em /dashboard/[tenant]  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 7: Criar API routes base (/api/v1/...)
**O quê:** Estructura de routes, middleware de autenticação JWT  
**Aceitação:** POST/GET/PATCH/DELETE com validação Zod  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 8: Setup de logging e error tracking (Sentry ou similar)
**O quê:** Captureexceções, logs estruturados  
**Aceitação:** Erros sendo registrados em painel  
**Tempo:** 1h  
**Bloqueador:** Acesso Sentry

### Step 9: Configurar CI/CD (GitHub Actions ou Vercel)
**O quê:** Auto-deploy em push, testes antes de deploy  
**Aceitação:** Branch master → produção automático  
**Tempo:** 1h  
**Bloqueador:** Repositório remoto F5 criado

### Step 10: Criar documentação de arquitetura (ADRs)
**O quê:** Architecture Decision Records explicando escolhas  
**Aceitação:** `/docs/architecture/` com diagrama e rationale  
**Tempo:** 1h  
**Bloqueador:** Nenhum

---

## 🗄️ FASE 2: Database & Modelos (Steps 11-20)

### Step 11: Criar tabela `tenants` (organizações/indústrias)
**O quê:** nome, cnpj, plan, logo, status  
**Aceitação:** Tabela com RLS, foreign key para users  
**Tempo:** 30min  
**Bloqueador:** Nenhum

### Step 12: Criar tabela `users` (multi-tenant)
**O quê:** email, role (admin/operador/financeiro), tenant_id, status  
**Aceitação:** RLS aplicada, usuário só vê próprio tenant  
**Tempo:** 30min  
**Bloqueador:** Nenhum

### Step 13: Criar tabela `products` (catálogo)
**O quê:** sku, nome, descricao, categoria, imagens, atributos JSON  
**Aceitação:** Suporta variantes (tamanho, cor, etc)  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 14: Criar tabela `product_variants` (sku + cores/tamanhos)
**O quê:** variant_id, product_id, sku, nome (ex: "XL-Azul")  
**Aceitação:** Relação 1:N com products  
**Tempo:** 30min  
**Bloqueador:** Nenhum

### Step 15: Criar tabela `inventory` (estoque por marketplace)
**O quê:** product_variant_id, marketplace (ML/Shopee/Amazon), quantidade, reservado  
**Aceitação:** RLS por tenant, índices em product_variant_id  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 16: Criar tabela `pricing_policies` (preço mínimo + margem por canal)
**O quê:** product_variant_id, marketplace, preco_minimo, margem_minima_pct  
**Aceitação:** Validação em triggers SQL  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 17: Criar tabela `orders` (pedidos unificados)
**O quê:** order_id, marketplace_order_id, status (new/processing/shipped/delivered), cliente_nome, valor_total, comissao_marketplace  
**Aceitação:** Indexado por data, status  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 18: Criar tabela `order_items` (itens de cada pedido)
**O quê:** order_id, product_variant_id, quantidade, preco_unitario, subtotal  
**Aceitação:** Relação N:M orders → products  
**Tempo:** 30min  
**Bloqueador:** Nenhum

### Step 19: Criar tabela `marketplace_credentials` (OAuth tokens)
**O quê:** tenant_id, marketplace, access_token, refresh_token, status, last_sync  
**Aceitação:** Criptografado em repouso (Supabase Vault)  
**Tempo:** 1h  
**Bloqueador:** Entender Supabase Vault

### Step 20: Criar tabela `sync_logs` (histórico de sincronizações)
**O quê:** tenant_id, marketplace, tipo (estoque/pedidos/preço), status, erro, timestamp  
**Aceitação:** Audit trail para debug  
**Tempo:** 30min  
**Bloqueador:** Nenhum

---

## 🔄 FASE 3: P0 Sincronização (Steps 21-30)

### Step 21: Criar worker de sincronização de estoque (bidirecional)
**O quê:** Cron job que puxa estoque de cada marketplace a cada 5min  
**Aceitação:** Função rodando em background, atualiza inventory table  
**Tempo:** 2h  
**Bloqueador:** Nenhum (mock primeira vez)

### Step 22: Implementar API para atualizar estoque local
**O quê:** PATCH /api/v1/inventory/variant/:id com quantidade  
**Aceitação:** Valida estoque mínimo, registra sync_log  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 23: Criar mapeamento de categorias por marketplace
**O quê:** ML (Eletrônicos → 1000), Shopee (Electronics → 2000), Amazon (category_id)  
**Aceitação:** Tabela `category_mappings` com conversão automática  
**Tempo:** 1.5h  
**Bloqueador:** Documentação de categorias de cada marketplace

### Step 24: Implementar sincronização de pedidos (feed unificado)
**O quê:** Puxa pedidos de todos os marketplaces em 1 fila ordenada  
**Aceitação:** GET /api/v1/orders retorna todos (ML+Shopee+Amazon) mixed  
**Tempo:** 2h  
**Bloqueador:** Nenhum (mock primeira vez)

### Step 25: Criar endpoint de webhook para pedidos em tempo real
**O quê:** POST /api/v1/webhooks/order para ML/Shopee enviarem pedidos  
**Aceitação:** Recebe novo pedido → cria order no DB em <1s  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 26: Implementar validação de estoque ao criar pedido
**O quê:** Ao novo order chegar, reserva quantidade em inventory  
**Aceitação:** Se não há estoque → order fica em status "waitlist"  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 27: Criar sistema de fila de sincronização com retry
**O quê:** Bull MQ ou Supabase edge functions para retry automático  
**Aceitação:** Se sincronização falhar, tenta novamente 3x com backoff  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum (simplificar primeira versão)

### Step 28: Implementar deteção de conflitos de estoque
**O quê:** Se 2 pedidos chegam simultâneos e há apenas 1 unidade → alerta  
**Aceitação:** Log de conflito, notifica operador  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 29: Criar testes E2E de sincronização
**O quê:** Mock de 3 marketplaces, simula pedidos simultâneos  
**Aceitação:** Testes passando, cobertura >80%  
**Tempo:** 2h  
**Bloqueador:** Nenhum

### Step 30: Documentar fluxo de sincronização (diagrama)
**O quê:** ASCII diagrams ou Mermaid do fluxo: marketplace → webhook → DB → sync_log  
**Aceitação:** Documentação com exemplos de curl  
**Tempo:** 1h  
**Bloqueador:** Nenhum

---

## 📈 FASE 4: P0 Dashboard (Steps 31-40)

### Step 31: Criar página `/dashboard/[tenant]/overview`
**O quê:** Visão geral com KPIs principais (GMV, estoque, pedidos)  
**Aceitação:** Cards mostrando números reais do DB  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 32: Implementar **PAINEL DE MARGEM REAL** (KPI prioritário)
**O quê:** Tabela: SKU | GMV Bruto | Comissão ML (16-22%) | Frete | Devoluções | Ads | Lucro Real  
**Aceitação:** Cálculo: GMV - comissão - frete - devoluções - ads = lucro  
**Tempo:** 2h  
**Bloqueador:** Nenhum

### Step 33: Adicionar filtros no painel de margem
**O quê:** Por período, marketplace, categoria, margem mínima  
**Aceitação:** Filtros refazem cálculos em real-time  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 34: Criar gráfico de tendência (vendas MoM)
**O quê:** Linha chart mostrando GMV nos últimos 6 meses  
**Aceitação:** Recharts com dados agregados por mês  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 35: Implementar painel de estoque (real-time)
**O quê:** Mostra quantidade de cada variante em cada marketplace  
**Aceitação:** Highlight em vermelho se stockout  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 36: Criar feed unificado de pedidos
**O quê:** Lista todos os pedidos (ML+Shopee+Amazon) com filtros  
**Aceitação:** Ordena por data, mostra status, cliente, valor  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 37: Adicionar alertas automáticos no dashboard
**O quê:** Notificações de: estoque baixo, pedido cancelado, reputação caiu  
**Aceitação:** Badge no header com conta de alertas  
**Tempo:** 1h  
**Bloqueador:** Nenhum

### Step 38: Implementar export de relatórios (PDF/CSV)
**O quê:** Exporta painel de margem em CSV  
**Aceitação:** Download via botão, com timestamp  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 39: Criar página de reputação/saúde
**O quê:** ML termômetro, NPS, taxa cancelamento, SLA resposta  
**Aceitação:** Visão consolidada de satisfação por marketplace  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 40: Adicionar responsividade mobile
**O quê:** Dashboard funciona em celular  
**Aceitação:** Breakpoints Tailwind aplicados, testado em iPhone  
**Tempo:** 1h  
**Bloqueador:** Nenhum

---

## 🔌 FASE 5: Integração Real (Steps 41-50)

### Step 41: Implementar OAuth com Mercado Livre
**O quê:** Fluxo completo: /auth/ml → redirect ML → callback → token salvo  
**Aceitação:** marketplace_credentials preenchido, refresh automático  
**Tempo:** 2h  
**Bloqueador:** ML Sandbox credentials

### Step 42: Criar conector ML (pull de estoque real)
**O quê:** Busca estoque real via ML API `/inventories/{listing_id}`  
**Aceitação:** Sincroniza para inventory table  
**Tempo:** 1.5h  
**Bloqueador:** ML API access

### Step 43: Criar conector ML (push de estoque)
**O quê:** Envia estoque local para ML via API  
**Aceitação:** Quando inventory muda → atualiza ML em <2min  
**Tempo:** 1.5h  
**Bloqueador:** ML API access

### Step 44: Implementar pull de pedidos ML (real-time)
**O quê:** Webhook ou polling de pedidos, cria order no DB  
**Aceitação:** Novo pedido ML → aparece em feed em <10s  
**Tempo:** 1.5h  
**Bloqueador:** ML API access

### Step 45: Criar conector Shopee (OAuth + estoque)
**O quê:** Similar ao ML, mas com Shopee API  
**Aceitação:** Marketplace_credentials funciona com Shopee também  
**Tempo:** 1.5h  
**Bloqueador:** Shopee credentials

### Step 46: Implementar precificação dinâmica com regras
**O quê:** Sistema de regras: se estoque < 10 → sobe preço 5%, se concorrente abaixou → baixa 3%  
**Aceitação:** Tabela `pricing_rules`, executa a cada 1h  
**Tempo:** 2h  
**Bloqueador:** Entender lógica de pricing

### Step 47: Criar motor de anúncios em massa (pause/publish)
**O quê:** Seleciona múltiplos produtos → pausar todos na ML  
**Aceitação:** Bulk action com 1 clique, API chama ML em paralelo  
**Tempo:** 1.5h  
**Bloqueador:** Nenhum

### Step 48: Implementar rastreamento de comissões pagas
**O quê:** Puxa relatório financeiro de cada MP, calcula comissão real  
**Aceitação:** Coluna "comissão_real_paga" atualiza semanalmente  
**Tempo:** 1.5h  
**Bloqueador:** APIs financeiras de cada MP

### Step 49: Criar dashboard de KPIs financeiros
**O quê:** CAC por canal, ROAS ML Ads, saldo a receber, ROI categoria  
**Aceitação:** Todos os KPIs do briefing financeiro visíveis  
**Tempo:** 2h  
**Bloqueador:** Nenhum

### Step 50: Deploys em produção (Vercel) + documentação final
**O quê:** Código pronto para produção, testes passando, docs atualizada  
**Aceitação:** App rodando em `app.f5.com` (ou similar), com SSL  
**Tempo:** 1.5h  
**Bloqueador:** Domínio + Vercel setup

---

## 📊 Resumo por Fase

| Fase | Steps | Dias | Deliverable |
|------|-------|------|-------------|
| **Arquitetura & Setup** | 1-10 | 1-2 | Next.js + Supabase pronto, auth funciona |
| **Database & Modelos** | 11-20 | 2-3 | Schema completo, RLS aplicada |
| **P0 Sincronização** | 21-30 | 3-4 | Estoque + pedidos sincronizados (mock) |
| **P0 Dashboard** | 31-40 | 2-3 | Margem Real, KPIs, alertas funcionando |
| **Integração Real** | 41-50 | 3-4 | ML + Shopee conectados, production ready |
| **TOTAL** | **1-50** | **11-17** | **SaaS pronto para beta** |

---

## 🎯 Decisões de Design

### Multi-tenant RLS Strategy
```sql
-- Todas as tabelas têm tenant_id
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  ...
);

-- Policy automática: user vê apenas seu tenant
CREATE POLICY tenant_isolation ON products
USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

### Sincronização Strategy
- **Push vs Pull:** Pull a cada 5min (cron), Push via webhook (real-time pedidos)
- **Conflito:** Último write vence, mas loga tudo em sync_logs
- **Retry:** Max 3 tentativas com backoff exponencial

### Pricing Policy
- **Mínimo travado:** `price = MAX(custo * (1 + margem_min%), comissao_estimada * 1.2)`
- **Dinâmica:** Regras customizáveis por tenant

### KPI Prioritário: Margem Real
```
Lucro Real = GMV Bruto 
           - Comissão Marketplace (16-22%) 
           - Frete (estimado ou real)
           - Devoluções (% histórico)
           - Ads (se rodou)
           = Lucro Líquido
```

---

## ⚠️ Bloqueadores Identificados

| Bloqueador | Impacto | Solução |
|-----------|---------|---------|
| Repositório remoto F5 | Alto | Criar em servidor Git antes de começar |
| ML API Sandbox | Alto (Step 41+) | Solicitar acesso, usar mocks temporariamente |
| Shopee API credentials | Médio (Step 45+) | Pode fazer Shopee depois, ML primeiro |
| Domínio app.f5.com | Médio (Step 50) | Deploy em subdomain Vercel temporário |

---

## 🚀 Recomendações

1. **Validar arquitetura ANTES de começar** — Steps 1-10 são críticos
2. **Database design é bloqueador** — Se errar aqui, tudo fica lento (Steps 11-20)
3. **Começar com ML (não Shopee)** — 70% das vendas são ML, mais simples
4. **Mock de APIs primeira iteração** — Acelera desenvolvimento, integração real depois
5. **Dashboard de Margem Real é ouro puro** — Esse é o diferencial competitivo

---

## ✅ Próxima Ação

**Você valida esse plano?**

```
[ ] Aprova 100% do plano
[ ] Quer ajustar algum step
[ ] Quer remover ou adicionar steps
[ ] Quer mudar ordem de prioridade
[ ] Quer começar já (com mocks primeiro)
```

Fala qual opção e eu começo os Step 1-10 imediatamente! 🚀
