import { Airport } from '../../domain/entities/Airport';
import { AirportRepository } from '../../domain/repositories/AirportRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';

export class InMemoryAirportRepository implements AirportRepository {
  private airports: Map<string, Airport> = new Map();

  async findByIcao(icao: string): Promise<Result<Airport, ValidationError> | null> {
    const airport = this.airports.get(icao.toUpperCase());
    if (!airport) {
      return null;
    }
    return success(airport);
  }

  async findByIata(iata: string): Promise<Result<Airport, ValidationError> | null> {
    for (const airport of this.airports.values()) {
      if (airport.iata?.toString() === iata.toUpperCase()) {
        return success(airport);
      }
    }
    return null;
  }

  async findSpanishAirports(): Promise<Result<Airport, ValidationError>[]> {
    const results: Result<Airport, ValidationError>[] = [];
    for (const airport of this.airports.values()) {
      if (airport.isSpanish()) {
        results.push(success(airport));
      }
    }
    return results;
  }

  async findByCity(city: string): Promise<Result<Airport, ValidationError>[]> {
    const results: Result<Airport, ValidationError>[] = [];
    for (const airport of this.airports.values()) {
      if (airport.city.toLowerCase() === city.toLowerCase()) {
        results.push(success(airport));
      }
    }
    return results;
  }

  async save(airport: Airport): Promise<Result<Airport, ValidationError>> {
    this.airports.set(airport.icao.toString(), airport);
    return success(airport);
  }

  async findAll(): Promise<Result<Airport, ValidationError>[]> {
    const results: Result<Airport, ValidationError>[] = [];
    for (const airport of this.airports.values()) {
      results.push(success(airport));
    }
    return results;
  }

  clear(): void {
    this.airports.clear();
  }

  size(): number {
    return this.airports.size;
  }
}
