# Upload NF-e XML — troubleshooting

Rota: `/admin/nfe` → Upload XML  
API: `POST /api/admin/nfs/upload`

## Requisitos

- Arquivo `.xml` até **5 MB**
- Tenant selecionado
- NF-e modelo 55 (SEFAZ) com `infNFe`

## Formatos aceitos

- `NFe` / `nfe` / `nfeProc` (XML autorizado com protocolo)

## Idempotência

Mesmo `nNF` + `série` + `CNPJ emitente` não processa duas vezes.

## Erros frequentes

| Mensagem | Causa | Ação |
|----------|-------|------|
| Formato não reconhecido | XML não é NF-e | Verificar export do ERP |
| Campos obrigatórios ausentes | XML incompleto | Reexportar do emissor |
| NF-e já processada | Reupload | OK — ignorar ou conferir admin |
| Arquivo excede limite | > 5 MB | Compactar ou dividir (operação) |

## Fixture de teste

`apps/web/public/fixtures/sample-nfe.xml`

## Após upload

1. Itens vinculados ao catálogo (match por SKU/descrição)
2. `PaymentSchedule` D+15 (ML/Shopee) ou D+60 (Amazon)
3. `DashboardMetrics` recalculado automaticamente

Validar: `pnpm gate2:validate`
