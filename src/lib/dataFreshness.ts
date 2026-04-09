export type FreshnessLevel = 'fresh' | 'stale' | 'expired';

export interface DataFreshnessConfig {
  freshThresholdMs?: number;
  staleThresholdMs?: number;
  warningCallback?: (key: string, level: FreshnessLevel) => void;
}

export interface FreshnessEntry {
  lastUpdate: number;
  updateCount: number;
  averageInterval: number;
}

export class DataFreshnessManager {
  private freshnessData: Map<string, FreshnessEntry> = new Map();
  private listeners: Set<(key: string, level: FreshnessLevel) => void> = new Set();
  private config: {
    freshThresholdMs: number;
    staleThresholdMs: number;
    warningCallback?: (key: string, level: FreshnessLevel) => void;
  };

  constructor(config: DataFreshnessConfig = {}) {
    this.config = {
      freshThresholdMs: config.freshThresholdMs ?? 10000,
      staleThresholdMs: config.staleThresholdMs ?? 60000,
      warningCallback: config.warningCallback,
    };
  }

  recordUpdate(key: string): void {
    const now = Date.now();
    const existing = this.freshnessData.get(key);
    
    if (existing) {
      const interval = now - existing.lastUpdate;
      const newCount = existing.updateCount + 1;
      const newAverageInterval = existing.averageInterval === 0 
        ? interval 
        : (existing.averageInterval * existing.updateCount + interval) / newCount;
      
      this.freshnessData.set(key, {
        lastUpdate: now,
        updateCount: newCount,
        averageInterval: newAverageInterval,
      });
    } else {
      this.freshnessData.set(key, {
        lastUpdate: now,
        updateCount: 1,
        averageInterval: 0,
      });
    }
  }

  getFreshnessLevel(key: string): FreshnessLevel {
    const entry = this.freshnessData.get(key);
    
    if (!entry) {
      return 'expired';
    }

    const age = Date.now() - entry.lastUpdate;

    if (age <= this.config.freshThresholdMs) {
      return 'fresh';
    } else if (age <= this.config.staleThresholdMs) {
      return 'stale';
    } else {
      return 'expired';
    }
  }

  getAge(key: string): number {
    const entry = this.freshnessData.get(key);
    if (!entry) {
      return Infinity;
    }
    return Date.now() - entry.lastUpdate;
  }

  isFresh(key: string): boolean {
    return this.getFreshnessLevel(key) === 'fresh';
  }

  isStale(key: string): boolean {
    return this.getFreshnessLevel(key) === 'stale';
  }

  isExpired(key: string): boolean {
    return this.getFreshnessLevel(key) === 'expired';
  }

  shouldRefresh(key: string): boolean {
    const level = this.getFreshnessLevel(key);
    return level !== 'fresh';
  }

  getNextRefreshTime(key: string): number | undefined {
    const entry = this.freshnessData.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.averageInterval > 0) {
      const timeSinceUpdate = Date.now() - entry.lastUpdate;
      const optimalRefresh = entry.averageInterval * 0.8;
      return Math.max(0, optimalRefresh - timeSinceUpdate);
    }

    return this.config.staleThresholdMs;
  }

  subscribe(listener: (key: string, level: FreshnessLevel) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(key: string, level: FreshnessLevel): void {
    for (const listener of this.listeners) {
      listener(key, level);
    }
    this.config.warningCallback?.(key, level);
  }

  remove(key: string): boolean {
    return this.freshnessData.delete(key);
  }

  clear(): void {
    this.freshnessData.clear();
  }

  getStats(key: string): {
    lastUpdate: number;
    age: number;
    level: FreshnessLevel;
    updateCount: number;
    averageInterval: number;
  } | undefined {
    const entry = this.freshnessData.get(key);
    if (!entry) {
      return undefined;
    }

    return {
      lastUpdate: entry.lastUpdate,
      age: this.getAge(key),
      level: this.getFreshnessLevel(key),
      updateCount: entry.updateCount,
      averageInterval: entry.averageInterval,
    };
  }

  getAllStats(): Map<string, ReturnType<DataFreshnessManager['getStats']>> {
    const stats = new Map<string, ReturnType<DataFreshnessManager['getStats']>>();
    
    for (const key of this.freshnessData.keys()) {
      stats.set(key, this.getStats(key));
    }
    
    return stats;
  }
}

export function createFreshnessManager(config?: DataFreshnessConfig): DataFreshnessManager {
  return new DataFreshnessManager(config ?? {});
}
