import { FlightRepository } from '../../domain/repositories/FlightRepository';
import { AirportRepository } from '../../domain/repositories/AirportRepository';
import { DelayPredictionRepository } from '../../domain/repositories/DelayPredictionRepository';
import { PrismaFlightRepository } from './PrismaFlightRepository';
import { PrismaAirportRepository } from './PrismaAirportRepository';
import { PrismaDelayPredictionRepository } from './PrismaDelayPredictionRepository';
import type { RepositoryFactory } from './RepositoryFactory';

export class PrismaRepositoryFactory implements RepositoryFactory {
  private flightRepo?: PrismaFlightRepository;
  private airportRepo?: PrismaAirportRepository;
  private predictionRepo?: PrismaDelayPredictionRepository;

  createFlightRepository(): FlightRepository {
    if (!this.flightRepo) {
      this.flightRepo = new PrismaFlightRepository();
    }
    return this.flightRepo;
  }

  createAirportRepository(): AirportRepository {
    if (!this.airportRepo) {
      this.airportRepo = new PrismaAirportRepository();
    }
    return this.airportRepo;
  }

  createDelayPredictionRepository(): DelayPredictionRepository {
    if (!this.predictionRepo) {
      this.predictionRepo = new PrismaDelayPredictionRepository();
    }
    return this.predictionRepo;
  }

  getPrismaFlightRepository(): PrismaFlightRepository {
    if (!this.flightRepo) {
      this.flightRepo = new PrismaFlightRepository();
    }
    return this.flightRepo;
  }

  getPrismaDelayPredictionRepository(): PrismaDelayPredictionRepository {
    if (!this.predictionRepo) {
      this.predictionRepo = new PrismaDelayPredictionRepository();
    }
    return this.predictionRepo;
  }
}

let prismaFactoryInstance: PrismaRepositoryFactory | null = null;

export function getPrismaRepositoryFactory(): RepositoryFactory {
  if (!prismaFactoryInstance) {
    prismaFactoryInstance = new PrismaRepositoryFactory();
  }
  return prismaFactoryInstance;
}

export function resetPrismaRepositoryFactory(): void {
  prismaFactoryInstance = null;
}
