import { NextResponse } from 'next/server';
import { hasDatabase, prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  let db: 'ok' | 'skip' | 'error' = 'skip';

  if (hasDatabase()) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'error';
    }
  }

  const healthy = db !== 'error';
  const body = {
    status: healthy ? 'ok' : 'degraded',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    db,
    latencyMs: Date.now() - started,
    ts: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
