import {
  PrismaRepositoryFactory,
  getPrismaRepositoryFactory,
  resetPrismaRepositoryFactory,
} from '@/src/infrastructure/persistence/PrismaRepositoryFactory';

describe('PrismaRepositoryFactory', () => {
  beforeEach(() => {
    resetPrismaRepositoryFactory();
  });

  describe('getPrismaRepositoryFactory', () => {
    it('should return a repository factory instance', () => {
      const factory = getPrismaRepositoryFactory();

      expect(factory).not.toBeNull();
      expect(typeof factory.createFlightRepository).toBe('function');
      expect(typeof factory.createAirportRepository).toBe('function');
      expect(typeof factory.createDelayPredictionRepository).toBe('function');
    });

    it('should return the same instance on subsequent calls', () => {
      const factory1 = getPrismaRepositoryFactory();
      const factory2 = getPrismaRepositoryFactory();

      expect(factory1).toBe(factory2);
    });

    it('should create flight repository', () => {
      const factory = getPrismaRepositoryFactory();
      const flightRepo = factory.createFlightRepository();

      expect(flightRepo).not.toBeNull();
      expect(typeof flightRepo.findById).toBe('function');
      expect(typeof flightRepo.save).toBe('function');
    });

    it('should create airport repository', () => {
      const factory = getPrismaRepositoryFactory();
      const airportRepo = factory.createAirportRepository();

      expect(airportRepo).not.toBeNull();
      expect(typeof airportRepo.findByIcao).toBe('function');
    });

    it('should create delay prediction repository', () => {
      const factory = getPrismaRepositoryFactory();
      const predictionRepo = factory.createDelayPredictionRepository();

      expect(predictionRepo).not.toBeNull();
      expect(typeof predictionRepo.findByFlightId).toBe('function');
    });
  });

  describe('PrismaRepositoryFactory', () => {
    it('should create singleton repositories', () => {
      const factory = new PrismaRepositoryFactory();
      const repo1 = factory.createFlightRepository();
      const repo2 = factory.createFlightRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return typed repositories from getter methods', () => {
      const factory = new PrismaRepositoryFactory();

      factory.createFlightRepository();
      const flightRepo = factory.getPrismaFlightRepository();

      expect(flightRepo).not.toBeNull();
    });

    it('should return typed delay prediction repository', () => {
      const factory = new PrismaRepositoryFactory();

      factory.createDelayPredictionRepository();
      const predictionRepo = factory.getPrismaDelayPredictionRepository();

      expect(predictionRepo).not.toBeNull();
    });
  });

  describe('resetPrismaRepositoryFactory', () => {
    it('should reset the singleton instance', () => {
      const factory1 = getPrismaRepositoryFactory();
      resetPrismaRepositoryFactory();
      const factory2 = getPrismaRepositoryFactory();

      expect(factory1).not.toBe(factory2);
    });
  });
});
