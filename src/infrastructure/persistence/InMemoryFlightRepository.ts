import { Flight } from '../../domain/entities/Flight';
import { FlightRepository } from '../../domain/repositories/FlightRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';

export class InMemoryFlightRepository implements FlightRepository {
  private flights: Map<string, Flight> = new Map();

  async findById(id: string): Promise<Result<Flight, ValidationError> | null> {
    const flight = this.flights.get(id);
    if (!flight) {
      return null;
    }
    return success(flight);
  }

  async findByCallsign(callsign: string): Promise<Result<Flight, ValidationError> | null> {
    for (const flight of this.flights.values()) {
      if (flight.callsign.toString() === callsign) {
        return success(flight);
      }
    }
    return null;
  }

  async findByOrigin(origin: string): Promise<Result<Flight, ValidationError>[]> {
    const results: Result<Flight, ValidationError>[] = [];
    for (const flight of this.flights.values()) {
      if (flight.origin.toString() === origin) {
        results.push(success(flight));
      }
    }
    return results;
  }

  async findByDestination(destination: string): Promise<Result<Flight, ValidationError>[]> {
    const results: Result<Flight, ValidationError>[] = [];
    for (const flight of this.flights.values()) {
      if (flight.destination.toString() === destination) {
        results.push(success(flight));
      }
    }
    return results;
  }

  async findByRoute(origin: string, destination: string): Promise<Result<Flight, ValidationError>[]> {
    const results: Result<Flight, ValidationError>[] = [];
    for (const flight of this.flights.values()) {
      if (flight.origin.toString() === origin && flight.destination.toString() === destination) {
        results.push(success(flight));
      }
    }
    return results;
  }

  async findActive(): Promise<Result<Flight, ValidationError>[]> {
    const results: Result<Flight, ValidationError>[] = [];
    for (const flight of this.flights.values()) {
      if (flight.isActive()) {
        results.push(success(flight));
      }
    }
    return results;
  }

  async save(flight: Flight): Promise<Result<Flight, ValidationError>> {
    this.flights.set(flight.id, flight);
    return success(flight);
  }

  async delete(id: string): Promise<Result<void, ValidationError>> {
    if (!this.flights.has(id)) {
      return failure(ValidationError.notFound('Flight', id));
    }
    this.flights.delete(id);
    return success(undefined);
  }

  async findAll(): Promise<Result<Flight, ValidationError>[]> {
    const results: Result<Flight, ValidationError>[] = [];
    for (const flight of this.flights.values()) {
      results.push(success(flight));
    }
    return results;
  }

  clear(): void {
    this.flights.clear();
  }

  size(): number {
    return this.flights.size;
  }
}
