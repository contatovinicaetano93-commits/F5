# Gate 4 — Piloto comercial F5

**Objetivo:** 1 indústria pagante + operação semanal rodando na plataforma.

---

## Semana 0 — Fechar piloto

| # | Ação | Responsável |
|---|------|-------------|
| 1 | Escolher indústria (PET Nutri ou Extru recomendado) | Raul + Vinicius |
| 2 | Definir cenário (1–4) — ver `BUSINESS_MODEL.md` | Comercial |
| 3 | Tabela de preço no Drive | Comercial |
| 4 | Contrato / piloto formal (mesmo que simbólico) | Comercial |

---

## Semana 1 — Onboarding tech

| # | Ação | Onde |
|---|------|------|
| 1 | Cadastrar tenant real no admin | `/admin/clientes` |
| 2 | Cadastrar SKUs reais (substituir `PET-NP-*`) | `/admin/catalogo` |
| 3 | Upload 1ª NF-e real | `/admin/nfe` |
| 4 | Import CSV métricas da semana | `/admin/lancamentos` |
| 5 | Insight publicável | `/admin/insights` → visibleToClient |
| 6 | Cliente acessa portal | `/login` → `/cliente` |

---

## Semana 1 — Review com cliente

- [ ] Cliente viu vendas do mês no portal
- [ ] Cliente viu recebimentos D+15/D+60
- [ ] Cliente **não** precisou abrir painel ML/Amazon
- [ ] Feedback anotado → backlog

---

## Métricas Gate 4

| Métrica | Meta |
|---------|------|
| GMV rastreado na plataforma | > 0 |
| NF-e reais processadas | ≥ 1 |
| SKUs monitorados | ≥ 5 |
| Review semanal feita | ✅ |

---

## Comandos úteis

```bash
pnpm db:seed:pilot      # garante SKUs demo (idempotente)
pnpm gate2:validate     # smoke test técnico
```

Ver também: `docs/PILOT_RUNBOOK.md` · `docs/OPERATING_MODEL.md`
