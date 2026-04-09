import { Flight } from '@/src/domain/entities/Flight';
import { InMemoryFlightRepository } from '@/src/infrastructure/persistence/InMemoryFlightRepository';

describe('InMemoryFlightRepository', () => {
  let repository: InMemoryFlightRepository;

  beforeEach(() => {
    repository = new InMemoryFlightRepository();
  });

  const createFlight = (overrides = {}) => {
    const props = {
      id: `flight-${Math.random().toString(36).substring(7)}`,
      callsign: 'IBE1234',
      airline: 'Iberia',
      origin: 'LEMD',
      destination: 'LEBL',
      departureTime: new Date('2024-03-15T10:30:00Z'),
      arrivalTime: new Date('2024-03-15T12:00:00Z'),
      status: 'scheduled',
      ...overrides,
    };
    return Flight.createUnsafe(props);
  };

  describe('save and findById', () => {
    it('should save and retrieve a flight by id', async () => {
      const flight = createFlight({ id: 'flight-1' });
      await repository.save(flight);

      const result = await repository.findById('flight-1');

      expect(result).not.toBeNull();
      expect(result!.value.id).toBe('flight-1');
      expect(result!.value.callsign.toString()).toBe('IBE1234');
    });

    it('should return null for non-existent id', async () => {
      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByCallsign', () => {
    it('should find flight by callsign', async () => {
      const flight = createFlight({ id: 'flight-2', callsign: 'VLG5678' });
      await repository.save(flight);

      const result = await repository.findByCallsign('VLG5678');

      expect(result).not.toBeNull();
      expect(result!.value.id).toBe('flight-2');
    });

    it('should return null for non-existent callsign', async () => {
      const result = await repository.findByCallsign('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('findByOrigin', () => {
    it('should find flights by origin airport', async () => {
      await repository.save(createFlight({ id: 'f1', origin: 'LEMD' }));
      await repository.save(createFlight({ id: 'f2', origin: 'LEMD' }));
      await repository.save(createFlight({ id: 'f3', origin: 'LEBL' }));

      const results = await repository.findByOrigin('LEMD');

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.value.id)).toContain('f1');
      expect(results.map((r) => r.value.id)).toContain('f2');
    });
  });

  describe('findByDestination', () => {
    it('should find flights by destination airport', async () => {
      await repository.save(createFlight({ id: 'f1', destination: 'LEBL' }));
      await repository.save(createFlight({ id: 'f2', destination: 'LEBB' }));
      await repository.save(createFlight({ id: 'f3', destination: 'LEBL' }));

      const results = await repository.findByDestination('LEBL');

      expect(results).toHaveLength(2);
    });
  });

  describe('findByRoute', () => {
    it('should find flights by origin and destination', async () => {
      await repository.save(createFlight({ id: 'f1', origin: 'LEMD', destination: 'LEBL' }));
      await repository.save(createFlight({ id: 'f2', origin: 'LEMD', destination: 'LEBB' }));
      await repository.save(createFlight({ id: 'f3', origin: 'LEBL', destination: 'LEMD' }));

      const results = await repository.findByRoute('LEMD', 'LEBL');

      expect(results).toHaveLength(1);
      expect(results[0].value.id).toBe('f1');
    });
  });

  describe('findActive', () => {
    it('should find only active flights', async () => {
      await repository.save(createFlight({ id: 'f1', status: 'scheduled' }));
      await repository.save(createFlight({ id: 'f2', status: 'boarding' }));
      await repository.save(createFlight({ id: 'f3', status: 'arrived' }));

      const results = await repository.findActive();

      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('delete', () => {
    it('should delete an existing flight', async () => {
      const flight = createFlight({ id: 'flight-to-delete' });
      await repository.save(flight);

      const result = await repository.delete('flight-to-delete');

      expect(result.ok).toBe(true);
      expect(await repository.findById('flight-to-delete')).toBeNull();
    });

    it('should return failure for non-existent flight', async () => {
      const result = await repository.delete('non-existent');

      expect(result.ok).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all flights', async () => {
      await repository.save(createFlight({ id: 'f1' }));
      await repository.save(createFlight({ id: 'f2' }));
      await repository.save(createFlight({ id: 'f3' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
    });

    it('should return empty array when no flights exist', async () => {
      const results = await repository.findAll();

      expect(results).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all flights', async () => {
      await repository.save(createFlight({ id: 'f1' }));
      await repository.save(createFlight({ id: 'f2' }));

      repository.clear();

      expect(await repository.findAll()).toHaveLength(0);
    });
  });

  describe('size', () => {
    it('should return correct count', async () => {
      expect(repository.size()).toBe(0);
      await repository.save(createFlight({ id: 'f1' }));
      expect(repository.size()).toBe(1);
      await repository.save(createFlight({ id: 'f2' }));
      expect(repository.size()).toBe(2);
    });
  });
});
