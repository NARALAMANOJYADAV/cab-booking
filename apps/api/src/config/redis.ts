import Redis from 'ioredis';
import { config } from './index.js';

class MemoryCache {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.delete(key);
    return existed ? 1 : 0;
  }
}

let redisClient: Redis | MemoryCache;

export function getRedisClient(): Redis | MemoryCache {
  if (redisClient) return redisClient;

  try {
    const client = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: () => null // Do not retry indefinitely if local redis isn't running
    });

    client.on('error', (err) => {
      console.warn('[Redis] Connection not active, using resilient in-memory fallback store:', err.message);
      redisClient = new MemoryCache();
    });

    client.on('connect', () => {
      console.log('[Redis] Connected to Redis cache service.');
    });

    redisClient = client;
  } catch (err) {
    console.warn('[Redis] Redis initialization failed, using resilient in-memory cache.');
    redisClient = new MemoryCache();
  }

  return redisClient;
}
