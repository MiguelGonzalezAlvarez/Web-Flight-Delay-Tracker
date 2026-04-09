import {
  debounce,
  debounceAsync,
  throttle,
  memoize,
  memoizeAsync,
  LRUCache,
} from '@/src/lib/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const func = jest.fn();
      const debounced = debounce(func, 100);

      debounced();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should only execute once for multiple rapid calls', () => {
      const func = jest.fn();
      const debounced = debounce(func, 100);

      debounced();
      debounced();
      debounced();

      jest.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the function', () => {
      const func = jest.fn();
      const debounced = debounce(func, 100);

      debounced('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('debounceAsync', () => {
    it('should return a promise', async () => {
      const func = jest.fn().mockResolvedValue('result');
      const debounced = debounceAsync(func, 100);

      const promise = debounced();
      expect(promise).toBeInstanceOf(Promise);

      jest.advanceTimersByTime(100);
      const result = await promise;
      expect(result).toBe('result');
    });

    it('should handle async errors', async () => {
      const error = new Error('async error');
      const func = jest.fn().mockRejectedValue(error);
      const debounced = debounceAsync(func, 100);

      const promise = debounced();
      jest.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow('async error');
    });
  });

  describe('throttle', () => {
    it('should execute immediately on first call', () => {
      const func = jest.fn();
      const throttled = throttle(func, 100);

      throttled();
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should ignore subsequent calls within limit', () => {
      const func = jest.fn();
      const throttled = throttle(func, 100);

      throttled();
      throttled();
      throttled();

      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should execute last call after limit expires', () => {
      const func = jest.fn();
      const throttled = throttle(func, 100);

      throttled('first');
      throttled('second');
      throttled('third');

      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(2);
      expect(func).toHaveBeenLastCalledWith('third');
    });
  });

  describe('memoize', () => {
    it('should cache results', () => {
      const func = jest.fn().mockReturnValue('result');
      const memoized = memoize(func);

      const result1 = memoized('key');
      const result2 = memoized('key');

      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should use custom key generator', () => {
      const func = jest.fn().mockReturnValue('result');
      const memoized = memoize(func, (a: string, b: string) => `${a}-${b}`);

      memoized('key1', 'key2');
      memoized('key1', 'key2');

      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should handle different arguments', () => {
      const func = jest.fn().mockImplementation((x: number) => x * 2);
      const memoized = memoize(func);

      expect(memoized(1)).toBe(2);
      expect(memoized(2)).toBe(4);
      expect(func).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoizeAsync', () => {
    it('should cache async results', async () => {
      const func = jest.fn().mockResolvedValue('result');
      const memoized = memoizeAsync(func);

      const [result1, result2] = await Promise.all([
        memoized('key'),
        memoized('key'),
      ]);

      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should allow cache invalidation', async () => {
      let callCount = 0;
      const func = async (k: string) => {
        callCount++;
        return k;
      };
      const memoized = memoizeAsync(func, (k: string) => k);

      await memoized('key');
      await memoized('key');
      expect(callCount).toBe(1);

      await jest.runAllTimersAsync();
      memoized.invalidate('key');
      await memoized('key');
      await jest.runAllTimersAsync();
      expect(callCount).toBe(2);
    });

    it('should allow full cache invalidation', async () => {
      let callCount = 0;
      const func = async (k: string) => {
        callCount++;
        return k;
      };
      const memoized = memoizeAsync(func, (k: string) => k);

      await memoized('key1');
      await memoized('key2');
      await jest.runAllTimersAsync();
      expect(callCount).toBe(2);

      memoized.invalidate();
      await memoized('key1');
      await memoized('key2');
      await jest.runAllTimersAsync();
      expect(callCount).toBe(4);
    });
  });

  describe('LRUCache', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>();

      cache.set('key1', 1);
      expect(cache.get('key1')).toBe(1);
    });

    it('should evict least recently used item when full', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.set('key3', 3);

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe(2);
      expect(cache.get('key3')).toBe(3);
    });

    it('should update existing key as most recent', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.set('key1', 10);
      cache.set('key3', 3);

      expect(cache.get('key1')).toBe(10);
    });

    it('should check for key existence', () => {
      const cache = new LRUCache<string, number>();

      cache.set('key1', 1);

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete keys', () => {
      const cache = new LRUCache<string, number>();

      cache.set('key1', 1);
      expect(cache.delete('key1')).toBe(true);
      expect(cache.has('key1')).toBe(false);
    });

    it('should clear all items', () => {
      const cache = new LRUCache<string, number>();

      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.clear();

      expect(cache.size).toBe(0);
    });

    it('should iterate over keys and values', () => {
      const cache = new LRUCache<string, number>();

      cache.set('key1', 1);
      cache.set('key2', 2);

      const keys = Array.from(cache.keys());
      const values = Array.from(cache.values());
      const entries = Array.from(cache.entries());

      expect(keys).toEqual(['key1', 'key2']);
      expect(values).toEqual([1, 2]);
      expect(entries).toEqual([['key1', 1], ['key2', 2]]);
    });
  });
});
