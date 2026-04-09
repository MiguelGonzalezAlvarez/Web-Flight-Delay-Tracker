import {
  getConfig,
  getEnvironment,
  isProduction,
  isDevelopment,
  isTest,
  resetConfig,
  setConfig,
  getConfigValue,
  getFeatureFlag,
  type AppConfig,
  type FeatureFlags,
} from '@/src/lib/config';

describe('Config', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('getConfig', () => {
    it('should return default config', () => {
      const config = getConfig();
      
      expect(config).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.cache).toBeDefined();
      expect(config.features).toBeDefined();
      expect(config.ui).toBeDefined();
    });

    it('should return singleton config', () => {
      const config1 = getConfig();
      const config2 = getConfig();
      
      expect(config1).toBe(config2);
    });
  });

  describe('getEnvironment', () => {
    it('should return development by default', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      
      const env = getEnvironment();
      
      expect(env).toBe('development');
      process.env.NODE_ENV = originalEnv;
    });

    it('should return production when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const env = getEnvironment();
      
      expect(env).toBe('production');
      process.env.NODE_ENV = originalEnv;
    });

    it('should return test when NODE_ENV is test', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      const env = getEnvironment();
      
      expect(env).toBe('test');
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('isProduction', () => {
    it('should return true in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      resetConfig();
      
      expect(isProduction()).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      resetConfig();
      
      expect(isDevelopment()).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('isTest', () => {
    it('should return true in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      resetConfig();
      
      expect(isTest()).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('setConfig', () => {
    it('should override config values', () => {
      setConfig({
        ui: {
          defaultAirport: 'LEBL',
          refreshInterval: 30000,
          dateFormat: 'en-US',
          timezone: 'Europe/London',
        },
      });
      
      const config = getConfig();
      
      expect(config.ui.defaultAirport).toBe('LEBL');
    });
  });

  describe('getConfigValue', () => {
    it('should get specific config value', () => {
      const environment = getConfigValue('environment');
      
      expect(environment).toBeDefined();
    });
  });

  describe('getFeatureFlag', () => {
    it('should get feature flag value', () => {
      const flag = getFeatureFlag('enableSpanishFilter');
      
      expect(typeof flag).toBe('boolean');
    });
  });
});

describe('FeatureFlags Integration', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should have default feature flags', () => {
    const config = getConfig();
    
    expect(config.features.enableRealTimeUpdates).toBe(true);
    expect(config.features.enableDelayPredictions).toBe(true);
    expect(config.features.enableSpanishFilter).toBe(true);
  });

  it('should enable debug mode in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    resetConfig();
    
    const config = getConfig();
    
    expect(config.features.enableDebugMode).toBe(true);
    
    process.env.NODE_ENV = originalEnv;
  });
});
