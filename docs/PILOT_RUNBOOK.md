# F5 — Runbook do Piloto (Gate 2 → 4)

**Tenant piloto:** PET Piloto Nutri · cenário Amazon 1P  
**SKUs:** `PET-NP-001` … `PET-NP-004` (codinomes — sem marca real)

---

## Setup único (produção)

```bash
cd /Users/thaise/Downloads/F5
pnpm db:seed:pilot   # idempotente — não apaga dados
```

Garante 4 SKUs + insight visível ao cliente + dashboard recalculado.

---

## Validação Gate 2 (30 min)

### 1. Admin — NF-e
1. Login: https://f5-industria-digital.vercel.app/admin/login
2. `/admin/nfe` → cliente **PET Piloto Nutri**
3. Baixar **XML de exemplo** → upload
4. Confirmar: itens criados + PaymentSchedule D+60 (Amazon) + D+15 (ML se item ML)

### 2. Admin — CSV métricas
1. `/admin/lancamentos` → importar **CSV exemplo** (4 SKUs)
2. Confirmar: 4 lançamentos + dashboard atualizado

### 3. Portal cliente
1. https://f5-industria-digital.vercel.app/login → senha portal
2. `/cliente` — vendas do mês batem com NF + métricas
3. `/cliente/financeiro` — recebimentos programados
4. `/cliente/produtos` — 4 SKUs com performance

### 4. Idempotência
- Re-upload do **mesmo XML** → erro “NF-e já processada” (sem duplicata)

---

## Fluxo semanal operador

| Dia | Ação |
|-----|------|
| Seg | `/admin` — KPIs + giro baixo |
| Ter–Qua | Marketplaces (manual) |
| Qui | CSV + NF-e real |
| Sex | Insight publicável → cliente vê |

---

## Gate 4 — piloto comercial

- [ ] 1 indústria contratada (PET recomendado)
- [ ] SKUs reais cadastrados (substituir codinomes)
- [ ] 1ª NF-e real do cliente
- [ ] Review semanal — cliente **não** abriu painel ML

---

## Fixtures

| Arquivo | Uso |
|---------|-----|
| `/fixtures/sample-nfe.xml` | Teste upload NF-e |
| `/fixtures/metrics-sample.csv` | Teste import CSV |
