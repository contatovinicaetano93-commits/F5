import { prisma } from '@/lib/prisma';

const SYSTEM_EMAIL = 'operator@f5.internal';

/** Usuário técnico para NF-e enviadas pelo admin (sem login Supabase). */
export async function getSystemOperatorId(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: SYSTEM_EMAIL },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: SYSTEM_EMAIL,
      password: 'no-login',
      name: 'F5 Operador Sistema',
      role: 'operator',
    },
  });
  return created.id;
}
