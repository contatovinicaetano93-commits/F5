import { hasDatabase, prisma } from '@/lib/prisma';

const MAX_LOGIN_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const memoryAttempts = new Map<string, number[]>();

function pruneMemory(ip: string, now: number) {
  const attempts = memoryAttempts.get(ip) ?? [];
  const recent = attempts.filter((t) => now - t < WINDOW_MS);
  if (recent.length === 0) memoryAttempts.delete(ip);
  else memoryAttempts.set(ip, recent);
}

function isMemoryRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneMemory(ip, now);
  const attempts = memoryAttempts.get(ip) ?? [];
  return attempts.length >= MAX_LOGIN_ATTEMPTS;
}

function recordMemoryFailure(ip: string) {
  const now = Date.now();
  pruneMemory(ip, now);
  const attempts = memoryAttempts.get(ip) ?? [];
  attempts.push(now);
  memoryAttempts.set(ip, attempts);
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

  return isMemoryRateLimited(ip);
}

export async function recordAdminLoginFailure(ip: string): Promise<void> {
  if (!hasDatabase()) {
    recordMemoryFailure(ip);
  }
}
