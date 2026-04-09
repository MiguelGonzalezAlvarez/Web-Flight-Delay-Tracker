export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface AppConfig {
  environment: Environment;
  api: ApiConfig;
  cache: CacheConfig;
  features: FeatureFlags;
  ui: UIConfig;
}

export interface ApiConfig {
  openSky: OpenSkyConfig;
  timeout: number;
  retries: number;
}

export interface OpenSkyConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  refreshInterval: number;
}

export interface CacheConfig {
  flightTTL: number;
  airportTTL: number;
  maxFlights: number;
  maxAirports: number;
}

export interface FeatureFlags {
  enableRealTimeUpdates: boolean;
  enableDelayPredictions: boolean;
  enableSpanishFilter: boolean;
  enableDebugMode: boolean;
}

export interface UIConfig {
  defaultAirport: string;
  refreshInterval: number;
  dateFormat: string;
  timezone: string;
}

const DEFAULT_CONFIG: AppConfig = {
  environment: 'development',
  api: {
    openSky: {
      baseUrl: 'https://opensky-network.org/api',
      refreshInterval: 30000,
    },
    timeout: 30000,
    retries: 3,
  },
  cache: {
    flightTTL: 30000,
    airportTTL: 3600000,
    maxFlights: 500,
    maxAirports: 50,
  },
  features: {
    enableRealTimeUpdates: true,
    enableDelayPredictions: true,
    enableSpanishFilter: true,
    enableDebugMode: false,
  },
  ui: {
    defaultAirport: 'LEMD',
    refreshInterval: 60000,
    dateFormat: 'es-ES',
    timezone: 'Europe/Madrid',
  },
};

let configInstance: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

export function loadConfig(): AppConfig {
  const env = getEnvironment();
  
  return {
    ...DEFAULT_CONFIG,
    environment: env,
    features: {
      ...DEFAULT_CONFIG.features,
      enableDebugMode: env === 'development' || env === 'test',
    },
    api: {
      ...DEFAULT_CONFIG.api,
      openSky: {
        ...DEFAULT_CONFIG.api.openSky,
        username: process.env.OPENSKY_USERNAME,
        password: process.env.OPENSKY_PASSWORD,
      },
    },
  };
}

export function getEnvironment(): Environment {
  const env = (process.env.NODE_ENV || 'development') as string;
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  if (env === 'test') return 'test';
  return 'development';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

export function isTest(): boolean {
  return getEnvironment() === 'test';
}

export function resetConfig(): void {
  configInstance = null;
}

export function setConfig(config: Partial<AppConfig>): void {
  configInstance = {
    ...getConfig(),
    ...config,
  };
}

export function getConfigValue<K extends keyof AppConfig>(
  key: K
): AppConfig[K] {
  return getConfig()[key];
}

export function getFeatureFlag(key: keyof FeatureFlags): boolean {
  return getConfig().features[key];
}

export { isFeatureEnabled } from './featureFlags';
