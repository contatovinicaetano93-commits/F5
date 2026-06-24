# F5 — Guia do Agente

Consulte antes de trabalhar autonomamente:

1. **`docs/AUTONOMOUS_BACKLOG.md`** — memória dos 100 passos (status ✅/⬜/⚠️)
2. **`docs/EXECUTION_PLAN.md`** — fases e gates de negócio
3. **`docs/OPERATING_MODEL.md`** — o que é operação vs software

## Validação obrigatória antes de PR

```bash
pnpm ci:check
pnpm gate1:validate && pnpm gate2:validate && pnpm gate3:validate
```

## Anti-patterns (nunca)

- Importar de imobi/amet
- OAuth marketplace no MVP
- Sync estoque a cada 5 min
- Nomes reais de clientes em landing pública

## Resiliência

- Sem DB → fallback demo (dev only)
- Produção exige `DATABASE_URL` + auth configurado
- `/api/health` para probes
