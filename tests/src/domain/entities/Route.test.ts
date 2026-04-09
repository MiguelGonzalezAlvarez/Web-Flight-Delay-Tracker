import { Route } from '@/src/domain/entities/Route';

describe('Route', () => {
  describe('create', () => {
    it('should create a valid route', () => {
      const result = Route.create({ origin: 'LEMD', destination: 'LEBL' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.origin.toString()).toBe('LEMD');
        expect(result.value.destination.toString()).toBe('LEBL');
      }
    });

    it('should return failure when origin equals destination', () => {
      const result = Route.create({ origin: 'LEMD', destination: 'LEMD' });

      expect(result.ok).toBe(false);
    });

    it('should return failure when origin is missing', () => {
      const result = Route.create({ origin: '', destination: 'LEBL' });

      expect(result.ok).toBe(false);
    });

    it('should return failure when destination is missing', () => {
      const result = Route.create({ origin: 'LEMD', destination: '' });

      expect(result.ok).toBe(false);
    });
  });

  describe('equals', () => {
    it('should be equal for same origin and destination', () => {
      const route1 = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });
      const route2 = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });

      expect(route1.equals(route2)).toBe(true);
    });

    it('should not be equal for different routes', () => {
      const route1 = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });
      const route2 = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBB' });

      expect(route1.equals(route2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format route as origin → destination', () => {
      const route = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });

      expect(route.toString()).toBe('LEMD → LEBL');
    });
  });

  describe('toCompactString', () => {
    it('should format route as origin-destination', () => {
      const route = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });

      expect(route.toCompactString()).toBe('LEMD-LEBL');
    });
  });

  describe('isDomestic', () => {
    it('should return true for domestic routes', () => {
      const route = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });

      expect(route.isDomestic()).toBe(true);
    });

    it('should return false for international routes', () => {
      const route = Route.createUnsafe({ origin: 'LEMD', destination: 'LFPG' });

      expect(route.isDomestic()).toBe(false);
    });
  });

  describe('isInterIsland', () => {
    it('should return true for inter-island routes (Mainland to Canary Islands)', () => {
      const route = Route.createUnsafe({ origin: 'LEMD', destination: 'GCLP' });

      expect(route.isInterIsland()).toBe(true);
    });

    it('should return true for routes from Canary Islands to Mainland', () => {
      const route = Route.createUnsafe({ origin: 'GCXO', destination: 'LEMD' });

      expect(route.isInterIsland()).toBe(true);
    });

    it('should return false for domestic mainland routes', () => {
      const route = Route.createUnsafe({ origin: 'LEMD', destination: 'LEBL' });

      expect(route.isInterIsland()).toBe(false);
    });
  });
});
