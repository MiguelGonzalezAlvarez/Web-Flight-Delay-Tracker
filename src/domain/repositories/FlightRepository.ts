import { Flight } from '../entities/Flight';
import { Result } from '../value-objects/Result';
import { ValidationError } from '../value-objects/ValidationError';

export interface FlightRepository {
  findById(id: string): Promise<Result<Flight, ValidationError> | null>;
  findByCallsign(callsign: string): Promise<Result<Flight, ValidationError> | null>;
  findByOrigin(origin: string): Promise<Result<Flight, ValidationError>[]>;
  findByDestination(destination: string): Promise<Result<Flight, ValidationError>[]>;
  findByRoute(origin: string, destination: string): Promise<Result<Flight, ValidationError>[]>;
  findActive(): Promise<Result<Flight, ValidationError>[]>;
  save(flight: Flight): Promise<Result<Flight, ValidationError>>;
  delete(id: string): Promise<Result<void, ValidationError>>;
  findAll(): Promise<Result<Flight, ValidationError>[]>;
}
