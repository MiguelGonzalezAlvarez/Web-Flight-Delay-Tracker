import { Flight } from '@/src/domain/entities/Flight';
import { PrismaAirportRepository } from '@/src/infrastructure/persistence/PrismaAirportRepository';
import { Airport } from '@/src/domain/entities/Airport';

describe('PrismaAirportRepository', () => {
  let repository: PrismaAirportRepository;

  beforeEach(() => {
    repository = new PrismaAirportRepository();
  });

  describe('findByIcao', () => {
    it('should find airport by ICAO code', async () => {
      const result = await repository.findByIcao('LEMD');

      expect(result).not.toBeNull();
      expect(result!.value.icao.toString()).toBe('LEMD');
    });

    it('should find airport case-insensitively', async () => {
      const result = await repository.findByIcao('lemd');

      expect(result).not.toBeNull();
      expect(result!.value.icao.toString()).toBe('LEMD');
    });

    it('should return null for non-existent ICAO', async () => {
      const result = await repository.findByIcao('XXXX');

      expect(result).toBeNull();
    });
  });

  describe('findByIata', () => {
    it('should find airport by IATA code', async () => {
      const result = await repository.findByIata('MAD');

      expect(result).not.toBeNull();
      expect(result!.value.iata?.toString()).toBe('MAD');
    });

    it('should return null for non-existent IATA', async () => {
      const result = await repository.findByIata('XXX');

      expect(result).toBeNull();
    });
  });

  describe('findSpanishAirports', () => {
    it('should return Spanish airports', async () => {
      const results = await repository.findSpanishAirports();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].value.country).toBe('Spain');
    });
  });

  describe('findByCity', () => {
    it('should find airports by city', async () => {
      const results = await repository.findByCity('Madrid');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].value.city).toBe('Madrid');
    });

    it('should return empty array for unknown city', async () => {
      const results = await repository.findByCity('UnknownCity');

      expect(results).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('should return all airports', async () => {
      const results = await repository.findAll();

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('save', () => {
    it('should save and retrieve a custom airport', async () => {
      const airportResult = Airport.create({
        icao: 'TEST',
        iata: 'TS',
        name: 'Test Airport',
        city: 'Test City',
        country: 'Test Country',
      });

      if (!airportResult.ok) {
        fail('Failed to create airport');
        return;
      }

      const airport = airportResult.value;
      const saveResult = await repository.save(airport);

      expect(saveResult.ok).toBe(true);

      const found = await repository.findByIcao('TEST');
      expect(found).not.toBeNull();
      expect(found!.value.name).toBe('Test Airport');
    });
  });
});
