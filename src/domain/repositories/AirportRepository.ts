import { Airport } from '../entities/Airport';
import { Result } from '../value-objects/Result';
import { ValidationError } from '../value-objects/ValidationError';

export interface AirportRepository {
  findByIcao(icao: string): Promise<Result<Airport, ValidationError> | null>;
  findByIata(iata: string): Promise<Result<Airport, ValidationError> | null>;
  findSpanishAirports(): Promise<Result<Airport, ValidationError>[]>;
  findByCity(city: string): Promise<Result<Airport, ValidationError>[]>;
  save(airport: Airport): Promise<Result<Airport, ValidationError>>;
  findAll(): Promise<Result<Airport, ValidationError>[]>;
}
