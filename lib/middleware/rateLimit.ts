const inMemoryStore = new Map<string, { count: number; lastReset: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
  total: number;
}

export interface RateLimitStore {
  get(key: string): Promise<{ count: number; lastReset: number } | null>;
  set(key: string, value: { count: number; lastReset: number }, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
}

class InMemoryStore implements RateLimitStore {
  async get(key: string): Promise<{ count: number; lastReset: number } | null> {
    return inMemoryStore.get(key) || null;
  }

  async set(key: string, value: { count: number; lastReset: number }, _ttlMs: number): Promise<void> {
    inMemoryStore.set(key, value);
  }

  async delete(key: string): Promise<void> {
    inMemoryStore.delete(key);
  }
}

class RedisStore implements RateLimitStore {
  private redisUrl: string;
  private memoryFallback: Map<string, { count: number; lastReset: number }> = new Map();

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl;
  }

  private getFallback(): Map<string, { count: number; lastReset: number }> {
    return this.memoryFallback;
  }

  async get(key: string): Promise<{ count: number; lastReset: number } | null> {
    try {
      const response = await fetch(`${this.redisUrl}/get/${encodeURIComponent(key)}`, {
        signal: AbortSignal.timeout(100),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {
      const fallback = this.getFallback();
      return fallback.get(key) || null;
    }
    const fallback = this.getFallback();
    return fallback.get(key) || null;
  }

  async set(key: string, value: { count: number; lastReset: number }, ttlMs: number): Promise<void> {
    const fallback = this.getFallback();
    fallback.set(key, value);
    try {
      await fetch(`${this.redisUrl}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...value, ttlMs }),
        signal: AbortSignal.timeout(100),
      });
    } catch {
      // Redis unavailable, continue with memory fallback
    }
  }

  async delete(key: string): Promise<void> {
    const fallback = this.getFallback();
    fallback.delete(key);
    try {
      await fetch(`${this.redisUrl}/del/${encodeURIComponent(key)}`, {
        signal: AbortSignal.timeout(100),
      });
    } catch {
      // Redis unavailable, continue with memory fallback
    }
  }
}

export class RateLimiter {
  private store: RateLimitStore;
  private config: Required<RateLimitConfig>;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(config: Partial<RateLimitConfig> = {}) {
    const redisUrl = process.env.REDIS_URL;
    
    this.store = redisUrl ? new RedisStore(redisUrl) : new InMemoryStore();
    
    this.config = {
      windowMs: config.windowMs ?? 60 * 1000,
      maxRequests: config.maxRequests ?? 100,
      keyPrefix: config.keyPrefix ?? 'rl',
    };

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    
    let record = await this.store.get(key);

    if (!record || now - record.lastReset > this.config.windowMs) {
      await this.store.set(key, { count: 1, lastReset: now }, this.config.windowMs);
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetIn: this.config.windowMs,
        total: this.config.maxRequests,
      };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetIn: this.config.windowMs - (now - record.lastReset),
        total: this.config.maxRequests,
      };
    }

    record.count++;
    await this.store.set(key, record, this.config.windowMs);

    return {
      success: true,
      remaining: this.config.maxRequests - record.count,
      resetIn: this.config.windowMs - (now - record.lastReset),
      total: this.config.maxRequests,
    };
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, value] of inMemoryStore.entries()) {
      if (now - value.lastReset > this.config.windowMs * 2) {
        await this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

const globalForLimiter = globalThis as unknown as {
  rateLimiter: RateLimiter | undefined;
};

export const rateLimiter = globalForLimiter.rateLimiter ?? new RateLimiter();

if (process.env.NODE_ENV !== 'production') {
  globalForLimiter.rateLimiter = rateLimiter;
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

export async function rateLimit(
  request: Request,
  options: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const limiter = new RateLimiter(options);
  const identifier = getClientIdentifier(request);
  return limiter.check(identifier);
}
