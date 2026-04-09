import { DataFreshnessManager, FreshnessLevel } from '@/src/lib/dataFreshness';

describe('DataFreshnessManager', () => {
  let manager: DataFreshnessManager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new DataFreshnessManager({
      freshThresholdMs: 1000,
      staleThresholdMs: 5000,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordUpdate', () => {
    it('should record first update', () => {
      manager.recordUpdate('key1');
      expect(manager.getAge('key1')).toBe(0);
    });

    it('should calculate average interval on subsequent updates', () => {
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(1000);
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(1000);
      manager.recordUpdate('key1');

      const stats = manager.getStats('key1');
      expect(stats?.updateCount).toBe(3);
      expect(stats?.averageInterval).toBe(1000);
    });
  });

  describe('getFreshnessLevel', () => {
    it('should return fresh for recently updated data', () => {
      manager.recordUpdate('key1');
      expect(manager.getFreshnessLevel('key1')).toBe('fresh');
    });

    it('should return stale after fresh threshold', () => {
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(2000);
      expect(manager.getFreshnessLevel('key1')).toBe('stale');
    });

    it('should return expired after stale threshold', () => {
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(6000);
      expect(manager.getFreshnessLevel('key1')).toBe('expired');
    });

    it('should return expired for unknown key', () => {
      expect(manager.getFreshnessLevel('unknown')).toBe('expired');
    });
  });

  describe('isFresh, isStale, isExpired', () => {
    it('should correctly identify freshness state', () => {
      manager.recordUpdate('key1');
      
      expect(manager.isFresh('key1')).toBe(true);
      expect(manager.isStale('key1')).toBe(false);
      expect(manager.isExpired('key1')).toBe(false);

      jest.advanceTimersByTime(2000);
      expect(manager.isFresh('key1')).toBe(false);
      expect(manager.isStale('key1')).toBe(true);

      jest.advanceTimersByTime(4000);
      expect(manager.isExpired('key1')).toBe(true);
    });
  });

  describe('shouldRefresh', () => {
    it('should return false for fresh data', () => {
      manager.recordUpdate('key1');
      expect(manager.shouldRefresh('key1')).toBe(false);
    });

    it('should return true for stale data', () => {
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(2000);
      expect(manager.shouldRefresh('key1')).toBe(true);
    });
  });

  describe('getNextRefreshTime', () => {
    it('should return undefined for unknown key', () => {
      expect(manager.getNextRefreshTime('unknown')).toBeUndefined();
    });

    it('should return optimal refresh time based on average interval', () => {
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(2000);
      manager.recordUpdate('key1');

      const nextRefresh = manager.getNextRefreshTime('key1');
      expect(nextRefresh).toBeGreaterThan(0);
    });
  });

  describe('subscribe', () => {
    it('should allow subscribing and unsubscribing', () => {
      const listener = jest.fn();
      const unsubscribe = manager.subscribe(listener);
      
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
      expect(manager.subscribe(listener)).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove entry', () => {
      manager.recordUpdate('key1');
      expect(manager.remove('key1')).toBe(true);
      expect(manager.getFreshnessLevel('key1')).toBe('expired');
    });

    it('should return false for unknown key', () => {
      expect(manager.remove('unknown')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      manager.recordUpdate('key1');
      manager.recordUpdate('key2');
      manager.clear();
      
      expect(manager.getFreshnessLevel('key1')).toBe('expired');
      expect(manager.getFreshnessLevel('key2')).toBe('expired');
    });
  });

  describe('getStats', () => {
    it('should return stats for existing key', () => {
      manager.recordUpdate('key1');
      jest.advanceTimersByTime(500);
      
      const stats = manager.getStats('key1');
      
      expect(stats).toBeDefined();
      expect(stats!.updateCount).toBe(1);
      expect(stats!.age).toBe(500);
      expect(stats!.level).toBe('fresh');
    });

    it('should return undefined for unknown key', () => {
      expect(manager.getStats('unknown')).toBeUndefined();
    });
  });

  describe('getAllStats', () => {
    it('should return stats for all keys', () => {
      manager.recordUpdate('key1');
      manager.recordUpdate('key2');
      
      const allStats = manager.getAllStats();
      
      expect(allStats.size).toBe(2);
      expect(allStats.has('key1')).toBe(true);
      expect(allStats.has('key2')).toBe(true);
    });
  });
});
