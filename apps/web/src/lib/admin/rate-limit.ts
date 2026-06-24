import { hasDatabase, prisma } from '@/lib/prisma';

const MAX_LOGIN_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export type LoginRateLimitScope = 'admin' | 'client';

const memoryAttempts = new Map<string, number[]>();

function memoryKey(ip: string, scope: LoginRateLimitScope): string {
  return `${scope}:${ip}`;
}

function pruneMemory(key: string, now: number) {
  const attempts = memoryAttempts.get(key) ?? [];
  const recent = attempts.filter((t) => now - t < WINDOW_MS);
  if (recent.length === 0) memoryAttempts.delete(key);
  else memoryAttempts.set(key, recent);
}

function isMemoryRateLimited(ip: string, scope: LoginRateLimitScope): boolean {
  const now = Date.now();
  const key = memoryKey(ip, scope);
  pruneMemory(key, now);
  const attempts = memoryAttempts.get(key) ?? [];
  return attempts.length >= MAX_LOGIN_ATTEMPTS;
}

function recordMemoryFailure(ip: string, scope: LoginRateLimitScope) {
  const now = Date.now();
  const key = memoryKey(ip, scope);
  pruneMemory(key, now);
  const attempts = memoryAttempts.get(key) ?? [];
  attempts.push(now);
  memoryAttempts.set(key, attempts);
}

export async function isAdminLoginRateLimited(ip: string): Promise<boolean> {
  if (ip === 'unknown') return false;

  if (hasDatabase()) {
    const since = new Date(Date.now() - WINDOW_MS);
    const count = await prisma.adminAuditLog.count({
      where: {
        ip,
        action: 'admin.login_failed',
        createdAt: { gte: since },
      },
    });
    return count >= MAX_LOGIN_ATTEMPTS;
  }

  return isMemoryRateLimited(ip, 'admin');
}

export async function recordAdminLoginFailure(ip: string): Promise<void> {
  if (!hasDatabase()) {
    recordMemoryFailure(ip, 'admin');
  }
}

export function isClientLoginRateLimited(ip: string): boolean {
  if (ip === 'unknown') return false;
  return isMemoryRateLimited(ip, 'client');
}

export function recordClientLoginFailure(ip: string): void {
  recordMemoryFailure(ip, 'client');
}
