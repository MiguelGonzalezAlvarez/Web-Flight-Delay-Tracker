import { Airport, AirportProps } from '../../domain/entities/Airport';
import { AirportRepository } from '../../domain/repositories/AirportRepository';
import { Result, success } from '../../domain/value-objects/Result';
import { SPANISH_AIRPORTS } from '../../../lib/airports';

export class PrismaAirportRepository implements AirportRepository {
  private cachedAirports: Map<string, Airport> = new Map();

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    for (const airportData of SPANISH_AIRPORTS) {
      const props: AirportProps = {
        icao: airportData.icao,
        iata: airportData.iata,
        name: airportData.name,
        city: airportData.city,
      };
      const result = Airport.create(props);
      if (result.ok) {
        this.cachedAirports.set(airportData.icao, result.value);
      }
    }
  }

  async findByIcao(icao: string): Promise<Result<Airport, never> | null> {
    const airport = this.cachedAirports.get(icao.toUpperCase());
    if (!airport) {
      return null;
    }
    return success(airport);
  }

  async findByIata(iata: string): Promise<Result<Airport, never> | null> {
    const upperIata = iata.toUpperCase();
    for (const airport of this.cachedAirports.values()) {
      if (airport.iata?.toString() === upperIata) {
        return success(airport);
      }
    }
    return null;
  }

  async findSpanishAirports(): Promise<Result<Airport, never>[]> {
    const results: Result<Airport, never>[] = [];
    for (const airport of this.cachedAirports.values()) {
      if (airport.isSpanish()) {
        results.push(success(airport));
      }
    }
    return results;
  }

  async findByCity(city: string): Promise<Result<Airport, never>[]> {
    const results: Result<Airport, never>[] = [];
    const lowerCity = city.toLowerCase();
    for (const airport of this.cachedAirports.values()) {
      if (airport.city.toLowerCase() === lowerCity) {
        results.push(success(airport));
      }
    }
    return results;
  }

  async save(airport: Airport): Promise<Result<Airport, never>> {
    this.cachedAirports.set(airport.icao.toString(), airport);
    return success(airport);
  }

  async findAll(): Promise<Result<Airport, never>[]> {
    const results: Result<Airport, never>[] = [];
    for (const airport of this.cachedAirports.values()) {
      results.push(success(airport));
    }
    return results;
  }
}
