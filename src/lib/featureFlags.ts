export type FeatureKey = 
  | 'realTimeUpdates'
  | 'delayPredictions'
  | 'spanishFilter'
  | 'debugMode'
  | 'advancedSearch'
  | 'flightTracking'
  | 'airportWeather';

export interface FeatureFlag {
  key: FeatureKey;
  enabled: boolean;
  rolloutPercentage?: number;
  description: string;
}

export interface FeatureFlagConfig {
  [key: string]: boolean | { enabled: boolean; rolloutPercentage?: number };
}

class FeatureFlagService {
  private flags: Map<FeatureKey, FeatureFlag> = new Map();
  private listeners: Set<(key: FeatureKey, enabled: boolean) => void> = new Set();

  constructor() {
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'realTimeUpdates',
        enabled: true,
        description: 'Enable real-time flight updates via WebSocket/polling',
      },
      {
        key: 'delayPredictions',
        enabled: true,
        description: 'Enable delay prediction service',
      },
      {
        key: 'spanishFilter',
        enabled: true,
        rolloutPercentage: 100,
        description: 'Filter flights to Spanish airports only',
      },
      {
        key: 'debugMode',
        enabled: false,
        description: 'Enable debug mode with additional logging',
      },
      {
        key: 'advancedSearch',
        enabled: true,
        description: 'Enable advanced flight search features',
      },
      {
        key: 'flightTracking',
        enabled: true,
        description: 'Enable individual flight tracking',
      },
      {
        key: 'airportWeather',
        enabled: false,
        rolloutPercentage: 0,
        description: 'Show weather information for airports',
      },
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.key, flag);
    }
  }

  isEnabled(key: FeatureKey): boolean {
    const flag = this.flags.get(key);
    if (!flag) {
      return false;
    }

    if (flag.rolloutPercentage !== undefined) {
      return this.isInRollout(flag.rolloutPercentage);
    }

    return flag.enabled;
  }

  private isInRollout(percentage: number): boolean {
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;
    return Math.random() * 100 < percentage;
  }

  setEnabled(key: FeatureKey, enabled: boolean): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.enabled = enabled;
      this.notifyListeners(key, enabled);
    }
  }

  setRollout(key: FeatureKey, percentage: number): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.rolloutPercentage = percentage;
    }
  }

  getFlag(key: FeatureKey): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getEnabledFlags(): FeatureFlag[] {
    return this.getAllFlags().filter((flag) => this.isEnabled(flag.key));
  }

  subscribe(listener: (key: FeatureKey, enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(key: FeatureKey, enabled: boolean): void {
    for (const listener of this.listeners) {
      listener(key, enabled);
    }
  }

  loadFromConfig(config: FeatureFlagConfig): void {
    for (const [key, value] of Object.entries(config)) {
      const featureKey = this.normalizeKey(key);
      if (!featureKey) continue;

      if (typeof value === 'boolean') {
        this.setEnabled(featureKey, value);
      } else if (typeof value === 'object') {
        this.setEnabled(featureKey, value.enabled);
        if (value.rolloutPercentage !== undefined) {
          this.setRollout(featureKey, value.rolloutPercentage);
        }
      }
    }
  }

  private normalizeKey(key: string): FeatureKey | null {
    const normalized = key.replace(/-/g, '').toLowerCase();
    
    const mapping: Record<string, FeatureKey> = {
      realtimeupdates: 'realTimeUpdates',
      delaypredictions: 'delayPredictions',
      spanishfilter: 'spanishFilter',
      debugmode: 'debugMode',
      advancedsearch: 'advancedSearch',
      flighttracking: 'flightTracking',
      airportweather: 'airportWeather',
    };

    return mapping[normalized] || null;
  }

  reset(): void {
    this.flags.clear();
    this.initializeDefaultFlags();
  }
}

let featureFlagService: FeatureFlagService | null = null;

export function getFeatureFlagService(): FeatureFlagService {
  if (!featureFlagService) {
    featureFlagService = new FeatureFlagService();
  }
  return featureFlagService;
}

export function isFeatureEnabled(key: FeatureKey): boolean {
  return getFeatureFlagService().isEnabled(key);
}

export function createFeatureFlagService(): FeatureFlagService {
  featureFlagService = new FeatureFlagService();
  return featureFlagService;
}
