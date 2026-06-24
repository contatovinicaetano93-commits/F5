/**
 * BullMQ stub — fila NF-e (feature flag, não ativo em produção).
 * Ativar quando NF > 50/dia (Fase 5).
 */

export const NF_QUEUE_ENABLED =
  process.env.NF_QUEUE_ENABLED === 'true' && Boolean(process.env.REDIS_URL);

export type NfProcessJob = {
  tenantId: string;
  xmlContent: string;
  marketplace?: string;
};

export async function enqueueNfProcess(_job: NfProcessJob): Promise<{ queued: boolean }> {
  if (!NF_QUEUE_ENABLED) {
    return { queued: false };
  }
  // TODO: BullMQ + Redis quando volume justificar
  return { queued: false };
}
