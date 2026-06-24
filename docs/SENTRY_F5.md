# Sentry F5 — projeto separado do imobi

**Objetivo:** erros do F5 em `f5-web`, sem misturar com o projeto `javascript` / imobi.

| | imobi | F5 |
|---|-------|-----|
| Org Sentry | `imobi-hl` (mesma conta) | `imobi-hl` |
| Projeto | `javascript` (ou imobi) | **`f5-web`** |
| DSN | ❌ não reutilizar | ✅ próprio |

Código já configurado: `next.config.js` → org `imobi-hl`, project `f5-web`.

---

## Criar o projeto (Owner/Manager da org)

> A API retorna **403** para Members — só **Owner** ou **Manager** da org `imobi-hl` consegue criar.

1. Abra https://imobi-hl.sentry.io  
2. Menu **Projects** → **Create Project**  
3. Platform: **Next.js**  
4. Nome do projeto: **`f5-web`**  
5. Team: **imobi**  
6. **Create Project**

Alternativa (habilitar Members):  
**Settings → General Settings** → permitir que Members criem projetos (se disponível no plano).

---

## Copiar DSN

1. No projeto **f5-web** → **Settings → Client Keys (DSN)**  
2. Copie a URL (formato `https://…@…ingest.us.sentry.io/…`)

---

## Vercel (`f5-industria-digital`)

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do f5-web |
| `SENTRY_DSN` | mesmo DSN |
| `SENTRY_AUTH_TOKEN` | (opcional) token para source maps |
| `SENTRY_ORG` | `imobi-hl` |
| `SENTRY_PROJECT` | `f5-web` |

Ambientes: **Production** + **Preview** → **Redeploy**.

---

## Local (opcional)

Em `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_DSN=https://...
```

Source maps no build local:

```bash
cp apps/web/.env.sentry-build-plugin.example apps/web/.env.sentry-build-plugin
# editar SENTRY_AUTH_TOKEN
```

---

## Verificar

1. Deploy concluído  
2. Console do browser em https://f5-industria-digital.vercel.app:

```javascript
throw new Error('F5 Sentry test');
```

3. Issue deve aparecer em: https://imobi-hl.sentry.io/issues/?project=f5-web  
   (não no projeto `javascript`)

---

## Futuro

Quando a API Nest subir no Render: criar **`f5-api`** (mesma org, DSN separado).
