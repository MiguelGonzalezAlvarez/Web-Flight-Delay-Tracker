export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<unknown> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<unknown> | null = null;

  return function (this: unknown, ...args: Parameters<T>): Promise<unknown> {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          timeoutId = null;
          pendingPromise = null;
        }
      }, wait);
    });
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}

export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T & { invalidate: (key?: string) => void } {
  const cache = new Map<string, Promise<unknown>>();
  const results = new Map<string, unknown>();

  const invalidate = (key?: string) => {
    if (key) {
      cache.delete(key);
      results.delete(key);
    } else {
      cache.clear();
      results.clear();
    }
  };

  const memoized = function (this: unknown, ...args: Parameters<T>): Promise<unknown> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = func.apply(this, args) as Promise<unknown>;
    cache.set(key, promise);

    promise.then((result) => {
      results.set(key, result);
    });

    return promise;
  } as T & { invalidate: (key?: string) => void };

  memoized.invalidate = invalidate;
  return memoized;
}

export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  values(): IterableIterator<V> {
    return this.cache.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}
