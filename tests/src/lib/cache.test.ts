import { Cache } from '@/src/lib/cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>({ maxSize: 3, defaultTTL: 100 });
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeUndefined();
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return value within TTL', () => {
      cache.set('key', 'value', 1000);
      jest.advanceTimersByTime(500);
      expect(cache.get('key')).toBe('value');
    });

    it('should expire values after TTL', () => {
      cache.set('key', 'value', 100);
      jest.advanceTimersByTime(150);
      expect(cache.get('key')).toBeUndefined();
    });

    it('should respect custom TTL per entry', () => {
      cache.set('key1', 'value1', 50);
      cache.set('key2', 'value2', 200);
      
      jest.advanceTimersByTime(75);
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should use default TTL when not specified', () => {
      cache = new Cache<string>({ defaultTTL: 50 });
      cache.set('key', 'value');
      
      jest.advanceTimersByTime(75);
      expect(cache.get('key')).toBeUndefined();
    });
  });

  describe('has', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for existing non-expired entries', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('should return false for expired entries', () => {
      cache.set('key', 'value', 50);
      jest.advanceTimersByTime(100);
      expect(cache.has('key')).toBe(false);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('non-existent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove entry', () => {
      cache.set('key', 'value');
      expect(cache.delete('key')).toBe(true);
      expect(cache.get('key')).toBeUndefined();
    });

    it('should return false for non-existent keys', () => {
      expect(cache.delete('non-existent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size).toBe(0);
    });
  });

  describe('getTTL', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return remaining TTL', () => {
      cache.set('key', 'value', 1000);
      jest.advanceTimersByTime(300);
      const ttl = cache.getTTL('key');
      expect(ttl).toBeGreaterThan(600);
      expect(ttl).toBeLessThanOrEqual(700);
    });

    it('should return 0 for expired entries', () => {
      cache.set('key', 'value', 50);
      jest.advanceTimersByTime(100);
      expect(cache.getTTL('key')).toBe(0);
    });

    it('should return undefined for non-existent entries', () => {
      expect(cache.getTTL('non-existent')).toBeUndefined();
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should reset TTL timestamp', () => {
      cache.set('key', 'value', 100);
      jest.advanceTimersByTime(50);
      cache.refresh('key');
      jest.advanceTimersByTime(50);
      expect(cache.get('key')).toBe('value');
    });

    it('should allow updating TTL', () => {
      cache.set('key', 'value', 50);
      jest.advanceTimersByTime(25);
      cache.refresh('key', 200);
      jest.advanceTimersByTime(150);
      expect(cache.get('key')).toBe('value');
    });

    it('should return false for non-existent keys', () => {
      expect(cache.refresh('non-existent')).toBe(false);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should remove expired entries', () => {
      cache.set('key1', 'value1', 50);
      cache.set('key2', 'value2', 100);
      jest.advanceTimersByTime(75);
      
      const cleaned = cache.cleanup();
      
      expect(cleaned).toBe(1);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.get('key1');
      cache.set('key4', 'value4');
      
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeUndefined();
    });
  });
});
