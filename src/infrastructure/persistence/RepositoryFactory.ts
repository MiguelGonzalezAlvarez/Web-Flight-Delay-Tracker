import { FlightRepository } from '../../domain/repositories/FlightRepository';
import { AirportRepository } from '../../domain/repositories/AirportRepository';
import { DelayPredictionRepository } from '../../domain/repositories/DelayPredictionRepository';
import { InMemoryFlightRepository } from './InMemoryFlightRepository';
import { InMemoryAirportRepository } from './InMemoryAirportRepository';
import { InMemoryDelayPredictionRepository } from './InMemoryDelayPredictionRepository';

export interface RepositoryFactory {
  createFlightRepository(): FlightRepository;
  createAirportRepository(): AirportRepository;
  createDelayPredictionRepository(): DelayPredictionRepository;
}

export class DefaultRepositoryFactory implements RepositoryFactory {
  private flightRepo?: InMemoryFlightRepository;
  private airportRepo?: InMemoryAirportRepository;
  private predictionRepo?: InMemoryDelayPredictionRepository;

  createFlightRepository(): FlightRepository {
    if (!this.flightRepo) {
      this.flightRepo = new InMemoryFlightRepository();
    }
    return this.flightRepo;
  }

  createAirportRepository(): AirportRepository {
    if (!this.airportRepo) {
      this.airportRepo = new InMemoryAirportRepository();
    }
    return this.airportRepo;
  }

  createDelayPredictionRepository(): DelayPredictionRepository {
    if (!this.predictionRepo) {
      this.predictionRepo = new InMemoryDelayPredictionRepository();
    }
    return this.predictionRepo;
  }

  getInMemoryFlightRepository(): InMemoryFlightRepository {
    if (!this.flightRepo) {
      this.flightRepo = new InMemoryFlightRepository();
    }
    return this.flightRepo;
  }

  getInMemoryAirportRepository(): InMemoryAirportRepository {
    if (!this.airportRepo) {
      this.airportRepo = new InMemoryAirportRepository();
    }
    return this.airportRepo;
  }

  getInMemoryDelayPredictionRepository(): InMemoryDelayPredictionRepository {
    if (!this.predictionRepo) {
      this.predictionRepo = new InMemoryDelayPredictionRepository();
    }
    return this.predictionRepo;
  }
}

let factoryInstance: DefaultRepositoryFactory | null = null;

export function getRepositoryFactory(): RepositoryFactory {
  if (!factoryInstance) {
    factoryInstance = new DefaultRepositoryFactory();
  }
  return factoryInstance;
}

export function resetRepositoryFactory(): void {
  factoryInstance = null;
}
