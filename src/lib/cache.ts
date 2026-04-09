import { LRUCache } from './performance';

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
}

export class Cache<T> {
  private cache: LRUCache<string, CacheEntry<T>>;
  private readonly defaultTTL: number;

  constructor(config: CacheOptions = {}) {
    this.cache = new LRUCache<string, CacheEntry<T>>(config.maxSize ?? 100);
    this.defaultTTL = config.defaultTTL ?? 60000;
  }

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  getTTL(key: string): number | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    const remaining = entry.ttl - (Date.now() - entry.timestamp);
    return remaining > 0 ? remaining : 0;
  }

  refresh(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    entry.timestamp = Date.now();
    if (ttl !== undefined) {
      entry.ttl = ttl;
    }
    
    return true;
  }

  cleanup(): number {
    let cleaned = 0;
    const keys = Array.from(this.cache.keys());
    
    for (const key of keys) {
      const entry = this.cache.get(key);
      if (entry && this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  get size(): number {
    return this.cache.size;
  }

  get stats(): { size: number; hitRate: number } {
    return {
      size: this.size,
      hitRate: 0,
    };
  }
}

export function createCache<T>(config?: CacheOptions): Cache<T> {
  return new Cache<T>(config);
}
