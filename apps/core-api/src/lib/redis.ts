import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => console.log('[redis] Connected'));
redis.on('error', (err) => console.error('[redis] Error:', err));

/**
 * Publish a contract analysis job to the Redis queue.
 * The Celery worker in ai-backend will pick this up.
 */
export async function publishAnalysisJob(payload: {
  contractId: string;
  fileKey: string;
  counterpartyName: string | null;
}): Promise<void> {
  // Celery task message format (JSON)
  const message = JSON.stringify({
    task: 'worker.analyse_contract',
    id: `${payload.contractId}-${Date.now()}`,
    args: [],
    kwargs: payload,
    retries: 0,
  });

  await redis.lpush('celery', message);
  console.log(`[redis] Queued analysis job for contract ${payload.contractId}`);
}
