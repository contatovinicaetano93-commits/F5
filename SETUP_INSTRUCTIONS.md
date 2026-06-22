# 🚀 F5 Setup — Próximos Passos

## ✅ Concluído

- [x] Estrutura de monorepo criada
- [x] Pacotes base configurados (@f5/schemas, @f5/core, @f5/ui)
- [x] Apps inicializados (web, mobile, api)
- [x] Git repository inicializado localmente
- [x] PITCH.md documentado
- [x] Commits iniciais criados (2 commits)

## 📁 Estrutura Local

```
/home/user/f5/
├── apps/
│   ├── web/          (Next.js)
│   └── mobile/       (Expo)
├── services/
│   └── api/          (NestJS)
├── packages/
│   ├── schemas/
│   ├── core/
│   ├── ui/
│   └── config/
└── CLAUDE.md + PITCH.md + README.md
```

## 🔧 Próximos Passos

### 1️⃣ Criar Repositório Remote (GitHub)

Você precisa criar o repositório `f5` no GitHub:

```bash
# Opção A: Via GitHub Web
1. Ir para https://github.com/new
2. Repository name: f5
3. Description: F5 - Independent platform (web + api + mobile)
4. Make it Private
5. Click "Create repository"

# Opção B: Via GitHub CLI (se disponível)
gh repo create f5 --private --description "F5 - Independent platform"
```

### 2️⃣ Push para Remote

Após criar o repositório, execute:

```bash
cd /home/user/f5

# Adicione o remote
git remote add origin https://github.com/contatovinicaetano93-commits/f5.git

# Rename branch para main (opcional mas recomendado)
git branch -M main

# Push inicial
git push -u origin main
```

**IMPORTANTE**: Substitua `contatovinicaetano93-commits` pelo seu username GitHub real.

### 3️⃣ Verificar Independência

Para garantir que F5 está 100% independente:

```bash
# Verificar remotes
git remote -v

# Deve mostrar apenas:
# origin  https://github.com/.../f5.git (fetch)
# origin  https://github.com/.../f5.git (push)

# Verificar branch
git branch -a

# Deve mostrar apenas main/master (nenhuma branch de imobi)
```

### 4️⃣ Instalar Dependências

```bash
# Instalar tudo
pnpm install

# Isto vai instalar pacotes de:
# - apps/web
# - apps/mobile
# - services/api
# - packages/*
```

### 5️⃣ Rodar em Desenvolvimento

```bash
# Terminal 1: Tudo em paralelo
pnpm dev

# OU separadamente:

# Terminal 1: Web
cd apps/web && pnpm dev
# http://localhost:3000

# Terminal 2: API
cd services/api && pnpm dev
# http://localhost:3001

# Terminal 3: Mobile
cd apps/mobile && pnpm dev
# Expo on Android/iOS
```

## 📋 Checklist Antes de Começar

- [ ] Repositório `f5` criado no GitHub
- [ ] Remoto adicionado: `git remote add origin`
- [ ] Primeiro push realizado: `git push -u origin main`
- [ ] Dependencies instaladas: `pnpm install`
- [ ] Dev server rodando: `pnpm dev`
- [ ] Lighthouse score verificado
- [ ] TypeScript type-checking OK: `pnpm type-check`

## 🚫 Regras Críticas

### ✅ FAÇA
- Sempre usar `@f5/*` para imports internos
- Committar com mensagens descritivas
- Usar branches feature: `feat/feature-name`
- Type-check antes de push: `pnpm type-check`
- Pull requests com descrição clara

### ❌ NÃO FAÇA
- ❌ Importar de `@imobi/*` ou `@amet/*`
- ❌ Committar `.env` files
- ❌ Push direto para `main` (use PRs)
- ❌ Compartilhar pacotes com outros projetos
- ❌ Desviar da estrutura monorepo

## 📚 Referências

- **CLAUDE.md** — Guia do projeto (regras críticas)
- **PITCH.md** — Visão executiva do projeto
- **README.md** — Quick start
- **Turborepo Docs** — https://turbo.build/repo/docs
- **Monorepo Handbook** — https://monorepo.tools

## 🆘 Troubleshooting

### "Git says 'fatal: not a git repository'"
```bash
cd /home/user/f5
git status
# Deve mostrar "On branch main"
```

### "pnpm install falhando"
```bash
# Limpar cache
rm -rf node_modules pnpm-lock.yaml

# Reinstalar
pnpm install
```

### "TypeScript errors"
```bash
# Regenerar tipos
pnpm type-check

# Se persistir, limpar .turbo
rm -rf .turbo
pnpm build
```

---

**Status**: 🚀 Pronto para desenvolvimento  
**Data**: 2026-06-22  
**Próximo**: Criar repositório remoto e fazer push
