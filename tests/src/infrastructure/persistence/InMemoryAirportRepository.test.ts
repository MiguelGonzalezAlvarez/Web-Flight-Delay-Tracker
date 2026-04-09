import { Airport } from '@/src/domain/entities/Airport';
import { InMemoryAirportRepository } from '@/src/infrastructure/persistence/InMemoryAirportRepository';

describe('InMemoryAirportRepository', () => {
  let repository: InMemoryAirportRepository;

  beforeEach(() => {
    repository = new InMemoryAirportRepository();
  });

  const createAirport = (props?: { icao?: string; iata?: string; name?: string; city?: string; country?: string }) => {
    const airport = Airport.createUnsafe({
      icao: props?.icao || 'LEMD',
      iata: props?.iata || 'MAD',
      name: props?.name || 'Adolfo Suárez Madrid–Barajas',
      city: props?.city || 'Madrid',
      country: props?.country || 'Spain',
    });
    return airport;
  };

  describe('save and findByIcao', () => {
    it('should save and retrieve airport by ICAO code', async () => {
      const airport = createAirport({ icao: 'LEBL' });
      await repository.save(airport);

      const result = await repository.findByIcao('LEBL');

      expect(result).not.toBeNull();
      expect(result!.value.icao.toString()).toBe('LEBL');
    });

    it('should be case-insensitive for ICAO search', async () => {
      const airport = createAirport({ icao: 'LEBL' });
      await repository.save(airport);

      const result = await repository.findByIcao('lebl');

      expect(result).not.toBeNull();
    });

    it('should return null for non-existent ICAO', async () => {
      const result = await repository.findByIcao('XXXX');

      expect(result).toBeNull();
    });
  });

  describe('findByIata', () => {
    it('should find airport by IATA code', async () => {
      const airport = createAirport({ icao: 'LEBL', iata: 'BCN' });
      await repository.save(airport);

      const result = await repository.findByIata('BCN');

      expect(result).not.toBeNull();
      expect(result!.value.icao.toString()).toBe('LEBL');
    });

    it('should return null for non-existent IATA', async () => {
      const result = await repository.findByIata('XXX');

      expect(result).toBeNull();
    });
  });

  describe('findSpanishAirports', () => {
    it('should return only Spanish airports', async () => {
      await repository.save(createAirport({ icao: 'LEMD', country: 'Spain' }));
      await repository.save(createAirport({ icao: 'LEBL', country: 'Spain' }));
      await repository.save(createAirport({ icao: 'LFPG', country: 'France' }));

      const results = await repository.findSpanishAirports();

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.value.country === 'Spain')).toBe(true);
    });
  });

  describe('findByCity', () => {
    it('should find airports by city', async () => {
      await repository.save(createAirport({ icao: 'LEMD', city: 'Madrid' }));
      await repository.save(createAirport({ icao: 'LETO', city: 'Madrid' }));
      await repository.save(createAirport({ icao: 'LEBL', city: 'Barcelona' }));

      const results = await repository.findByCity('Madrid');

      expect(results).toHaveLength(2);
    });

    it('should be case-insensitive for city search', async () => {
      await repository.save(createAirport({ icao: 'LEMD', city: 'Madrid' }));

      const results = await repository.findByCity('madrid');

      expect(results).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('should return all airports', async () => {
      await repository.save(createAirport({ icao: 'LEMD' }));
      await repository.save(createAirport({ icao: 'LEBL' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(2);
    });

    it('should return empty array when no airports exist', async () => {
      const results = await repository.findAll();

      expect(results).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all airports', async () => {
      await repository.save(createAirport({ icao: 'LEMD' }));
      await repository.save(createAirport({ icao: 'LEBL' }));

      repository.clear();

      expect(await repository.findAll()).toHaveLength(0);
    });
  });

  describe('size', () => {
    it('should return correct count', async () => {
      expect(repository.size()).toBe(0);
      await repository.save(createAirport({ icao: 'LEMD' }));
      expect(repository.size()).toBe(1);
    });
  });
});
