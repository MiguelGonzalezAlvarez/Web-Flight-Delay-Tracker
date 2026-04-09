export { FlightMapper, AirportMapper, DelayPredictionMapper } from './mappers';

export {
  InMemoryFlightRepository,
  InMemoryAirportRepository,
  InMemoryDelayPredictionRepository,
  DefaultRepositoryFactory,
  getRepositoryFactory,
  resetRepositoryFactory,
} from './persistence';
export type { RepositoryFactory } from './persistence/RepositoryFactory';

export {
  PrismaFlightRepository,
  PrismaAirportRepository,
  PrismaDelayPredictionRepository,
  PrismaRepositoryFactory,
  getPrismaRepositoryFactory,
  resetPrismaRepositoryFactory,
} from './persistence';

export { ApiClient, createApiClient } from './api';
export type { ApiClientConfig, ApiResponse, ApiResult } from './api';
export { apiSuccess, apiFailure } from './api';

export { OpenSkyService, createOpenSkyService, OPENSKY_BOUNDS_SPAIN } from './api';
export type { FlightTrackerConfig } from './api';
