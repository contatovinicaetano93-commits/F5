import { NextResponse } from 'next/server';
import { hasDatabase } from '@/lib/prisma';
import { isProductionDeploy } from '@/lib/env';

export type AdminSystemMode = 'production' | 'demo';

export interface AdminSystemStatus {
  mode: AdminSystemMode;
  db: 'ok' | 'skip';
  persistence: 'postgresql' | 'memory';
  writesBlocked: boolean;
}

export function getAdminSystemStatus(): AdminSystemStatus {
  const hasDb = hasDatabase();
  return {
    mode: hasDb ? 'production' : 'demo',
    db: hasDb ? 'ok' : 'skip',
    persistence: hasDb ? 'postgresql' : 'memory',
    writesBlocked: !hasDb && isProductionDeploy(),
  };
}

/** Bloqueia mutações em produção sem DATABASE_URL (evita achar que salvou). */
export function requireDatabaseForWrite(): NextResponse | null {
  if (!hasDatabase() && isProductionDeploy()) {
    return NextResponse.json(
      {
        error:
          'Banco não configurado. Defina DATABASE_URL na Vercel para persistir dados.',
      },
      { status: 503 },
    );
  }
  return null;
}
