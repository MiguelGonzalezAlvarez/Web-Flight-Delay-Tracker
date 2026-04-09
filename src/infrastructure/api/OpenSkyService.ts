import { ApiClient, ApiResult, apiSuccess, apiFailure } from './ApiClient';
import { NetworkError } from '../../domain/errors/AppError';
import {
  OpenSkyResponse,
  OpenSkyStateVector,
  OpenSkyBounds,
  normalizeCallsign,
  isSpanishFlight,
} from './OpenSkyTypes';

export interface FlightTrackerConfig {
  openSkyUsername?: string;
  openSkyPassword?: string;
  refreshInterval?: number;
}

const OPENSKY_API_BASE = 'https://opensky-network.org/api';

export class OpenSkyService {
  private client: ApiClient;
  private username?: string;
  private password?: string;

  constructor(config?: FlightTrackerConfig) {
    this.client = new ApiClient({
      baseUrl: OPENSKY_API_BASE,
      timeout: 30000,
    });
    this.username = config?.openSkyUsername;
    this.password = config?.openSkyPassword;
  }

  async getFlightsInBounds(bounds: OpenSkyBounds): Promise<ApiResult<OpenSkyStateVector[]>> {
    const headers: Record<string, string> = {};
    if (this.username && this.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }

    const client = new ApiClient({
      baseUrl: OPENSKY_API_BASE,
      timeout: 30000,
      headers,
    });

    return client.get<OpenSkyResponse>('/flights/all', {
      lamin: bounds.lamin,
      lomin: bounds.lomin,
      lamax: bounds.lamax,
      lomax: bounds.lomax,
    }).then((result) => {
      if (!result.ok) {
        return apiFailure(result.error);
      }
      return apiSuccess(result.value.states ?? []);
    });
  }

  async getSpanishFlightsInBounds(bounds: OpenSkyBounds): Promise<ApiResult<OpenSkyStateVector[]>> {
    const result = await this.getFlightsInBounds(bounds);
    
    if (!result.ok) {
      return apiFailure(result.error);
    }

    const spanishFlights = result.value.filter(isSpanishFlight);
    return apiSuccess(spanishFlights);
  }

  async getAllFlights(): Promise<ApiResult<OpenSkyStateVector[]>> {
    return this.client.get<OpenSkyResponse>('/flights/all', {
      time: Math.floor(Date.now() / 1000),
    }).then((result) => {
      if (!result.ok) {
        return apiFailure(result.error);
      }
      return apiSuccess(result.value.states ?? []);
    });
  }

  async getArrivalsByAirport(
    airport: string,
    begin: number,
    end: number
  ): Promise<ApiResult<OpenSkyStateVector[]>> {
    return this.client.get<OpenSkyResponse>('/flights/arrival', {
      airport,
      begin,
      end,
    }).then((result) => {
      if (!result.ok) {
        return apiFailure(result.error);
      }
      return apiSuccess(result.value.states ?? []);
    });
  }

  async getDeparturesByAirport(
    airport: string,
    begin: number,
    end: number
  ): Promise<ApiResult<OpenSkyStateVector[]>> {
    return this.client.get<OpenSkyResponse>('/flights/departure', {
      airport,
      begin,
      end,
    }).then((result) => {
      if (!result.ok) {
        return apiFailure(result.error);
      }
      return apiSuccess(result.value.states ?? []);
    });
  }

  async getFlightsByCallsign(callsign: string): Promise<ApiResult<OpenSkyStateVector[]>> {
    const normalized = normalizeCallsign(callsign);
    if (!normalized) {
      return apiSuccess([]);
    }

    const result = await this.client.get<OpenSkyResponse>('/flights/all', {
      callsign: normalized,
    });

    if (!result.ok) {
      return apiFailure(result.error);
    }

    const matches = (result.value.states ?? []).filter(
      (state) => normalizeCallsign(state.callsign) === normalized
    );

    return apiSuccess(matches);
  }

  async getFlightsByIcao24(icao24: string): Promise<ApiResult<OpenSkyStateVector[]>> {
    return this.client.get<OpenSkyResponse>('/flights/aircraft', {
      icao24: icao24.toLowerCase(),
    }).then((result) => {
      if (!result.ok) {
        return apiFailure(result.error);
      }
      return apiSuccess(result.value.states ?? []);
    });
  }
}

export const OPENSKY_BOUNDS_SPAIN: OpenSkyBounds = {
  lamin: 36.0,
  lomin: -9.5,
  lamax: 43.8,
  lomax: 3.3,
};

export function createOpenSkyService(config?: FlightTrackerConfig): OpenSkyService {
  return new OpenSkyService(config);
}
