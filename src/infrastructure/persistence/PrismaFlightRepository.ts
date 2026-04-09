import { Flight, FlightProps } from '../../domain/entities/Flight';
import { FlightRepository } from '../../domain/repositories/FlightRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';
import { prisma } from '../../../lib/prisma';

export class PrismaFlightRepository implements FlightRepository {
  async findById(id: string): Promise<Result<Flight, ValidationError> | null> {
    try {
      const record = await prisma.flight.findUnique({ where: { id } });
      if (!record) {
        return null;
      }
      return this.mapToEntity(record);
    } catch {
      return failure(ValidationError.invalid('Flight', 'Database error'));
    }
  }

  async findByCallsign(callsign: string): Promise<Result<Flight, ValidationError> | null> {
    try {
      const record = await prisma.flight.findFirst({
        where: { callsign: callsign.toUpperCase() },
      });
      if (!record) {
        return null;
      }
      return this.mapToEntity(record);
    } catch {
      return failure(ValidationError.invalid('Flight', 'Database error'));
    }
  }

  async findByOrigin(origin: string): Promise<Result<Flight, ValidationError>[]> {
    try {
      const records = await prisma.flight.findMany({
        where: { origin: origin.toUpperCase() },
      });
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<Flight, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  async findByDestination(destination: string): Promise<Result<Flight, ValidationError>[]> {
    try {
      const records = await prisma.flight.findMany({
        where: { destination: destination.toUpperCase() },
      });
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<Flight, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  async findByRoute(origin: string, destination: string): Promise<Result<Flight, ValidationError>[]> {
    try {
      const records = await prisma.flight.findMany({
        where: {
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
        },
      });
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<Flight, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  async findActive(): Promise<Result<Flight, ValidationError>[]> {
    try {
      const records = await prisma.flight.findMany({
        where: {
          status: { in: ['scheduled', 'boarding', 'departed'] },
        },
      });
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<Flight, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  async save(flight: Flight): Promise<Result<Flight, ValidationError>> {
    try {
      const plain = flight.toPlainObject();
      await prisma.flight.upsert({
        where: { id: flight.id },
        create: {
          id: flight.id,
          icao24: plain.callsign,
          callsign: plain.callsign,
          origin: plain.origin,
          destination: plain.destination,
          airline: plain.airline,
          departureTime: plain.departureTime ?? null,
          arrivalTime: plain.arrivalTime ?? null,
          estimatedTime: null,
          status: plain.status ?? 'unknown',
          latitude: undefined,
          longitude: undefined,
          altitude: undefined,
        },
        update: {
          callsign: plain.callsign,
          origin: plain.origin,
          destination: plain.destination,
          airline: plain.airline,
          departureTime: plain.departureTime ?? null,
          arrivalTime: plain.arrivalTime ?? null,
          status: plain.status ?? 'unknown',
        },
      });
      return success(flight);
    } catch {
      return failure(ValidationError.invalid('Flight', 'Failed to save'));
    }
  }

  async delete(id: string): Promise<Result<void, ValidationError>> {
    try {
      const exists = await prisma.flight.findUnique({ where: { id } });
      if (!exists) {
        return failure(ValidationError.notFound('Flight', id));
      }
      await prisma.flight.delete({ where: { id } });
      return success(undefined);
    } catch {
      return failure(ValidationError.invalid('Flight', 'Failed to delete'));
    }
  }

  async findAll(): Promise<Result<Flight, ValidationError>[]> {
    try {
      const records = await prisma.flight.findMany();
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<Flight, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  private mapToEntity(
    record: {
      id: string;
      icao24: string;
      callsign: string;
      origin: string;
      destination: string;
      airline: string;
      departureTime: Date | null;
      arrivalTime: Date | null;
      estimatedTime: Date | null;
      status: string;
    }
  ): Result<Flight, ValidationError> | null {
    const props: FlightProps = {
      id: record.id,
      callsign: record.callsign,
      airline: record.airline,
      origin: record.origin,
      destination: record.destination,
      departureTime: record.departureTime || undefined,
      arrivalTime: record.arrivalTime || undefined,
      status: record.status as FlightProps['status'],
    };
    return Flight.create(props);
  }
}
