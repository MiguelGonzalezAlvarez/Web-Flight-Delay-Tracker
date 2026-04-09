import {
  FeatureFlagService,
  getFeatureFlagService,
  isFeatureEnabled,
  createFeatureFlagService,
  type FeatureKey,
} from '@/src/lib/featureFlags';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    service = createFeatureFlagService();
  });

  describe('isEnabled', () => {
    it('should return true for enabled flags', () => {
      expect(service.isEnabled('realTimeUpdates')).toBe(true);
      expect(service.isEnabled('delayPredictions')).toBe(true);
    });

    it('should return false for disabled flags', () => {
      expect(service.isEnabled('debugMode')).toBe(false);
    });

    it('should return false for unknown flags', () => {
      expect(service.isEnabled('unknownFeature' as FeatureKey)).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('should enable disabled flag', () => {
      service.setEnabled('debugMode', true);
      expect(service.isEnabled('debugMode')).toBe(true);
    });

    it('should disable enabled flag', () => {
      service.setEnabled('realTimeUpdates', false);
      expect(service.isEnabled('realTimeUpdates')).toBe(false);
    });

    it('should notify listeners when flag changes', () => {
      const listener = jest.fn();
      service.subscribe(listener);
      
      service.setEnabled('debugMode', true);
      
      expect(listener).toHaveBeenCalledWith('debugMode', true);
    });
  });

  describe('setRollout', () => {
    it('should set rollout percentage', () => {
      service.setRollout('debugMode', 50);
      const flag = service.getFlag('debugMode');
      
      expect(flag?.rolloutPercentage).toBe(50);
    });

    it('should apply 100% rollout immediately', () => {
      service.setRollout('airportWeather', 100);
      
      expect(service.isEnabled('airportWeather')).toBe(true);
    });

    it('should apply 0% rollout immediately', () => {
      service.setEnabled('airportWeather', true);
      service.setRollout('airportWeather', 0);
      
      expect(service.isEnabled('airportWeather')).toBe(false);
    });
  });

  describe('getFlag', () => {
    it('should return flag by key', () => {
      const flag = service.getFlag('realTimeUpdates');
      
      expect(flag).toBeDefined();
      expect(flag?.key).toBe('realTimeUpdates');
    });

    it('should return undefined for unknown key', () => {
      const flag = service.getFlag('unknown' as FeatureKey);
      
      expect(flag).toBeUndefined();
    });
  });

  describe('getAllFlags', () => {
    it('should return all flags', () => {
      const flags = service.getAllFlags();
      
      expect(flags.length).toBeGreaterThan(0);
      expect(flags.some((f) => f.key === 'realTimeUpdates')).toBe(true);
    });
  });

  describe('getEnabledFlags', () => {
    it('should return only enabled flags', () => {
      const enabled = service.getEnabledFlags();
      
      expect(enabled.every((f) => f.enabled)).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to flag changes', () => {
      const listener = jest.fn();
      const unsubscribe = service.subscribe(listener);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing', () => {
      const listener = jest.fn();
      const unsubscribe = service.subscribe(listener);
      
      unsubscribe();
      service.setEnabled('debugMode', true);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('loadFromConfig', () => {
    it('should load flags from config object', () => {
      service.loadFromConfig({
        realTimeUpdates: false,
        debugMode: true,
      });
      
      expect(service.isEnabled('realTimeUpdates')).toBe(false);
      expect(service.isEnabled('debugMode')).toBe(true);
    });

    it('should handle rollout config', () => {
      service.loadFromConfig({
        airportWeather: { enabled: true, rolloutPercentage: 100 },
      });
      
      expect(service.isEnabled('airportWeather')).toBe(true);
    });

    it('should ignore unknown keys', () => {
      service.loadFromConfig({
        unknownFeature: true,
      });
      
      expect(service.isEnabled('unknownFeature' as FeatureKey)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset to default flags', () => {
      service.setEnabled('realTimeUpdates', false);
      service.reset();
      
      expect(service.isEnabled('realTimeUpdates')).toBe(true);
    });
  });
});

describe('getFeatureFlagService', () => {
  it('should return singleton instance', () => {
    const service1 = getFeatureFlagService();
    const service2 = getFeatureFlagService();
    
    expect(service1).toBe(service2);
  });
});

describe('isFeatureEnabled', () => {
  it('should check flag status', () => {
    const result = isFeatureEnabled('realTimeUpdates');
    
    expect(typeof result).toBe('boolean');
  });
});
