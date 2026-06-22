# F5 — Independent Platform

🚀 **F5** is a complete platform with:
- **Web**: Next.js 14 + Shadcn/UI (TypeScript)
- **Mobile**: Expo 51 + React Native (iOS/Android)
- **API**: NestJS + Fastify (REST/WebSockets)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis

## ⚠️ INDEPENDENCE PRINCIPLE

✅ **F5 is completely independent from imobi and amet**
- No shared packages with other projects
- Own monorepo structure
- Separate Git repository
- Separate deployments

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Type checking
pnpm type-check

# Testing
pnpm test
```

## 📦 Project Structure

```
f5/
├── apps/
│   ├── web/          # Next.js frontend
│   └── mobile/       # Expo + React Native
├── services/
│   └── api/          # NestJS API
├── packages/
│   ├── schemas/      # Zod validation (F5 only)
│   ├── core/         # Utils & hooks (F5 only)
│   ├── ui/           # UI components (F5 only)
│   └── config/       # Shared configs
└── turbo.json        # Monorepo configuration
```

## 🔧 Development

Each workspace is independent but shares base configs through turborepo.

### Web Development
```bash
cd apps/web && pnpm dev
```

### API Development
```bash
cd services/api && pnpm dev
```

### Mobile Development
```bash
cd apps/mobile && pnpm dev
```

---

**Status**: 🚀 Ready for development
**Created**: 2026-06-22
