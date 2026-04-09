import { Cache } from './cache';
import { OpenSkyStateVector, isSpanishFlight } from '../infrastructure/api/OpenSkyTypes';
import { Airport } from '../domain/entities/Airport';
import { Flight } from '../domain/entities/Flight';

export interface CachedFlightData {
  flights: OpenSkyStateVector[];
  lastUpdated: number;
  origin: string;
}

export interface FlightCacheConfig {
  flightTTL?: number;
  airportTTL?: number;
  maxFlights?: number;
  maxAirports?: number;
}

export class FlightCacheService {
  private flightCache: Cache<CachedFlightData>;
  private airportCache: Cache<Airport>;
  private readonly config: Required<FlightCacheConfig>;

  constructor(config: FlightCacheConfig = {}) {
    this.config = {
      flightTTL: config.flightTTL ?? 30000,
      airportTTL: config.airportTTL ?? 3600000,
      maxFlights: config.maxFlights ?? 500,
      maxAirports: config.maxAirports ?? 50,
    };

    this.flightCache = new Cache<CachedFlightData>({
      maxSize: this.config.maxFlights,
      defaultTTL: this.config.flightTTL,
    });

    this.airportCache = new Cache<Airport>({
      maxSize: this.config.maxAirports,
      defaultTTL: this.config.airportTTL,
    });
  }

  getFlightsByAirport(icao: string): OpenSkyStateVector[] | undefined {
    const cached = this.flightCache.get(icao);
    if (cached) {
      return cached.flights;
    }
    return undefined;
  }

  setFlightsByAirport(icao: string, flights: OpenSkyStateVector[]): void {
    const data: CachedFlightData = {
      flights,
      lastUpdated: Date.now(),
      origin: icao,
    };
    this.flightCache.set(icao, data);
  }

  getSpanishFlightsByAirport(icao: string): OpenSkyStateVector[] | undefined {
    const flights = this.getFlightsByAirport(icao);
    if (!flights) {
      return undefined;
    }
    return flights.filter(isSpanishFlight);
  }

  invalidateAirportFlights(icao: string): boolean {
    return this.flightCache.delete(icao);
  }

  invalidateAllFlights(): void {
    this.flightCache.clear();
  }

  getAirport(icao: string): Airport | undefined {
    return this.airportCache.get(icao);
  }

  setAirport(airport: Airport): void {
    this.airportCache.set(airport.icao.toString(), airport);
  }

  invalidateAirport(icao: string): boolean {
    return this.airportCache.delete(icao);
  }

  getCacheStats(): {
    flights: { size: number };
    airports: { size: number };
  } {
    return {
      flights: { size: this.flightCache.size },
      airports: { size: this.airportCache.size },
    };
  }

  cleanup(): number {
    const flightCleaned = this.flightCache.cleanup();
    const airportCleaned = this.airportCache.cleanup();
    return flightCleaned + airportCleaned;
  }

  isFlightCacheValid(icao: string): boolean {
    return this.flightCache.has(icao);
  }

  getFlightCacheAge(icao: string): number | undefined {
    const cached = this.flightCache.get(icao);
    if (!cached) {
      return undefined;
    }
    return Date.now() - cached.lastUpdated;
  }

  shouldRefresh(icao: string, maxAge: number = this.config.flightTTL): boolean {
    const age = this.getFlightCacheAge(icao);
    if (age === undefined) {
      return true;
    }
    return age > maxAge;
  }
}

export function createFlightCacheService(config?: FlightCacheConfig): FlightCacheService {
  return new FlightCacheService(config);
}
