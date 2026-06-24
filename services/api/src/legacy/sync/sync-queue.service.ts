// services/api/src/sync/sync-queue.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

export interface SyncJobPayload {
  tenantId: string;
  marketplace: string;
  type: 'inventory' | 'orders' | 'pricing';
}

export interface SyncJobResult {
  jobId: string;
  status: 'completed' | 'failed';
  attempts: number;
  result?: any;
  error?: string;
}

/**
 * STEP 27: Queue system com retry automático
 * Usa BullMQ para processar sincronizações com resiliência
 * Retry exponencial: 1s → 5s → 25s → 2min
 */
@Injectable()
export class SyncQueueService {
  private readonly logger = new Logger(SyncQueueService.name);
  private syncQueue: Queue<SyncJobPayload>;
  private queueEvents: QueueEvents;
  private redis: Redis;

  constructor() {
    // Configuração do Redis (deve vir de ENV em produção)
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

    // Criar fila de sincronização
    this.syncQueue = new Queue<SyncJobPayload>('sync', {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 4, // Total de tentativas: 1 + 3 retries
        backoff: {
          type: 'exponential',
          delay: 1000, // Começa com 1s, depois 5s, 25s, 125s
        },
        removeOnComplete: {
          age: 3600, // Remover jobs completados após 1 hora
        },
        removeOnFail: {
          age: 86400, // Manter jobs falhados por 24h para análise
        },
      },
    });

    // Event listener para monitorar fila
    this.queueEvents = new QueueEvents('sync', {
      connection: this.redis,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.log(`✅ Sync job ${jobId} completed successfully`);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(
        `❌ Sync job ${jobId} failed: ${failedReason}`
      );
    });

    this.queueEvents.on('progress', ({ jobId, data }) => {
      this.logger.debug(`⏳ Sync job ${jobId} progress: ${JSON.stringify(data)}`);
    });
  }

  /**
   * Agendar sync job (neste caso, usado para manual triggers)
   */
  async enqueueSyncJob(payload: SyncJobPayload): Promise<string> {
    const job = await this.syncQueue.add(
      `${payload.type}-${payload.marketplace}`,
      payload,
      {
        jobId: `${payload.tenantId}-${payload.marketplace}-${Date.now()}`,
      }
    );

    this.logger.log(
      `📥 Sync job enqueued: [${payload.marketplace}] ${payload.type}`
    );

    return job.id;
  }

  /**
   * Registrar processador de jobs (chamado por worker separado)
   */
  registerWorker(
    processor: (
      job: any
    ) => Promise<SyncJobResult>
  ): Worker<SyncJobPayload> {
    return new Worker<SyncJobPayload>('sync', processor, {
      connection: this.redis,
      concurrency: 5, // Max 5 jobs em paralelo
    });
  }

  /**
   * Obter status de job
   */
  async getJobStatus(jobId: string): Promise<SyncJobResult | null> {
    const job = await this.syncQueue.getJob(jobId);
    if (!job) return null;

    const progress = job._progress;
    const state = await job.getState();

    return {
      jobId: job.id!,
      status: state === 'completed' ? 'completed' : 'failed',
      attempts: job.attemptsMade,
      result: job.returnvalue,
      error: job.failedReason,
    };
  }

  /**
   * Listar jobs recentes
   */
  async listRecentJobs(limit: number = 50): Promise<SyncJobResult[]> {
    const jobs = await this.syncQueue.getJobs(
      ['completed', 'failed'],
      0,
      limit
    );

    return jobs.map(job => ({
      jobId: job.id!,
      status: (job._progress === 100 ? 'completed' : 'failed') as any,
      attempts: job.attemptsMade,
      result: job.returnvalue,
      error: job.failedReason,
    }));
  }

  /**
   * Obter estatísticas da fila
   */
  async getQueueStats() {
    const counts = await this.syncQueue.getJobCounts();
    const isPaused = await this.syncQueue.isPaused();

    return {
      counts,
      isPaused,
      timestamp: new Date(),
    };
  }

  /**
   * Limpar jobs antigos
   */
  async cleanOldJobs(olderThanMs: number = 604800000) {
    // 7 dias padrão
    const cleanedCount = await this.syncQueue.clean(olderThanMs, 1000);
    this.logger.log(`🧹 Cleaned ${cleanedCount} old jobs`);
    return cleanedCount;
  }

  /**
   * Pausar processamento temporariamente
   */
  async pause() {
    await this.syncQueue.pause();
    this.logger.log('⏸️ Queue paused');
  }

  /**
   * Retomar processamento
   */
  async resume() {
    await this.syncQueue.resume();
    this.logger.log('▶️ Queue resumed');
  }

  /**
   * Cleanup na desativação do serviço
   */
  async onModuleDestroy() {
    await this.queueEvents.close();
    await this.syncQueue.close();
    this.redis.disconnect();
  }
}
